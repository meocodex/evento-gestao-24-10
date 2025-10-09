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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Demandas</h1>
          <p className="text-muted-foreground">Gerencie todas as solicitações e tarefas da equipe</p>
        </div>
        <div className="flex gap-2">
          <NovaDemandaDialog />
          <NovaDemandaReembolsoDialog />
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Demandas</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Abertas</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.abertas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.emAndamento}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.urgentes}</div>
          </CardContent>
        </Card>
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
