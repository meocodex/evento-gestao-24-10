import { useMemo, lazy, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Line, Bar, Cell, Pie, Area } from 'recharts';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ContaPagar, ContaReceber } from '@/types/financeiro';

// Lazy load dos componentes de chart pesados
const LazyLineChart = lazy(() => import('recharts').then(m => ({ default: m.LineChart })));
const LazyBarChart = lazy(() => import('recharts').then(m => ({ default: m.BarChart })));
const LazyPieChart = lazy(() => import('recharts').then(m => ({ default: m.PieChart })));
const LazyAreaChart = lazy(() => import('recharts').then(m => ({ default: m.AreaChart })));

interface FinanceiroChartsProps {
  contasPagar: ContaPagar[];
  contasReceber: ContaReceber[];
  meses?: number;
}

const COLORS = {
  receitas: 'hsl(142, 76%, 36%)',
  despesas: 'hsl(0, 84%, 60%)',
  saldo: 'hsl(221, 83%, 53%)',
  categorias: [
    'hsl(221, 83%, 53%)',
    'hsl(142, 76%, 36%)',
    'hsl(45, 93%, 47%)',
    'hsl(280, 68%, 60%)',
    'hsl(0, 84%, 60%)',
    'hsl(199, 89%, 48%)',
  ],
};

function ChartSkeleton({ height = 300 }: { height?: number }) {
  return <Skeleton className="w-full rounded-lg" style={{ height }} />;
}

export function FluxoCaixaChart({ contasPagar, contasReceber, meses = 6 }: FinanceiroChartsProps) {
  const dados = useMemo(() => {
    const hoje = new Date();
    const mesesIntervalo = eachMonthOfInterval({
      start: startOfMonth(subMonths(hoje, meses - 1)),
      end: endOfMonth(hoje),
    });

    return mesesIntervalo.map((mes) => {
      const inicioMes = startOfMonth(mes);
      const fimMes = endOfMonth(mes);

      const receitas = contasReceber
        .filter(c => {
          const dataRef = c.data_recebimento || c.data_vencimento;
          const data = parseISO(dataRef);
          return isWithinInterval(data, { start: inicioMes, end: fimMes });
        })
        .reduce((sum, c) => sum + Number(c.valor), 0);

      const despesas = contasPagar
        .filter(c => {
          const dataRef = c.data_pagamento || c.data_vencimento;
          const data = parseISO(dataRef);
          return isWithinInterval(data, { start: inicioMes, end: fimMes });
        })
        .reduce((sum, c) => sum + Number(c.valor), 0);

      return {
        mes: format(mes, 'MMM/yy', { locale: ptBR }),
        receitas,
        despesas,
        saldo: receitas - despesas,
      };
    });
  }, [contasPagar, contasReceber, meses]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Fluxo de Caixa</CardTitle>
        <CardDescription>Evolução de receitas e despesas nos últimos {meses} meses</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<ChartSkeleton />}>
          <ResponsiveContainer width="100%" height={300}>
            <LazyAreaChart data={dados} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.receitas} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.receitas} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.despesas} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.despesas} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="mes" className="text-xs fill-muted-foreground" />
              <YAxis tickFormatter={formatCurrency} className="text-xs fill-muted-foreground" />
              <Tooltip
                formatter={(value: number | string | Array<number | string>) => formatCurrency(Number(value))}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="receitas"
                name="Receitas"
                stroke={COLORS.receitas}
                fillOpacity={1}
                fill="url(#colorReceitas)"
              />
              <Area
                type="monotone"
                dataKey="despesas"
                name="Despesas"
                stroke={COLORS.despesas}
                fillOpacity={1}
                fill="url(#colorDespesas)"
              />
              <Line
                type="monotone"
                dataKey="saldo"
                name="Saldo"
                stroke={COLORS.saldo}
                strokeWidth={2}
                dot={{ fill: COLORS.saldo }}
              />
            </LazyAreaChart>
          </ResponsiveContainer>
        </Suspense>
      </CardContent>
    </Card>
  );
}

export function DespesasPorCategoriaChart({ contasPagar }: { contasPagar: ContaPagar[] }) {
  const dados = useMemo(() => {
    const porCategoria = contasPagar.reduce((acc, conta) => {
      const cat = conta.categoria || 'Outros';
      acc[cat] = (acc[cat] || 0) + Number(conta.valor);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(porCategoria)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [contasPagar]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const total = dados.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Despesas por Categoria</CardTitle>
        <CardDescription>Distribuição das despesas por categoria</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<ChartSkeleton height={250} />}>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={250}>
              <LazyPieChart>
                <Pie
                  data={dados}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {dados.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.categorias[index % COLORS.categorias.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number | string | Array<number | string>) => formatCurrency(Number(value))} />
              </LazyPieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {dados.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS.categorias[index % COLORS.categorias.length] }}
                    />
                    <span className="truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{formatCurrency(item.value)}</span>
                    <span className="text-muted-foreground ml-2">
                      ({((item.value / total) * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Suspense>
      </CardContent>
    </Card>
  );
}

export function VencimentosProximosChart({ contasPagar, contasReceber }: FinanceiroChartsProps) {
  const dados = useMemo(() => {
    const hoje = new Date();
    const proximosDias: { dia: string; pagar: number; receber: number }[] = [];

    for (let i = 0; i <= 30; i += 5) {
      const diaInicio = new Date(hoje);
      diaInicio.setDate(hoje.getDate() + i);
      const diaFim = new Date(hoje);
      diaFim.setDate(hoje.getDate() + i + 4);

      const pagar = contasPagar
        .filter(c => c.status === 'pendente' || c.status === 'vencido')
        .filter(c => {
          const data = parseISO(c.data_vencimento);
          return isWithinInterval(data, { start: diaInicio, end: diaFim });
        })
        .reduce((sum, c) => sum + Number(c.valor), 0);

      const receber = contasReceber
        .filter(c => c.status === 'pendente' || c.status === 'vencido')
        .filter(c => {
          const data = parseISO(c.data_vencimento);
          return isWithinInterval(data, { start: diaInicio, end: diaFim });
        })
        .reduce((sum, c) => sum + Number(c.valor), 0);

      proximosDias.push({
        dia: i === 0 ? 'Hoje-4d' : `${i}-${i + 4}d`,
        pagar,
        receber,
      });
    }

    return proximosDias;
  }, [contasPagar, contasReceber]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Projeção de Vencimentos</CardTitle>
        <CardDescription>Contas a vencer nos próximos 30 dias</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<ChartSkeleton height={200} />}>
          <ResponsiveContainer width="100%" height={200}>
            <LazyBarChart data={dados} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="dia" className="text-xs fill-muted-foreground" />
              <YAxis tickFormatter={formatCurrency} className="text-xs fill-muted-foreground" />
              <Tooltip
                formatter={(value: number | string | Array<number | string>) => formatCurrency(Number(value))}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
              <Bar dataKey="receber" name="A Receber" fill={COLORS.receitas} radius={[4, 4, 0, 0]} />
              <Bar dataKey="pagar" name="A Pagar" fill={COLORS.despesas} radius={[4, 4, 0, 0]} />
            </LazyBarChart>
          </ResponsiveContainer>
        </Suspense>
      </CardContent>
    </Card>
  );
}
