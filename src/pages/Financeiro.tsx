import { useMemo, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, ArrowUpRight, ArrowDownRight, Eye, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEventos } from '@/contexts/EventosContext';
import { useDemandasContext } from '@/contexts/DemandasContext';
import { Evento } from '@/types/eventos';
import { EventoDetailsDialog } from '@/components/eventos/EventoDetailsDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Financeiro() {
  const { eventos } = useEventos();
  const { demandas } = useDemandasContext();
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const stats = useMemo(() => {
    // Receitas dos eventos
    const receitasEventos = eventos.reduce((acc, evento) => {
      const receitas = evento.financeiro?.receitas || [];
      return acc + receitas.reduce((sum, r) => sum + r.valor, 0);
    }, 0);

    // Despesas dos eventos
    const despesasEventos = eventos.reduce((acc, evento) => {
      const despesas = evento.financeiro?.despesas || [];
      return acc + despesas.reduce((sum, d) => sum + d.valor, 0);
    }, 0);

    // Reembolsos pagos
    const reembolsosPagos = demandas
      .filter(d => d.categoria === 'reembolso' && d.dadosReembolso?.statusPagamento === 'pago')
      .reduce((acc, d) => acc + (d.dadosReembolso?.valorTotal || 0), 0);

    // Reembolsos pendentes
    const reembolsosPendentes = demandas
      .filter(d => d.categoria === 'reembolso' && d.dadosReembolso?.statusPagamento === 'aprovado')
      .reduce((acc, d) => acc + (d.dadosReembolso?.valorTotal || 0), 0);

    const totalReceitas = receitasEventos;
    const totalDespesas = despesasEventos + reembolsosPagos;
    const lucro = totalReceitas - totalDespesas;
    const margemLucro = totalReceitas > 0 ? (lucro / totalReceitas) * 100 : 0;

    return {
      totalReceitas,
      totalDespesas,
      lucro,
      margemLucro,
      reembolsosPagos,
      reembolsosPendentes,
    };
  }, [eventos, demandas]);

  const eventosFinanceiros = useMemo(() => {
    return eventos.map(evento => {
      const receitas = evento.financeiro?.receitas || [];
      const despesas = evento.financeiro?.despesas || [];
      const totalReceita = receitas.reduce((sum, r) => sum + r.valor, 0);
      const totalDespesa = despesas.reduce((sum, d) => sum + d.valor, 0);
      const lucro = totalReceita - totalDespesa;

      return {
        id: evento.id,
        nome: evento.nome,
        data: evento.dataInicio,
        receita: totalReceita,
        despesa: totalDespesa,
        lucro,
        status: evento.status,
      };
    }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [eventos]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground">Visão consolidada das finanças</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Receitas Totais
                </CardTitle>
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalReceitas)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                De {eventos.length} eventos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Despesas Totais
                </CardTitle>
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.totalDespesas)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Incluindo reembolsos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Lucro Líquido
                </CardTitle>
                {stats.lucro >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.lucro)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Margem: {stats.margemLucro.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Reembolsos Pendentes
                </CardTitle>
                <DollarSign className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(stats.reembolsosPendentes)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                A serem pagos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="eventos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="eventos">Por Evento</TabsTrigger>
            <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
            <TabsTrigger value="reembolsos">Reembolsos</TabsTrigger>
          </TabsList>

          <TabsContent value="eventos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resultado por Evento</CardTitle>
                <CardDescription>Receitas, despesas e lucro de cada evento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventosFinanceiros.map((evento) => (
                    <div
                      key={evento.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                      onClick={() => {
                        const eventoCompleto = eventos.find(e => e.id === evento.id);
                        if (eventoCompleto) {
                          setSelectedEvento(eventoCompleto);
                          setDetailsOpen(true);
                        }
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-semibold">{evento.nome}</h4>
                          <Badge variant={evento.status === 'finalizado' ? 'default' : 'secondary'}>
                            {evento.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(evento.data), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="grid grid-cols-4 gap-6 text-right items-center">
                        <div>
                          <p className="text-xs text-muted-foreground">Receita</p>
                          <p className="font-semibold text-green-600">{formatCurrency(evento.receita)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Despesa</p>
                          <p className="font-semibold text-red-600">{formatCurrency(evento.despesa)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Lucro</p>
                          <p className={`font-semibold ${evento.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(evento.lucro)}
                          </p>
                        </div>
                        <div>
                          <Button size="sm" variant="ghost" onClick={(e) => {
                            e.stopPropagation();
                            const eventoCompleto = eventos.find(e => e.id === evento.id);
                            if (eventoCompleto) {
                              setSelectedEvento(eventoCompleto);
                              setDetailsOpen(true);
                            }
                          }}>
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {eventosFinanceiros.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum evento cadastrado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fluxo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fluxo de Caixa</CardTitle>
                <CardDescription>Entradas e saídas consolidadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Total de Entradas</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(stats.totalReceitas)}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Total de Saídas</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(stats.totalDespesas)}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-accent/50">
                    <p className="text-sm text-muted-foreground mb-1">Saldo</p>
                    <p className={`text-3xl font-bold ${stats.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(stats.lucro)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reembolsos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reembolsos</CardTitle>
                <CardDescription>Lista completa de reembolsos solicitados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Reembolsos Pagos</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(stats.reembolsosPagos)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {demandas.filter(d => d.categoria === 'reembolso' && d.dadosReembolso?.statusPagamento === 'pago').length} reembolsos
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Pendentes de Pagamento</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(stats.reembolsosPendentes)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {demandas.filter(d => d.categoria === 'reembolso' && d.dadosReembolso?.statusPagamento === 'aprovado').length} reembolsos
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {demandas
                    .filter(d => d.categoria === 'reembolso')
                    .map(demanda => (
                      <div key={demanda.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{demanda.titulo}</h4>
                            <p className="text-sm text-muted-foreground">
                              Solicitante: {demanda.dadosReembolso?.membroEquipeNome}
                            </p>
                            {demanda.eventoNome && (
                              <p className="text-xs text-muted-foreground">
                                Evento: {demanda.eventoNome}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">
                              {formatCurrency(demanda.dadosReembolso?.valorTotal || 0)}
                            </p>
                            <Badge variant={
                              demanda.dadosReembolso?.statusPagamento === 'pago' ? 'default' :
                              demanda.dadosReembolso?.statusPagamento === 'aprovado' ? 'secondary' :
                              demanda.dadosReembolso?.statusPagamento === 'recusado' ? 'destructive' :
                              'outline'
                            }>
                              {demanda.dadosReembolso?.statusPagamento || 'Pendente'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Receipt className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {demanda.dadosReembolso?.itens.length || 0} itens
                          </span>
                        </div>
                      </div>
                    ))}
                  {demandas.filter(d => d.categoria === 'reembolso').length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum reembolso cadastrado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedEvento && (
          <EventoDetailsDialog
            evento={selectedEvento}
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
          />
        )}
      </div>
    </div>
  );
}
