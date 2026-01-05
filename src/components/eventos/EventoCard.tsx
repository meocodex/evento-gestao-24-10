import React from 'react';
import { Evento } from '@/types/eventos';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Building, MoreVertical, Pencil, Trash2, ChevronRight, Tag } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EventoCountdown } from './EventoCountdown';
import { MateriaisPendentesBadge } from './MateriaisPendentesBadge';
import { InfoGrid } from '@/components/shared/InfoGrid';
import { usePermissions } from '@/hooks/usePermissions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface EventoCardProps {
  evento: Evento;
  onClick: (evento: Evento) => void;
  onEdit: (evento: Evento) => void;
  onDelete: (evento: Evento) => void;
  onChangeStatus: (evento: Evento) => void;
}

export const EventoCard = React.memo(function EventoCard({ evento, onClick, onEdit, onDelete, onChangeStatus }: EventoCardProps) {
  const { canEditEvent, canDeleteEvent } = usePermissions(evento);
  const navigate = useNavigate();

  const statusColors: Record<string, string> = {
    em_negociacao: 'bg-amber-500',
    confirmado: 'bg-emerald-500',
    em_preparacao: 'bg-purple-500',
    em_execucao: 'bg-blue-600',
    finalizado: 'bg-green-600',
    arquivado: 'bg-gray-500',
    cancelado: 'bg-red-500',
  };

  return (
    <Card className={cn(
      "group bg-card border rounded-xl overflow-hidden min-h-[240px] sm:min-h-[280px] flex flex-col relative cursor-pointer",
      "transition-all duration-300 smooth-hover",
      "hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 active:scale-[0.98] sm:hover:scale-[1.02] sm:hover:-translate-y-1"
    )}
      onClick={() => navigate(`/eventos/${evento.id}`)}
    >
      {/* Status indicator top */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${statusColors[evento.status]}`} />
      
      <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-card-foreground leading-tight mb-1.5 line-clamp-2">
              {evento.nome}
            </h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center text-xs">
              <StatusBadge status={evento.status} />
              <MateriaisPendentesBadge eventoId={evento.id} status={evento.status} />
            </div>
          </div>
          
          {canEditEvent(evento) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onChangeStatus(evento);
                }}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Alterar Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/eventos/${evento.id}`);
                }}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                {canDeleteEvent && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(evento);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 px-3 sm:px-4 flex-1 flex flex-col justify-between space-y-2">
        {/* Event Details */}
        <InfoGrid
          columns={2}
          gap="md"
          className="flex-1"
          items={[
            {
              icon: Calendar,
              label: 'Data',
              value: evento.dataInicio && evento.dataInicio !== '' 
                ? format(parseISO(evento.dataInicio), "dd/MM/yyyy", { locale: ptBR })
                : 'Data não definida',
              valueClassName: 'font-semibold',
            },
            {
              icon: Clock,
              label: 'Horário',
              value: evento.horaInicio,
              valueClassName: 'font-semibold',
            },
            {
              icon: MapPin,
              label: 'Local',
              value: evento.local,
              valueClassName: 'font-semibold',
            },
            ...(evento.cliente ? [{
              icon: Building,
              label: 'Cliente',
              value: evento.cliente.nome,
              valueClassName: 'font-semibold',
            }] : []),
          ]}
        />
        
            <EventoCountdown
              eventoId={evento.id}
              dataInicio={evento.dataInicio} 
              horaInicio={evento.horaInicio}
              dataFim={evento.dataFim}
              horaFim={evento.horaFim}
              status={evento.status}
              arquivado={evento.arquivado}
            />

        {/* Tags */}
        {evento.tags && evento.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border">
            {evento.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary/10 text-primary rounded-md text-[10px] sm:text-xs font-medium"
              >
                <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                {tag}
              </span>
            ))}
            {evento.tags.length > 2 && (
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-muted rounded-md text-[10px] sm:text-xs text-muted-foreground">
                +{evento.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t border-border pt-4">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/eventos/${evento.id}`);
          }}
        >
          Ver Detalhes
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
});
