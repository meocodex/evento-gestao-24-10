import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDemandasContext } from '@/hooks/demandas';
import { Demanda } from '@/types/demandas';
import { AlertCircle, Eye, Plus, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { DetalhesDemandaDialog } from '@/components/demandas/DetalhesDemandaDialog';
import { NovaDemandaReembolsoDialog } from '@/components/demandas/NovaDemandaReembolsoDialog';

interface DemandasEventoProps {
  eventoId: string;
}

const statusConfig = {
  aberta: { label: 'Aberta', variant: 'outline' as const },
  'em-andamento': { label: 'Em Andamento', variant: 'default' as const },
  concluida: { label: 'Concluída', variant: 'secondary' as const },
  cancelada: { label: 'Cancelada', variant: 'destructive' as const },
};

const prioridadeConfig = {
  baixa: { label: 'Baixa', color: 'text-blue-600' },
  media: { label: 'Média', color: 'text-yellow-600' },
  alta: { label: 'Alta', color: 'text-orange-600' },
  urgente: { label: 'Urgente', color: 'text-red-600' },
};

export function DemandasEvento({ eventoId }: DemandasEventoProps) {
  const { getDemandasPorEvento, getDemandasReembolsoPorEvento } = useDemandasContext();
  const [demandaSelecionada, setDemandaSelecionada] = useState<Demanda | null>(null);
  const [detalhesOpen, setDetalhesOpen] = useState(false);

  const demandas = getDemandasPorEvento(eventoId);
  const demandasReembolso = getDemandasReembolsoPorEvento(eventoId);

  const estatisticas = {
    total: demandas.length,
    abertas: demandas.filter(d => d.status === 'aberta').length,
    emAndamento: demandas.filter(d => d.status === 'em-andamento').length,
    concluidas: demandas.filter(d => d.status === 'concluida').length,
  };

  const totalReembolsoPendente = demandasReembolso
    .filter(d => d.dadosReembolso?.statusPagamento === 'pendente' || d.dadosReembolso?.statusPagamento === 'aprovado')
    .reduce((sum, d) => sum + (d.dadosReembolso?.valorTotal || 0), 0);
  
  const totalReembolsoPago = demandasReembolso
    .filter(d => d.dadosReembolso?.statusPagamento === 'pago')
    .reduce((sum, d) => sum + (d.dadosReembolso?.valorTotal || 0), 0);

  const handleVerDetalhes = (demanda: Demanda) => {
    setDemandaSelecionada(demanda);
    setDetalhesOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <NovaDemandaReembolsoDialog eventoId={eventoId} />
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{estatisticas.total}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-yellow-600">{estatisticas.abertas}</div>
          <div className="text-sm text-muted-foreground">Abertas</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{estatisticas.emAndamento}</div>
          <div className="text-sm text-muted-foreground">Em Andamento</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{estatisticas.concluidas}</div>
          <div className="text-sm text-muted-foreground">Concluídas</div>
        </Card>
        <Card className="p-4 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-purple-600" />
            <div className="text-sm text-muted-foreground">Reembolsos</div>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Pendentes:</span>
              <span className="font-medium text-yellow-600">R$ {totalReembolsoPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span>Pagos:</span>
              <span className="font-medium text-green-600">R$ {totalReembolsoPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de demandas */}
      <div className="space-y-3">
        {demandas.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma demanda vinculada a este evento</p>
          </Card>
        ) : (
          demandas.map((demanda) => (
            <Card key={demanda.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{demanda.titulo}</h4>
                    <Badge variant={statusConfig[demanda.status].variant}>
                      {statusConfig[demanda.status].label}
                    </Badge>
                    <Badge variant="outline" className={prioridadeConfig[demanda.prioridade].color}>
                      {prioridadeConfig[demanda.prioridade].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{demanda.descricao}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>#{demanda.id}</span>
                    {demanda.responsavel && <span>Responsável: {demanda.responsavel}</span>}
                    <span>{demanda.comentarios.length} respostas</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVerDetalhes(demanda)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalhes
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <DetalhesDemandaDialog
        demanda={demandaSelecionada}
        open={detalhesOpen}
        onOpenChange={setDetalhesOpen}
      />
    </div>
  );
}
