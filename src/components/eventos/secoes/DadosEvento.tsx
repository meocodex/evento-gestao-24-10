import { useState } from 'react';
import { Evento } from '@/types/eventos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EventoTimeline } from '@/components/shared/EventoTimeline';
import { Calendar, MapPin, User, Building2, Mail, Phone, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EditarDadosEvento } from './EditarDadosEvento';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';

interface DadosEventoProps {
  evento: Evento;
  permissions: any;
}

export function DadosEvento({ evento, permissions }: DadosEventoProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleDelete = () => {
    toast({
      title: 'Evento excluído!',
      description: 'O evento foi removido com sucesso.',
    });
    setShowDeleteDialog(false);
  };

  if (isEditing) {
    return <EditarDadosEvento evento={evento} onSave={handleSave} onCancel={() => setIsEditing(false)} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Informações do Evento</CardTitle>
          <div className="flex gap-2">
            {permissions.canEdit && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            {permissions.canDeleteEvent && (
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Data e Horário</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(evento.dataInicio), "dd/MM/yyyy", { locale: ptBR })} às {evento.horaInicio}
                  {' → '}
                  {format(new Date(evento.dataFim), "dd/MM/yyyy", { locale: ptBR })} às {evento.horaFim}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Local</p>
                <p className="text-sm text-muted-foreground">{evento.local}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Status</p>
            <StatusBadge status={evento.status} />
          </div>
          {evento.descricao && (
            <div>
              <p className="text-sm font-medium mb-1">Descrição</p>
              <p className="text-sm text-muted-foreground">{evento.descricao}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            {evento.cliente.tipo === 'CPF' ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
            <div>
              <p className="font-medium">{evento.cliente.nome}</p>
              <p className="text-sm text-muted-foreground">{evento.cliente.documento}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4" />
            <span>{evento.cliente.telefone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4" />
            <span>{evento.cliente.email}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <EventoTimeline timeline={evento.timeline} />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Excluir Evento"
        description="Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
