import { useMemo, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, ArrowUpRight, ArrowDownRight, Eye, Receipt, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('eventos');

  const [detalhesContaPagar, setDetalhesContaPagar] = useState<ContaPagar | null>(null);
  const [editarContaPagar, setEditarContaPagar] = useState<ContaPagar | null>(null);
  const [detalhesContaReceber, setDetalhesContaReceber] = useState<ContaReceber | null>(null);
  const [editarContaReceber, setEditarContaReceber] = useState<ContaReceber | null>(null);

  const [buscaGlobal, setBuscaGlobal] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [periodoRange, setPeriodoRange] = useState<DateRange | undefined>(undefined);

  const contasPagarFiltradas = useMemo(() => {
    return contasPagar.filter(conta => {
      if (periodoRange?.from && periodoRange?.to) {
        const dataVenc = parseISO(conta.data_vencimento);
        if (!isWithinInterval(dataVenc, { start: periodoRange.from, end: periodoRange.to })) {
          return false;
        }
      }
      if (statusFiltro !== 'todos' && conta.status !== statusFiltro) return false;
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
      if (periodoRange?.from && periodoRange?.to) {
        const dataVenc = parseISO(conta.data_vencimento);
        if (!isWithinInterval(dataVenc, { start: periodoRange.from, end: periodoRange.to })) {
          return false;
        }
      }
      const statusMatch = statusFiltro === 'todos' || 
        (statusFiltro === 'pago' ? conta.status === 'recebido' : conta.status === statusFiltro);
      if (!statusMatch) return false;
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

  const stats = useMemo(() => {
    const receitasEventos = eventos.reduce((acc, evento) => {
      const receitas = evento.financeiro?.receitas || [];
      return acc + receitas.reduce((sum, r) => sum + r.valor, 0);
    }, 0);

    const despesasEventos = eventos.reduce((acc, evento) => {
      const despesas = evento.financeiro?.despesas || [];
      return acc + despesas.reduce((sum, d) => sum + d.valor, 0);
    }, 0);

    const reembolsosPagos = demandasReembolso
      .filter(d => d.dadosReembolso?.statusPagamento === 'pago')
      .reduce((acc, d) => acc + (d.dadosReembolso?.valorTotal || 0), 0);

    const reembolsosPendentes = demandasReembolso
      .filter(d => d.dadosReembolso?.statusPagamento === 'aprovado')
      .reduce((acc, d) => acc + (d.dadosReembolso?.valorTotal || 0), 0);

    const reembolsosCount = demandasReembolso
      .filter(d => d.dadosReembolso?.statusPagamento === 'aprovado').length;

    // Contas a receber já recebidas
    const contasReceberRecebidas = contasReceber
      .filter(c => c.status === 'recebido')
      .reduce((sum, c) => sum + Number(c.valor), 0);

    // Contas a pagar já pagas
    const contasPagarPagas = contasPagar
      .filter(c => c.status === 'pago')
      .reduce((sum, c) => sum + Number(c.valor), 0);

    const totalReceitas = receitasEventos + contasReceberRecebidas;
    const totalDespesas = despesasEventos + reembolsosPagos + contasPagarPagas;
    const lucro = totalReceitas - totalDespesas;
    const margemLucro = totalReceitas > 0 ? (lucro / totalReceitas) * 100 : 0;

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

  const eventosFinanceirosFiltrados = useMemo(() => {
    return eventosFinanceiros.filter(evento => {
      if (buscaGlobal) {
        const busca = buscaGlobal.toLowerCase();
        if (!evento.nome.toLowerCase().includes(busca)) return false;
      }
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
    <div className="min-h-full overflow-x-hidden">
      <div className="w-full px-3 sm:px-6 py-4 sm:py-6 space-y-4 animate-fade-in bg-background">
        {/* Stats Cards - Desktop only */}
        <div className="hidden md:grid md:grid-cols-4 gap-3 sm:gap-4">
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

        {/* Single Unified Toolbar */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-3 p-2 sm:p-3 rounded-2xl glass-card">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-shrink-0">
            <TabsList className="h-8 p-0.5 bg-muted/50">
              <TabsTrigger value="eventos" className="text-xs px-2 h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Eventos</TabsTrigger>
              <TabsTrigger value="pagar" className="text-xs px-2 h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Pagar</TabsTrigger>
              <TabsTrigger value="receber" className="text-xs px-2 h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Receber</TabsTrigger>
              <TabsTrigger value="reembolsos" className="text-xs px-2 h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hidden lg:flex">Reemb.</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="hidden xl:block h-6 w-px bg-border/50" />

          {/* Search */}
          <div className="relative min-w-[100px] max-w-[140px] flex-shrink">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-8 h-8 text-xs bg-background/60"
              value={buscaGlobal}
              onChange={(e) => setBuscaGlobal(e.target.value)}
            />
          </div>

          <div className="hidden xl:block h-6 w-px bg-border/50" />

          {/* Period Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 h-8 text-xs px-2.5">
                <Calendar className="h-3.5 w-3.5" />
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

          {/* Status Filter */}
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger className="w-[90px] h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="vencido">Vencido</SelectItem>
            </SelectContent>
          </Select>

          <div className="hidden xl:block h-6 w-px bg-border/50" />

          {/* Charts & Report */}
          <FinanceiroChartsDrawer contasPagar={contasPagar} contasReceber={contasReceber} />
          <RelatorioFinanceiroDialog contasPagar={contasPagar} contasReceber={contasReceber} />
        </div>

        {/* Tab Contents */}
        {activeTab === 'eventos' && (
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
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(evento.data), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-8 text-right">
                      <div>
                        <p className="text-xs text-muted-foreground">Receita</p>
                        <p className="text-green-600 font-semibold">{formatCurrency(evento.receita)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Despesa</p>
                        <p className="text-red-600 font-semibold">{formatCurrency(evento.despesa)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Lucro</p>
                        <p className={`font-semibold ${evento.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(evento.lucro)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'pagar' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setDialogNovaPagar(true)} size="sm" className="gap-1 h-8 text-xs px-2.5">
                <Plus className="h-3.5 w-3.5" />
                Nova Conta a Pagar
              </Button>
            </div>
            <TabelaContasPagar
              contas={contasPagarFiltradas}
              onDetalhes={handleDetalhesContaPagar}
              onEditar={handleEditarContaPagar}
              onMarcarPago={handleMarcarPago}
              onExcluir={handleExcluirPagar}
            />
          </div>
        )}

        {activeTab === 'receber' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setDialogNovaReceber(true)} size="sm" className="gap-1 h-8 text-xs px-2.5">
                <Plus className="h-3.5 w-3.5" />
                Nova Conta a Receber
              </Button>
            </div>
            <TabelaContasReceber
              contas={contasReceberFiltradas}
              onDetalhes={handleDetalhesContaReceber}
              onEditar={handleEditarContaReceber}
              onMarcarRecebido={handleMarcarRecebido}
              onExcluir={handleExcluirReceber}
            />
          </div>
        )}

        {activeTab === 'reembolsos' && (
          <Card className="smooth-hover">
            <CardHeader>
              <CardTitle>Reembolsos Pendentes</CardTitle>
              <CardDescription>{stats.reembolsosCount} reembolsos aguardando pagamento</CardDescription>
            </CardHeader>
            <CardContent>
              {demandasReembolso
                .filter(d => d.dadosReembolso?.statusPagamento === 'aprovado')
                .map((demanda) => (
                  <div key={demanda.id} className="flex items-center justify-between p-4 border rounded-lg mb-2">
                    <div>
                      <h4 className="font-medium">{demanda.titulo}</h4>
                      <p className="text-sm text-muted-foreground">{demanda.solicitante}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        {formatCurrency(demanda.dadosReembolso?.valorTotal || 0)}
                      </p>
                      <Badge variant="secondary">Aprovado</Badge>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs and Sheets */}
      {selectedEvento && (
        <EventoDetailsSheet
          evento={selectedEvento}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}

      <NovaContaPagarSheet open={dialogNovaPagar} onOpenChange={setDialogNovaPagar} />
      <NovaContaReceberSheet open={dialogNovaReceber} onOpenChange={setDialogNovaReceber} />

      {detalhesContaPagar && (
        <DetalhesContaPagarSheet
          open={!!detalhesContaPagar}
          onOpenChange={(open) => !open && setDetalhesContaPagar(null)}
          conta={detalhesContaPagar}
          onEditar={() => {
            setDetalhesContaPagar(null);
            setEditarContaPagar(detalhesContaPagar);
          }}
          onMarcarPago={() => {
            setContaSelecionada(detalhesContaPagar);
            setDialogMarcarPago(true);
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
          open={!!editarContaPagar}
          onOpenChange={(open) => !open && setEditarContaPagar(null)}
          conta={editarContaPagar}
        />
      )}

      {detalhesContaReceber && (
        <DetalhesContaReceberSheet
          open={!!detalhesContaReceber}
          onOpenChange={(open) => !open && setDetalhesContaReceber(null)}
          conta={detalhesContaReceber}
          onEditar={() => {
            setDetalhesContaReceber(null);
            setEditarContaReceber(detalhesContaReceber);
          }}
          onMarcarRecebido={() => {
            setContaSelecionada(detalhesContaReceber);
            setDialogMarcarRecebido(true);
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
          open={!!editarContaReceber}
          onOpenChange={(open) => !open && setEditarContaReceber(null)}
          conta={editarContaReceber}
        />
      )}

      <MarcarPagoDialog
        open={dialogMarcarPago}
        onOpenChange={setDialogMarcarPago}
        conta={contaSelecionada as ContaPagar}
        onConfirm={(data) => {
          if (contaSelecionada) {
            marcarComoPago.mutate({ id: contaSelecionada.id, ...data });
          }
          setDialogMarcarPago(false);
        }}
      />

      <MarcarRecebidoDialog
        open={dialogMarcarRecebido}
        onOpenChange={setDialogMarcarRecebido}
        conta={contaSelecionada as ContaReceber}
        onConfirm={(data) => {
          if (contaSelecionada) {
            marcarComoRecebido.mutate({ id: contaSelecionada.id, ...data });
          }
          setDialogMarcarRecebido(false);
        }}
      />

      <ConfirmDialog
        open={dialogConfirmDelete}
        onOpenChange={setDialogConfirmDelete}
        onConfirm={confirmDelete}
        title={tipoContaDelete === 'pagar' ? 'Excluir Conta a Pagar' : 'Excluir Conta a Receber'}
        description="Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita."
        variant="danger"
      />
    </div>
  );
}
