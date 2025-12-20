import { useMemo, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, ArrowUpRight, ArrowDownRight, Eye, Receipt, Plus, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { StatCard } from '@/components/dashboard/StatCard';
import { useEventos } from '@/hooks/eventos';
import { useDemandasReembolso } from '@/hooks/demandas';
import { useContasPagar, useContasReceber } from '@/hooks/financeiro';
import { Evento } from '@/types/eventos';
import type { ContaPagar, ContaReceber } from '@/types/financeiro';
import { EventoDetailsSheet } from '@/components/eventos/EventoDetailsSheet';
import { NovaContaPagarSheet } from '@/components/financeiro/NovaContaPagarSheet';
import { NovaContaReceberSheet } from '@/components/financeiro/NovaContaReceberSheet';
import { TabelaContasPagar } from '@/components/financeiro/TabelaContasPagar';
import { TabelaContasReceber } from '@/components/financeiro/TabelaContasReceber';
import { MarcarPagoDialog } from '@/components/financeiro/MarcarPagoDialog';
import { MarcarRecebidoDialog } from '@/components/financeiro/MarcarRecebidoDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { FinanceiroChartsDrawer } from '@/components/financeiro/FinanceiroChartsDrawer';
import { FinanceiroSummaryBar } from '@/components/financeiro/FinanceiroSummaryBar';
import { RelatorioFinanceiroDialog } from '@/components/financeiro/RelatorioFinanceiroDialog';
import { DetalhesContaPagarSheet } from '@/components/financeiro/DetalhesContaPagarSheet';
import { EditarContaPagarSheet } from '@/components/financeiro/EditarContaPagarSheet';
import { DetalhesContaReceberSheet } from '@/components/financeiro/DetalhesContaReceberSheet';
import { EditarContaReceberSheet } from '@/components/financeiro/EditarContaReceberSheet';
import { format, isWithinInterval, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';

export default function Financeiro() {
  const { eventos } = useEventos();
  const { data: demandasReembolso = [] } = useDemandasReembolso();
  const { contas: contasPagar, marcarComoPago, deletar: deletarContaPagar } = useContasPagar();
  const { contas: contasReceber, marcarComoRecebido, deletar: deletarContaReceber } = useContasReceber();

  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [dialogNovaPagar, setDialogNovaPagar] = useState(false);
  const [dialogNovaReceber, setDialogNovaReceber] = useState(false);
  const [dialogMarcarPago, setDialogMarcarPago] = useState(false);
  const [dialogMarcarRecebido, setDialogMarcarRecebido] = useState(false);
  const [dialogConfirmDelete, setDialogConfirmDelete] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState<ContaPagar | ContaReceber | null>(null);
  const [tipoContaDelete, setTipoContaDelete] = useState<'pagar' | 'receber'>('pagar');

  // Estados para sheets de detalhes e edição
  const [detalhesContaPagar, setDetalhesContaPagar] = useState<ContaPagar | null>(null);
  const [editarContaPagar, setEditarContaPagar] = useState<ContaPagar | null>(null);
  const [detalhesContaReceber, setDetalhesContaReceber] = useState<ContaReceber | null>(null);
  const [editarContaReceber, setEditarContaReceber] = useState<ContaReceber | null>(null);

  // Filtros globais (consolidados)
  const [buscaGlobal, setBuscaGlobal] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [periodoRange, setPeriodoRange] = useState<DateRange | undefined>(undefined);

  // Aplicar filtros às contas
  const contasPagarFiltradas = useMemo(() => {
    return contasPagar.filter(conta => {
      // Filtro por período
      if (periodoRange?.from && periodoRange?.to) {
        const dataVenc = parseISO(conta.data_vencimento);
        if (!isWithinInterval(dataVenc, { start: periodoRange.from, end: periodoRange.to })) {
          return false;
        }
      }
      // Filtro por status
      if (statusFiltro !== 'todos' && conta.status !== statusFiltro) return false;
      // Filtro por busca
      if (buscaGlobal) {
        const busca = buscaGlobal.toLowerCase();
        const matchBusca = 
          conta.descricao.toLowerCase().includes(busca) ||
          conta.fornecedor?.toLowerCase().includes(busca) ||
          conta.categoria.toLowerCase().includes(busca);
        if (!matchBusca) return false;
      }
      return true;
    });
  }, [contasPagar, periodoRange, statusFiltro, buscaGlobal]);

  const contasReceberFiltradas = useMemo(() => {
    return contasReceber.filter(conta => {
      // Filtro por período
      if (periodoRange?.from && periodoRange?.to) {
        const dataVenc = parseISO(conta.data_vencimento);
        if (!isWithinInterval(dataVenc, { start: periodoRange.from, end: periodoRange.to })) {
          return false;
        }
      }
      // Filtro por status
      const statusMatch = statusFiltro === 'todos' || 
        (statusFiltro === 'pago' ? conta.status === 'recebido' : conta.status === statusFiltro);
      if (!statusMatch) return false;
      // Filtro por busca
      if (buscaGlobal) {
        const busca = buscaGlobal.toLowerCase();
        const matchBusca = 
          conta.descricao.toLowerCase().includes(busca) ||
          conta.cliente?.toLowerCase().includes(busca) ||
          conta.tipo.toLowerCase().includes(busca);
        if (!matchBusca) return false;
      }
      return true;
    });
  }, [contasReceber, periodoRange, statusFiltro, buscaGlobal]);

  // Calcular valores pagas/recebidas no mês
  const pagasNoMes = useMemo(() => {
    const mesAtual = new Date().getMonth();
    return contasPagar
      .filter(c => c.status === 'pago' && c.data_pagamento && new Date(c.data_pagamento).getMonth() === mesAtual)
      .reduce((sum, c) => sum + Number(c.valor), 0);
  }, [contasPagar]);

  const recebidasNoMes = useMemo(() => {
    const mesAtual = new Date().getMonth();
    return contasReceber
      .filter(c => c.status === 'recebido' && c.data_recebimento && new Date(c.data_recebimento).getMonth() === mesAtual)
      .reduce((sum, c) => sum + Number(c.valor), 0);
  }, [contasReceber]);

  const stats = useMemo(() => {
    const receitasEventos = eventos.reduce((acc, evento) => {
      const receitas = evento.financeiro?.receitas || [];
      return acc + receitas.reduce((sum, r) => sum + r.valor, 0);
    }, 0);

    const despesasEventos = eventos.reduce((acc, evento) => {
      const despesas = evento.financeiro?.despesas || [];
      return acc + despesas.reduce((sum, d) => sum + d.valor, 0);
    }, 0);

    // Usar apenas demandas de reembolso (query otimizada)
    const reembolsosPagos = demandasReembolso
      .filter(d => d.dadosReembolso?.statusPagamento === 'pago')
      .reduce((acc, d) => acc + (d.dadosReembolso?.valorTotal || 0), 0);

    const reembolsosPendentes = demandasReembolso
      .filter(d => d.dadosReembolso?.statusPagamento === 'aprovado')
      .reduce((acc, d) => acc + (d.dadosReembolso?.valorTotal || 0), 0);

    const reembolsosCount = demandasReembolso
      .filter(d => d.dadosReembolso?.statusPagamento === 'aprovado').length;

    const totalReceitas = receitasEventos;
    const totalDespesas = despesasEventos + reembolsosPagos;
    const lucro = totalReceitas - totalDespesas;
    const margemLucro = totalReceitas > 0 ? (lucro / totalReceitas) * 100 : 0;

    // Estatísticas de contas
    const contasPagarPendentes = contasPagar.filter(c => c.status === 'pendente').reduce((sum, c) => sum + Number(c.valor), 0);
    const contasPagarVencidas = contasPagar.filter(c => c.status === 'vencido').reduce((sum, c) => sum + Number(c.valor), 0);
    const contasReceberPendentes = contasReceber.filter(c => c.status === 'pendente').reduce((sum, c) => sum + Number(c.valor), 0);
    const contasReceberVencidas = contasReceber.filter(c => c.status === 'vencido').reduce((sum, c) => sum + Number(c.valor), 0);

    return {
      totalReceitas,
      totalDespesas,
      lucro,
      margemLucro,
      reembolsosPagos,
      reembolsosPendentes,
      reembolsosCount,
      contasPagarPendentes,
      contasPagarVencidas,
      contasReceberPendentes,
      contasReceberVencidas,
    };
  }, [eventos, demandasReembolso, contasPagar, contasReceber]);

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

  // Filtrar eventos financeiros com filtros globais
  const eventosFinanceirosFiltrados = useMemo(() => {
    return eventosFinanceiros.filter(evento => {
      // Filtro por busca (nome do evento)
      if (buscaGlobal) {
        const busca = buscaGlobal.toLowerCase();
        if (!evento.nome.toLowerCase().includes(busca)) return false;
      }
      // Filtro por período (data do evento)
      if (periodoRange?.from && periodoRange?.to) {
        const dataEvento = new Date(evento.data);
        if (!isWithinInterval(dataEvento, { start: periodoRange.from, end: periodoRange.to })) {
          return false;
        }
      }
      return true;
    });
  }, [eventosFinanceiros, buscaGlobal, periodoRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Handlers para contas a pagar
  const handleDetalhesContaPagar = (conta: ContaPagar) => {
    setDetalhesContaPagar(conta);
  };

  const handleEditarContaPagar = (conta: ContaPagar) => {
    setEditarContaPagar(conta);
  };

  const handleMarcarPago = (conta: ContaPagar) => {
    setContaSelecionada(conta);
    setDialogMarcarPago(true);
  };

  const handleExcluirPagar = (id: string) => {
    const conta = contasPagar.find(c => c.id === id);
    setContaSelecionada(conta || null);
    setTipoContaDelete('pagar');
    setDialogConfirmDelete(true);
  };

  // Handlers para contas a receber
  const handleDetalhesContaReceber = (conta: ContaReceber) => {
    setDetalhesContaReceber(conta);
  };

  const handleEditarContaReceber = (conta: ContaReceber) => {
    setEditarContaReceber(conta);
  };

  const handleMarcarRecebido = (conta: ContaReceber) => {
    setContaSelecionada(conta);
    setDialogMarcarRecebido(true);
  };

  const handleExcluirReceber = (id: string) => {
    const conta = contasReceber.find(c => c.id === id);
    setContaSelecionada(conta || null);
    setTipoContaDelete('receber');
    setDialogConfirmDelete(true);
  };

  const confirmDelete = () => {
    if (!contaSelecionada) return;
    if (tipoContaDelete === 'pagar') {
      deletarContaPagar.mutate(contaSelecionada.id);
    } else {
      deletarContaReceber.mutate(contaSelecionada.id);
    }
    setDialogConfirmDelete(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">Financeiro</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Visão consolidada das finanças</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <FinanceiroChartsDrawer contasPagar={contasPagar} contasReceber={contasReceber} />
          <RelatorioFinanceiroDialog contasPagar={contasPagar} contasReceber={contasReceber} />
        </div>
      </div>

      {/* Stats Cards - Padronizados com StatCard */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Receitas Totais"
          value={formatCurrency(stats.totalReceitas)}
          subtitle={`De ${eventos.length} eventos`}
          icon={ArrowUpRight}
          variant="success"
        />

        <StatCard
          title="Despesas Totais"
          value={formatCurrency(stats.totalDespesas)}
          subtitle="Incluindo reembolsos"
          icon={ArrowDownRight}
          variant="danger"
        />

        <StatCard
          title="Lucro Líquido"
          value={formatCurrency(stats.lucro)}
          subtitle={`Margem: ${stats.margemLucro.toFixed(1)}%`}
          icon={stats.lucro >= 0 ? TrendingUp : TrendingDown}
          variant={stats.lucro >= 0 ? 'success' : 'danger'}
        />

        <StatCard
          title="Reembolsos Pendentes"
          value={formatCurrency(stats.reembolsosPendentes)}
          subtitle={`${stats.reembolsosCount} a serem pagos`}
          icon={DollarSign}
          variant="warning"
        />
      </div>

      {/* Tabs com filtros inline */}
      <Tabs defaultValue="eventos" className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <TabsList className="glass-card">
            <TabsTrigger value="eventos">Por Evento</TabsTrigger>
            <TabsTrigger value="pagar">Contas a Pagar</TabsTrigger>
            <TabsTrigger value="receber">Contas a Receber</TabsTrigger>
            <TabsTrigger value="reembolsos">Reembolsos</TabsTrigger>
          </TabsList>
          
          {/* Filtros inline */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={buscaGlobal}
                onChange={(e) => setBuscaGlobal(e.target.value)}
                className="pl-8 w-[180px] h-9"
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-9">
                  <Calendar className="h-4 w-4" />
                  {periodoRange?.from && periodoRange?.to
                    ? `${format(periodoRange.from, 'dd/MM')} - ${format(periodoRange.to, 'dd/MM')}`
                    : 'Período'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="range"
                  selected={periodoRange}
                  onSelect={setPeriodoRange}
                  numberOfMonths={2}
                  locale={ptBR}
                />
                <div className="p-3 border-t flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setPeriodoRange(undefined)}
                  >
                    Limpar
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => setPeriodoRange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })}
                  >
                    Mês Atual
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
              <SelectTrigger className="w-[110px] h-9">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="eventos" className="space-y-4">
          <Card className="smooth-hover">
            <CardHeader>
              <CardTitle>Resultado por Evento</CardTitle>
              <CardDescription>Receitas, despesas e lucro de cada evento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventosFinanceirosFiltrados.map((evento) => (
                  <div
                    key={evento.id}
                    className="flex items-center justify-between p-4 border rounded-lg smooth-hover cursor-pointer"
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
                        <p className="font-semibold text-success">{formatCurrency(evento.receita)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Despesa</p>
                        <p className="font-semibold text-destructive">{formatCurrency(evento.despesa)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Lucro</p>
                        <p className={`font-semibold ${evento.lucro >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {formatCurrency(evento.lucro)}
                        </p>
                      </div>
                      <div>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {eventosFinanceirosFiltrados.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    {buscaGlobal || periodoRange ? 'Nenhum evento encontrado com os filtros aplicados' : 'Nenhum evento cadastrado'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagar" className="space-y-4">
          {/* Header com barra de resumo e botão */}
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <FinanceiroSummaryBar
              pendente={stats.contasPagarPendentes}
              vencidas={stats.contasPagarVencidas}
              pagasNoMes={pagasNoMes}
              tipo="pagar"
            />
            <Button onClick={() => setDialogNovaPagar(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conta
            </Button>
          </div>


          <TabelaContasPagar
            contas={contasPagarFiltradas}
            onDetalhes={handleDetalhesContaPagar}
            onEditar={handleEditarContaPagar}
            onMarcarPago={handleMarcarPago}
            onExcluir={handleExcluirPagar}
          />
        </TabsContent>

        <TabsContent value="receber" className="space-y-4">
          {/* Header com barra de resumo e botão */}
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <FinanceiroSummaryBar
              pendente={stats.contasReceberPendentes}
              vencidas={stats.contasReceberVencidas}
              pagasNoMes={recebidasNoMes}
              tipo="receber"
            />
            <Button onClick={() => setDialogNovaReceber(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conta
            </Button>
          </div>


          <TabelaContasReceber
            contas={contasReceberFiltradas}
            onDetalhes={handleDetalhesContaReceber}
            onEditar={handleEditarContaReceber}
            onMarcarRecebido={handleMarcarRecebido}
            onExcluir={handleExcluirReceber}
          />
        </TabsContent>

        <TabsContent value="reembolsos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reembolsos</CardTitle>
              <CardDescription>Lista completa de reembolsos solicitados</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Resumo compacto em badges */}
              <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/30 border rounded-lg mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Pagos:</span>
                  <Badge variant="secondary" className="font-bold text-success">
                    {formatCurrency(stats.reembolsosPagos)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ({demandasReembolso.filter(d => d.dadosReembolso?.statusPagamento === 'pago').length})
                  </span>
                </div>
                
                <div className="h-4 w-px bg-border hidden sm:block" />
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Pendentes:</span>
                  <Badge variant="outline" className="font-bold text-warning border-warning/30">
                    {formatCurrency(stats.reembolsosPendentes)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ({stats.reembolsosCount})
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {demandasReembolso.map(demanda => (
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
                {demandasReembolso.length === 0 && (
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
        <EventoDetailsSheet
          evento={selectedEvento}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}

      <NovaContaPagarSheet open={dialogNovaPagar} onOpenChange={setDialogNovaPagar} />
      <NovaContaReceberSheet open={dialogNovaReceber} onOpenChange={setDialogNovaReceber} />

      {/* Sheets de detalhes e edição - Contas a Pagar */}
      {detalhesContaPagar && (
        <DetalhesContaPagarSheet
          conta={detalhesContaPagar}
          open={!!detalhesContaPagar}
          onOpenChange={(open) => !open && setDetalhesContaPagar(null)}
          onEditar={() => {
            setEditarContaPagar(detalhesContaPagar);
            setDetalhesContaPagar(null);
          }}
          onMarcarPago={() => {
            handleMarcarPago(detalhesContaPagar);
            setDetalhesContaPagar(null);
          }}
          onExcluir={() => {
            handleExcluirPagar(detalhesContaPagar.id);
            setDetalhesContaPagar(null);
          }}
        />
      )}

      {editarContaPagar && (
        <EditarContaPagarSheet
          conta={editarContaPagar}
          open={!!editarContaPagar}
          onOpenChange={(open) => !open && setEditarContaPagar(null)}
        />
      )}

      {/* Sheets de detalhes e edição - Contas a Receber */}
      {detalhesContaReceber && (
        <DetalhesContaReceberSheet
          conta={detalhesContaReceber}
          open={!!detalhesContaReceber}
          onOpenChange={(open) => !open && setDetalhesContaReceber(null)}
          onEditar={() => {
            setEditarContaReceber(detalhesContaReceber);
            setDetalhesContaReceber(null);
          }}
          onMarcarRecebido={() => {
            handleMarcarRecebido(detalhesContaReceber);
            setDetalhesContaReceber(null);
          }}
          onExcluir={() => {
            handleExcluirReceber(detalhesContaReceber.id);
            setDetalhesContaReceber(null);
          }}
        />
      )}

      {editarContaReceber && (
        <EditarContaReceberSheet
          conta={editarContaReceber}
          open={!!editarContaReceber}
          onOpenChange={(open) => !open && setEditarContaReceber(null)}
        />
      )}

      <MarcarPagoDialog
        open={dialogMarcarPago}
        onOpenChange={setDialogMarcarPago}
        conta={contaSelecionada as ContaPagar}
        onConfirm={(data) => marcarComoPago.mutate(data)}
      />

      <MarcarRecebidoDialog
        open={dialogMarcarRecebido}
        onOpenChange={setDialogMarcarRecebido}
        conta={contaSelecionada as ContaReceber}
        onConfirm={(data) => marcarComoRecebido.mutate(data)}
      />

      <ConfirmDialog
        open={dialogConfirmDelete}
        onOpenChange={setDialogConfirmDelete}
        onConfirm={confirmDelete}
        title="Excluir Conta"
        description={`Tem certeza que deseja excluir a conta "${contaSelecionada?.descricao}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
