import { useState, useMemo, useCallback } from 'react';
import { FiltroDemandas } from '@/types/demandas';
import { useDemandas } from '@/hooks/demandas';
import { Demanda, StatusDemanda, PrioridadeDemanda } from '@/types/demandas';
import { DemandaCard } from '@/components/demandas/DemandaCard';
import { DemandasVirtualList } from '@/components/demandas/DemandasVirtualList';
import { DemandaFiltersPopover, DemandaFiltersType } from '@/components/demandas/DemandaFiltersPopover';
import { NovaDemandaSheet } from '@/components/demandas/NovaDemandaSheet';
import { NovaDemandaReembolsoSheet } from '@/components/demandas/NovaDemandaReembolsoSheet';
import { DetalhesDemandaSheet } from '@/components/demandas/DetalhesDemandaSheet';
import { EditarDemandaSheet } from '@/components/demandas/EditarDemandaSheet';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, XCircle, Bell, Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Demandas() {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState<DemandaFiltersType>({
    status: [],
    prioridade: [],
  });
  
  const { demandas = [], totalCount = 0, excluirDemanda } = useDemandas(page, pageSize, searchTerm);
  
  // Aplicar filtros localmente
  const demandasFiltradas = useMemo(() => {
    return demandas.filter(demanda => {
      if (filtros.status.length > 0 && !filtros.status.includes(demanda.status)) return false;
      if (filtros.prioridade.length > 0 && !filtros.prioridade.includes(demanda.prioridade)) return false;
      if (filtros.responsavel && demanda.responsavel_id !== filtros.responsavel) return false;
      if (filtros.prazoVencido && demanda.prazo && new Date(demanda.prazo) >= new Date()) return false;
      if (filtros.prazoProximo) {
        const prazo = demanda.prazo ? new Date(demanda.prazo) : null;
        const hoje = new Date();
        const tresDias = new Date(hoje.getTime() + 3 * 24 * 60 * 60 * 1000);
        if (!prazo || prazo < hoje || prazo > tresDias) return false;
      }
      return true;
    });
  }, [demandas, filtros]);

  const totalPages = Math.ceil(totalCount / pageSize);
  
  const estatisticas = useMemo(() => ({
    total: demandas.length,
    abertas: demandas.filter(d => d.status === 'aberta').length,
    emAndamento: demandas.filter(d => d.status === 'em-andamento').length,
    concluidas: demandas.filter(d => d.status === 'concluida').length,
    canceladas: demandas.filter(d => d.status === 'cancelada').length,
    urgentes: demandas.filter(d => d.prioridade === 'urgente').length,
    arquivadas: demandas.filter(d => d.arquivada).length,
    prazosVencidos: demandas.filter(d => d.prazo && new Date(d.prazo) < new Date() && d.status !== 'concluida').length,
  }), [demandas]);

  const [demandaSelecionada, setDemandaSelecionada] = useState<Demanda | null>(null);
  const [sheetDetalhes, setSheetDetalhes] = useState(false);
  const [sheetEditar, setSheetEditar] = useState(false);
  const [dialogExcluir, setDialogExcluir] = useState(false);

  const confirmarExclusao = useCallback(async () => {
    if (demandaSelecionada) {
      try {
        await excluirDemanda.mutateAsync(demandaSelecionada.id);
      } finally {
        setDialogExcluir(false);
        setDemandaSelecionada(null);
      }
    }
  }, [demandaSelecionada, excluirDemanda]);

  return (
    <div className="min-h-full overflow-x-hidden">
      <div className="w-full px-3 sm:px-6 py-4 sm:py-6 space-y-4 animate-fade-in bg-background">
        {/* Stats Cards - Desktop only */}
        <div className="hidden md:grid md:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Abertas"
            value={estatisticas.abertas}
            icon={Clock}
            variant="primary"
          />
          <StatCard
            title="Em Andamento"
            value={estatisticas.emAndamento}
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="Urgentes"
            value={estatisticas.urgentes}
            icon={AlertTriangle}
            variant="danger"
          />
          <StatCard
            title="Atrasadas"
            value={estatisticas.prazosVencidos}
            icon={XCircle}
            variant="danger"
          />
        </div>

        {/* Single Unified Toolbar */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-3 p-2 sm:p-3 rounded-2xl glass-card">
          {/* Search */}
          <div className="relative min-w-[100px] max-w-[200px] flex-shrink flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-8 h-8 text-xs bg-background/60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="hidden xl:block h-6 w-px bg-border/50" />

          {/* Filters */}
          <DemandaFiltersPopover filters={filtros} onFiltersChange={setFiltros} />

          <div className="hidden xl:block h-6 w-px bg-border/50" />

          {/* Create Buttons */}
          <NovaDemandaSheet />
          <NovaDemandaReembolsoSheet />

          {/* Counter + Pagination - pushed right */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            <span className="hidden xl:flex items-center gap-1 text-xs text-muted-foreground">
              <span className="font-semibold text-primary">{demandasFiltradas.length}</span>/<span>{totalCount}</span>
            </span>

            {totalPages > 1 && (
              <>
                <div className="h-6 w-px bg-border/50" />
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-xs text-muted-foreground">{page}/{totalPages}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Lista de Demandas */}
        {demandasFiltradas.length === 0 ? (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhuma demanda encontrada</p>
              <p className="text-sm">Ajuste os filtros ou crie uma nova demanda</p>
            </div>
          </Card>
        ) : (
          <DemandasVirtualList
            demandas={demandasFiltradas}
            onClick={(demanda) => {
              setDemandaSelecionada(demanda);
              setSheetDetalhes(true);
            }}
          />
        )}
      </div>

      {/* Dialogs */}
      <DetalhesDemandaSheet
        demanda={demandaSelecionada}
        open={sheetDetalhes}
        onOpenChange={setSheetDetalhes}
        onEditar={() => {
          setSheetDetalhes(false);
          setSheetEditar(true);
        }}
      />

      <EditarDemandaSheet
        demanda={demandaSelecionada}
        open={sheetEditar}
        onOpenChange={setSheetEditar}
      />

      <ConfirmDialog
        open={dialogExcluir}
        onOpenChange={setDialogExcluir}
        onConfirm={confirmarExclusao}
        title="Excluir demanda?"
        description={`Tem certeza que deseja excluir a demanda "${demandaSelecionada?.titulo}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
