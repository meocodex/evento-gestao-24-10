import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, MapPin, Calendar, TrendingUp, Edit, DollarSign, Trash2, FileCheck, Download } from 'lucide-react';
import { Envio } from '@/types/transportadoras';
import { useTransportadoras } from '@/hooks/transportadoras';
import { useEventos } from '@/hooks/eventos';
import { EditarEnvioSheet } from './EditarEnvioSheet';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { InfoGrid } from '@/components/shared/InfoGrid';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { downloadFile } from '@/utils/downloadFile';

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

export const EnvioCard = React.memo(function EnvioCard({ envio }: EnvioCardProps) {
  const { transportadoras, atualizarStatusEnvio, excluirEnvio } = useTransportadoras();
  const { eventos } = useEventos();
  const [editarOpen, setEditarOpen] = useState(false);
  const [confirmExcluirOpen, setConfirmExcluirOpen] = useState(false);
  const transportadora = transportadoras.find((t) => t.id === envio.transportadoraId);
  const evento = eventos.find((e) => e.id === envio.eventoId);

  // Verificar se há declaração de transporte vinculada
  const { data: declaracao } = useQuery({
    queryKey: ['envio-declaracao', envio.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('eventos_materiais_alocados')
        .select('declaracao_transporte_url')
        .eq('envio_id', envio.id)
        .not('declaracao_transporte_url', 'is', null)
        .limit(1)
        .single();
      
      return data?.declaracao_transporte_url || null;
    },
    enabled: !!envio.id,
  });

  const handleStatusChange = () => {
    const statusOrder: Envio['status'][] = ['pendente', 'em_transito', 'entregue'];
    const currentIndex = statusOrder.indexOf(envio.status);
    if (currentIndex < statusOrder.length - 1) {
      atualizarStatusEnvio.mutateAsync({ id: envio.id, status: statusOrder[currentIndex + 1] });
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
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
          <div className="flex flex-col gap-2 items-end">
            <Badge className={statusColors[envio.status]}>
              {statusLabels[envio.status]}
            </Badge>
            {declaracao && (
              <Badge variant="default" className="gap-1 bg-green-500 hover:bg-green-600">
                <FileCheck className="h-3 w-3" />
                Declaração Gerada
              </Badge>
            )}
          </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{envio.origem}</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span>{envio.destino}</span>
            </div>
            
            <InfoGrid
              items={[
                {
                  icon: Calendar,
                  label: 'Previsão',
                  value: format(new Date(envio.dataEntregaPrevista), "d 'de' MMMM", { locale: ptBR }),
                },
                ...(envio.valor ? [{
                  icon: DollarSign,
                  label: 'Valor',
                  value: `R$ ${envio.valor.toFixed(2)}`,
                  valueClassName: 'font-semibold',
                }] : []),
              ]}
            />

            {envio.dataEntrega && (
              <div className="text-sm text-green-600">
                Entregue em {format(new Date(envio.dataEntrega), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </div>
            )}

            {envio.valor && (
              <Badge variant="outline" className="text-xs">
                {envio.formaPagamento === 'antecipado' ? 'Antecipado' : envio.formaPagamento === 'na_entrega' ? 'Na Entrega' : 'A Combinar'}
              </Badge>
            )}

            {envio.observacoes && (
              <p className="text-sm text-muted-foreground">{envio.observacoes}</p>
            )}

            <div className="flex gap-2 flex-wrap mt-2">
              {declaracao && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => downloadFile(declaracao, 'declaracao-transporte.pdf')}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Declaração
                </Button>
              )}
              {envio.status !== 'entregue' && envio.status !== 'cancelado' && (
                <Button size="sm" onClick={handleStatusChange} className="flex-1">
                  Avançar Status
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setEditarOpen(true)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setConfirmExcluirOpen(true)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {editarOpen && (
        <EditarEnvioSheet
          envio={envio}
          open={editarOpen}
          onOpenChange={setEditarOpen}
        />
      )}

      <ConfirmDialog
        open={confirmExcluirOpen}
        onOpenChange={setConfirmExcluirOpen}
        onConfirm={() => {
          excluirEnvio.mutateAsync(envio.id);
          setConfirmExcluirOpen(false);
        }}
        title="Excluir Envio"
        description={`Tem certeza que deseja excluir este envio? Esta ação não pode ser desfeita.`}
        variant="danger"
        confirmText="Excluir"
      />
    </>
  );
});
