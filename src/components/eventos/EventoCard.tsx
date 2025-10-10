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
      className={`p-4 hover:shadow-lg transition-all duration-200 hover:scale-[1.01] animate-fade-in flex flex-col h-full cursor-pointer relative overflow-hidden border-t-4 ${statusBorderColor}`}
      onClick={() => onViewDetails(evento)}
    >
      {/* Quick actions always visible */}
      <div className="absolute top-3 right-3 flex gap-1 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(evento);
          }}
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(evento);
          }}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implement duplicate
          }}
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Content */}
      <div className="relative z-[1] flex flex-col h-full">
        <div className="space-y-1.5 mb-2">
          <h3 className="text-base font-semibold line-clamp-2 pr-24">{evento.nome}</h3>
          
          <div className="flex flex-wrap items-center gap-1">
            <StatusBadge status={evento.status} />
            {isUrgente && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                Urgente
              </Badge>
            )}
            {evento.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">{tag}</Badge>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-2 mt-2">
          {/* Progress bar */}
          {evento.status !== 'cancelado' && (
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span className="line-clamp-1">
              {format(dataEvento, "dd MMM", { locale: ptBR })} • {evento.horaInicio}-{evento.horaFim}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-blue-500" />
            <span className="line-clamp-1">{evento.cidade}/{evento.estado}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="h-3.5 w-3.5 text-purple-500" />
            <span className="line-clamp-1">{evento.cliente.nome}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Briefcase className="h-3.5 w-3.5 text-orange-500" />
            <span className="line-clamp-1">{evento.comercial.nome}</span>
          </div>

          {/* Materials preview */}
          {materiaisCount.total > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Package className="h-3.5 w-3.5 text-success" />
              <span className="text-[10px]">
                Mat: {materiaisCount.antecipado} Ant + {materiaisCount.comTecnicos} Tec
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
