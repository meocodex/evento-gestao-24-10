import { Evento } from '@/types/eventos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface FinanceiroEventoProps {
  evento: Evento;
  permissions: any;
}

export function FinanceiroEvento({ evento }: FinanceiroEventoProps) {
  const totalReceitas = evento.financeiro.receitas.reduce((sum, r) => sum + r.valor, 0);
  const totalDespesas = evento.financeiro.despesas.reduce((sum, d) => sum + d.valor, 0);
  const totalCobrancas = evento.financeiro.cobrancas.reduce((sum, c) => sum + c.valor, 0);
  const lucro = totalReceitas - totalDespesas - totalCobrancas;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold text-green-600">
                R$ {totalReceitas.toLocaleString('pt-BR')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold text-red-600">
                R$ {totalDespesas.toLocaleString('pt-BR')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cobranças</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              R$ {totalCobrancas.toLocaleString('pt-BR')}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lucro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className={`text-2xl font-bold ${lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {lucro.toLocaleString('pt-BR')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receitas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {evento.financeiro.receitas.map((receita) => (
              <div key={receita.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-medium">{receita.descricao}</p>
                  <p className="text-sm text-muted-foreground">{receita.tipo}</p>
                </div>
                <span className="font-bold text-green-600">R$ {receita.valor.toLocaleString('pt-BR')}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {evento.financeiro.despesas.map((despesa) => (
              <div key={despesa.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-medium">{despesa.descricao}</p>
                  <p className="text-sm text-muted-foreground">{despesa.categoria}</p>
                </div>
                <span className="font-bold text-red-600">R$ {despesa.valor.toLocaleString('pt-BR')}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
