import { Evento } from '@/types/eventos';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User, Briefcase, Package, Edit, Copy, ListOrdered } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EventoCountdown } from './EventoCountdown';
import { useMemo } from 'react';

interface EventoCardProps {
  evento: Evento;
  onViewDetails: (evento: Evento) => void;
}

export function EventoCard({ evento, onViewDetails }: EventoCardProps) {
  const dataEvento = parseISO(evento.dataInicio);
  const diasAteEvento = differenceInDays(dataEvento, new Date());
  const isUrgente = diasAteEvento >= 0 && diasAteEvento < 7;

  // Status color coding
  const statusBorderColor = useMemo(() => {
    const statusColors = {
      finalizado: 'border-t-success',
      confirmado: 'border-t-blue-500',
      em_preparacao: 'border-t-blue-500',
      materiais_alocados: 'border-t-yellow-500',
      em_andamento: 'border-t-orange-500',
      cancelado: 'border-t-destructive',
      orcamento_enviado: 'border-t-muted-foreground',
      aguardando_retorno: 'border-t-yellow-500',
      aguardando_fechamento: 'border-t-purple-500',
      aguardando_alocacao: 'border-t-cyan-500',
    };
    return statusColors[evento.status] || 'border-t-muted';
  }, [evento.status]);

  // Progress indicator
  const progress = useMemo(() => {
    const statusSteps = {
      orcamento_enviado: 1,
      aguardando_retorno: 1,
      confirmado: 2,
      aguardando_alocacao: 2,
      materiais_alocados: 3,
      em_preparacao: 3,
      em_andamento: 4,
      aguardando_fechamento: 4,
      finalizado: 5,
      cancelado: 0,
    };
    const step = statusSteps[evento.status] || 0;
    return (step / 5) * 100;
  }, [evento.status]);

  // Materials count
  const materiaisCount = useMemo(() => {
    return {
      antecipado: evento.materiaisAlocados.antecipado.length,
      comTecnicos: evento.materiaisAlocados.comTecnicos.length,
      total: evento.materiaisAlocados.antecipado.length + evento.materiaisAlocados.comTecnicos.length,
    };
  }, [evento.materiaisAlocados]);

  return (
    <Card 
      className="group p-5 hover:shadow-lg transition-all duration-300 hover:border-primary/30 animate-fade-in flex flex-col min-h-[240px] cursor-pointer relative border-l-2 border-l-primary/0 hover:border-l-primary"
      onClick={() => onViewDetails(evento)}
    >
      {/* Quick actions - visible on hover */}
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(evento);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex flex-col h-full gap-3">
        {/* Header */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold leading-tight line-clamp-2 pr-12">
            {evento.nome}
          </h3>
          
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={evento.status} />
            {isUrgente && (
              <Badge variant="destructive" className="text-xs h-5">
                Urgente
              </Badge>
            )}
            {evento.tags.slice(0, 1).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs h-5">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        {evento.status !== 'cancelado' && (
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Info grid - flex-1 to push footer down */}
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
            <span className="truncate">
              {format(dataEvento, "dd MMM", { locale: ptBR })} • {evento.horaInicio}-{evento.horaFim}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
            <span className="truncate">{evento.cidade}/{evento.estado}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">{evento.cliente.nome}</span>
          </div>

          {materiaisCount.total > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-5 w-5 text-success flex-shrink-0" />
              <span className="text-xs">
                {materiaisCount.total} materiais alocados
              </span>
            </div>
          )}
        </div>

        {/* Footer - countdown */}
        <div className="pt-2 border-t">
          <EventoCountdown dataInicio={evento.dataInicio} horaInicio={evento.horaInicio} />
        </div>
      </div>
    </Card>
  );
}
