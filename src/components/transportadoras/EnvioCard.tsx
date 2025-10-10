import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, MapPin, Calendar, TrendingUp, Edit, DollarSign } from 'lucide-react';
import { Envio } from '@/types/transportadoras';
import { useTransportadoras } from '@/contexts/TransportadorasContext';
import { useEventos } from '@/contexts/EventosContext';
import { EditarEnvioDialog } from './EditarEnvioDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EnvioCardProps {
  envio: Envio;
}

const statusColors = {
  pendente: 'bg-yellow-500',
  em_transito: 'bg-blue-500',
  entregue: 'bg-green-500',
  cancelado: 'bg-red-500',
};

const statusLabels = {
  pendente: 'Pendente',
  em_transito: 'Em Trânsito',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

export function EnvioCard({ envio }: EnvioCardProps) {
  const { transportadoras, atualizarStatusEnvio } = useTransportadoras();
  const { eventos } = useEventos();
  const [editarOpen, setEditarOpen] = useState(false);
  const transportadora = transportadoras.find((t) => t.id === envio.transportadoraId);
  const evento = eventos.find((e) => e.id === envio.eventoId);

  const handleStatusChange = () => {
    const statusOrder: Envio['status'][] = ['pendente', 'em_transito', 'entregue'];
    const currentIndex = statusOrder.indexOf(envio.status);
    if (currentIndex < statusOrder.length - 1) {
      atualizarStatusEnvio(envio.id, statusOrder[currentIndex + 1]);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">{transportadora?.nome}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {envio.tipo === 'ida' ? 'Ida' : 'Volta'} - {envio.rastreio || 'Sem rastreio'}
                </p>
                {evento && (
                  <p className="text-xs text-muted-foreground mt-1">
                    📦 {evento.nome}
                  </p>
                )}
              </div>
            </div>
            <Badge className={statusColors[envio.status]}>
              {statusLabels[envio.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{envio.origem}</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span>{envio.destino}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                Previsão: {format(new Date(envio.dataEntregaPrevista), "d 'de' MMMM", { locale: ptBR })}
              </span>
            </div>

            {envio.dataEntrega && (
              <div className="text-sm text-green-600">
                Entregue em {format(new Date(envio.dataEntrega), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </div>
            )}

            {envio.valor && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">
                  R$ {envio.valor.toFixed(2)}
                </span>
                <Badge variant="outline" className="text-xs">
                  {envio.formaPagamento === 'antecipado' ? 'Antecipado' : envio.formaPagamento === 'na_entrega' ? 'Na Entrega' : 'A Combinar'}
                </Badge>
              </div>
            )}

            {envio.observacoes && (
              <p className="text-sm text-muted-foreground">{envio.observacoes}</p>
            )}

            <div className="flex gap-2 pt-2">
              {envio.status !== 'entregue' && envio.status !== 'cancelado' && (
                <Button size="sm" onClick={handleStatusChange} className="flex-1">
                  Avançar Status
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setEditarOpen(true)}>
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {editarOpen && (
        <EditarEnvioDialog
          envio={envio}
          open={editarOpen}
          onOpenChange={setEditarOpen}
        />
      )}
    </>
  );
}
