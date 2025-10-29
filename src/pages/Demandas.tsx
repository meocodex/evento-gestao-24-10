import { useState, useMemo, useCallback } from 'react';
import { FiltroDemandas } from '@/types/demandas';
import { useDemandas } from '@/hooks/demandas';
import { Demanda, StatusDemanda, PrioridadeDemanda } from '@/types/demandas';
import { DemandaCard } from '@/components/demandas/DemandaCard';
import { DemandasVirtualList } from '@/components/demandas/DemandasVirtualList';
import { DemandaFiltersPopover, DemandaFiltersType } from '@/components/demandas/DemandaFiltersPopover';
import { NovaDemandaSheet } from '@/components/demandas/NovaDemandaSheet';
import { NovaDemandaReembolsoDialog } from '@/components/demandas/NovaDemandaReembolsoDialog';
import { EditarDemandaDialog } from '@/components/demandas/EditarDemandaDialog';
import { DetalhesDemandaDialog } from '@/components/demandas/DetalhesDemandaDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Clock, AlertTriangle, XCircle, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

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
  const [dialogDetalhes, setDialogDetalhes] = useState(false);
  const [dialogEditar, setDialogEditar] = useState(false);
  const [dialogExcluir, setDialogExcluir] = useState(false);

  const handleDetalhes = (demanda: Demanda) => {
    setDemandaSelecionada(demanda);
    setDialogDetalhes(true);
  };

  const handleEditar = (demanda: Demanda) => {
    setDemandaSelecionada(demanda);
    setDialogEditar(true);
  };

  const handleExcluir = (demanda: Demanda) => {
    setDemandaSelecionada(demanda);
    setDialogExcluir(true);
  };

  const confirmarExclusao = async () => {
    if (demandaSelecionada) {
      try {
        await excluirDemanda.mutateAsync(demandaSelecionada.id);
      } finally {
        setDialogExcluir(false);
        setDemandaSelecionada(null);
      }
    }
  };

  return (
    <div className="min-h-screen p-6 bg-navy-50 dark:bg-navy-950">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-900 dark:text-navy-50">Demandas</h1>
            <p className="text-sm sm:text-base text-navy-600 dark:text-navy-400 mt-1">Gerencie todas as solicitações e tarefas da equipe</p>
          </div>
          <div className="flex gap-2">
            <DemandaFiltersPopover filters={filtros} onFiltersChange={setFiltros} />
            <NovaDemandaSheet />
            <NovaDemandaReembolsoDialog />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Busca */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Lista de Demandas */}
        <div className="space-y-4">
            {demandasFiltradas.length === 0 ? (
              <Card className="p-12">
                <div className="text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhuma demanda encontrada</p>
                  <p className="text-sm">Ajuste os filtros ou crie uma nova demanda</p>
                </div>
              </Card>
            ) : (
              <>
                <DemandasVirtualList
                  demandas={demandasFiltradas}
                  onDetalhes={handleDetalhes}
                  onEditar={handleEditar}
                  onExcluir={handleExcluir}
                />
                
                {/* Paginação */}
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setPage(Math.max(1, page - 1))}
                        className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNumber = i + 1;
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            onClick={() => setPage(pageNumber)}
                            isActive={page === pageNumber}
                            className="cursor-pointer"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </>
            )}
        </div>
      </div>

      {/* Dialogs */}
      <DetalhesDemandaDialog
        demanda={demandaSelecionada}
        open={dialogDetalhes}
        onOpenChange={setDialogDetalhes}
      />

      <EditarDemandaDialog
        demanda={demandaSelecionada}
        open={dialogEditar}
        onOpenChange={setDialogEditar}
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
