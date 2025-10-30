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

export function EventoCard({ evento, onClick, onEdit, onDelete, onChangeStatus }: EventoCardProps) {
  const { canEditEvent, canDeleteEvent } = usePermissions(evento);
  const navigate = useNavigate();

  const statusColors = {
    orcamento: 'bg-amber-500',
    confirmado: 'bg-emerald-500',
    em_preparacao: 'bg-purple-500',
    em_execucao: 'bg-blue-600',
    concluido: 'bg-green-600',
    cancelado: 'bg-red-500',
  };

  return (
    <Card className={cn(
      "group bg-white border-2 border-navy-100 rounded-xl sm:rounded-2xl overflow-hidden min-h-[240px] sm:min-h-[280px] flex flex-col relative cursor-pointer",
      "transition-all duration-300",
      "hover:border-navy-400 hover:shadow-2xl active:scale-[0.98] sm:hover:scale-[1.02] sm:hover:-translate-y-1"
    )}
      onClick={() => navigate(`/eventos/${evento.id}`)}
    >
      {/* Status indicator top */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${statusColors[evento.status]}`} />
      
      <CardHeader className="pb-2 sm:pb-3 pt-4 sm:pt-5 px-3 sm:px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-navy-800 leading-tight mb-2 line-clamp-2">
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
      
      <CardContent className="flex-1 space-y-2 sm:space-y-3 px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-navy-50 flex-shrink-0">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-navy-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs text-navy-400 font-medium">Data</p>
            <p className="text-xs sm:text-sm font-semibold text-navy-800 truncate">
              {evento.dataInicio && evento.dataInicio !== '' 
                ? format(parseISO(evento.dataInicio), "dd/MM/yyyy", { locale: ptBR })
                : 'Data não definida'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-navy-50 flex-shrink-0">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-navy-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs text-navy-400 font-medium">Horário</p>
            <p className="text-xs sm:text-sm font-semibold text-navy-800 truncate">{evento.horaInicio}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-navy-50 flex-shrink-0">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-navy-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs text-navy-400 font-medium">Local</p>
            <p className="text-xs sm:text-sm font-semibold text-navy-800 truncate">{evento.local}</p>
          </div>
        </div>
        
        {evento.cliente && (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-navy-50 flex-shrink-0">
              <Building className="h-4 w-4 sm:h-5 sm:w-5 text-navy-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs text-navy-400 font-medium">Cliente</p>
              <p className="text-xs sm:text-sm font-semibold text-navy-800 truncate">{evento.cliente.nome}</p>
            </div>
          </div>
        )}
        
        <EventoCountdown dataInicio={evento.dataInicio} horaInicio={evento.horaInicio} />

        {/* Tags */}
        {evento.tags && evento.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-navy-100">
            {evento.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-navy-50 text-navy-700 rounded-md text-[10px] sm:text-xs font-medium"
              >
                <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                {tag}
              </span>
            ))}
            {evento.tags.length > 2 && (
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-muted rounded-md text-[10px] sm:text-xs text-navy-600">
                +{evento.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t border-navy-100 pt-4">
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
}
