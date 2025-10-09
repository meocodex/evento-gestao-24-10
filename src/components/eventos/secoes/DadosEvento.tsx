import { Evento } from '@/types/eventos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EventoTimeline } from '@/components/shared/EventoTimeline';
import { Calendar, MapPin, User, Building2, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DadosEventoProps {
  evento: Evento;
  permissions: any;
}

export function DadosEvento({ evento }: DadosEventoProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Evento</CardTitle>
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
    </div>
  );
}
