import { useState } from 'react';
import { useDemandasContext } from '@/contexts/DemandasContext';
import { Demanda } from '@/types/demandas';
import { DemandaCard } from '@/components/demandas/DemandaCard';
import { DemandaFilters } from '@/components/demandas/DemandaFilters';
import { NovaDemandaDialog } from '@/components/demandas/NovaDemandaDialog';
import { NovaDemandaReembolsoDialog } from '@/components/demandas/NovaDemandaReembolsoDialog';
import { EditarDemandaDialog } from '@/components/demandas/EditarDemandaDialog';
import { DetalhesDemandaDialog } from '@/components/demandas/DetalhesDemandaDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card } from '@/components/ui/card';
import { Bell, Clock, AlertTriangle, Archive, XCircle } from 'lucide-react';

export default function Demandas() {
  const { getDemandasFiltradas, getEstatisticas, excluirDemanda } = useDemandasContext();
  const demandasFiltradas = getDemandasFiltradas();
  const estatisticas = getEstatisticas();

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

  const confirmarExclusao = () => {
    if (demandaSelecionada) {
      excluirDemanda(demandaSelecionada.id);
      setDialogExcluir(false);
      setDemandaSelecionada(null);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-navy-50 dark:bg-navy-950">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-navy-900 dark:text-navy-50">Demandas</h1>
            <p className="text-navy-600 dark:text-navy-400 mt-1">Gerencie todas as solicitações e tarefas da equipe</p>
          </div>
          <div className="flex gap-2">
            <NovaDemandaDialog />
            <NovaDemandaReembolsoDialog />
          </div>
        </div>

        {/* Stats Cards Navy */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total"
            value={estatisticas.total}
            icon={Bell}
            variant="default"
          />
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
          <StatCard
            title="Arquivadas"
            value={estatisticas.arquivadas}
            icon={Archive}
            variant="default"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filtros */}
          <div className="lg:col-span-1">
            <DemandaFilters />
          </div>

          {/* Lista de Demandas */}
          <div className="lg:col-span-3 space-y-4">
            {demandasFiltradas.length === 0 ? (
              <Card className="p-12">
                <div className="text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhuma demanda encontrada</p>
                  <p className="text-sm">Ajuste os filtros ou crie uma nova demanda</p>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4">
                {demandasFiltradas.map((demanda) => (
                  <DemandaCard
                    key={demanda.id}
                    demanda={demanda}
                    onDetalhes={() => handleDetalhes(demanda)}
                    onEditar={() => handleEditar(demanda)}
                    onExcluir={() => handleExcluir(demanda)}
                  />
                ))}
              </div>
            )}
          </div>
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
