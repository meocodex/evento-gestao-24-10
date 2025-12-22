import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDemandas } from '@/hooks/demandas';
import { Demanda } from '@/types/demandas';
import { AlertCircle, Eye } from 'lucide-react';
import { useState } from 'react';
import { DetalhesDemandaSheet } from '@/components/demandas/DetalhesDemandaSheet';
import { NovaDemandaReembolsoSheet } from '@/components/demandas/NovaDemandaReembolsoSheet';

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
  const { demandas: todasDemandas } = useDemandas(1, 1000);
  const demandas = todasDemandas.filter((d: Demanda) => d.eventoRelacionado === eventoId);
  const [demandaSelecionada, setDemandaSelecionada] = useState<Demanda | null>(null);
  const [detalhesOpen, setDetalhesOpen] = useState(false);

  const handleVerDetalhes = (demanda: Demanda) => {
    setDemandaSelecionada(demanda);
    setDetalhesOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <NovaDemandaReembolsoSheet eventoId={eventoId} />
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
                    <span>{demanda.comentarios?.length || 0} respostas</span>
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

      <DetalhesDemandaSheet
        demanda={demandaSelecionada}
        open={detalhesOpen}
        onOpenChange={setDetalhesOpen}
      />
    </div>
  );
}
