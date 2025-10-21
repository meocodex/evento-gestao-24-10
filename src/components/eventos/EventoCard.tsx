import { Evento } from '@/types/eventos';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Building, MoreVertical, Pencil, Trash2, ChevronRight, Tag } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EventoCountdown } from './EventoCountdown';
import { useEventoPermissions } from '@/hooks/useEventoPermissions';
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
  const { canEdit, canDeleteEvent } = useEventoPermissions(evento);
  const navigate = useNavigate();

  const statusColors = {
    orcamento_enviado: 'bg-amber-500',
    confirmado: 'bg-emerald-500',
    materiais_alocados: 'bg-navy-600',
    em_preparacao: 'bg-purple-500',
    em_andamento: 'bg-slate-700',
    aguardando_retorno: 'bg-orange-500',
    aguardando_fechamento: 'bg-gray-400',
    finalizado: 'bg-green-600',
    cancelado: 'bg-red-500',
    aguardando_alocacao: 'bg-yellow-600',
  };

  return (
    <Card className={cn(
      "group bg-white border-2 border-navy-100 rounded-2xl overflow-hidden min-h-[280px] flex flex-col relative cursor-pointer",
      "transition-all duration-300",
      "hover:border-navy-400 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1"
    )}
      onClick={() => navigate(`/eventos/${evento.id}`)}
    >
      {/* Status indicator top */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${statusColors[evento.status]}`} />
      
      <CardHeader className="pb-3 pt-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-base font-bold text-navy-800 leading-tight mb-2 line-clamp-2">
              {evento.nome}
            </h3>
            <StatusBadge status={evento.status} />
          </div>
          
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity min-h-[44px] min-w-[44px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-5 w-5" />
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
      
      <CardContent className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-navy-50">
            <Calendar className="h-5 w-5 text-navy-600" />
          </div>
          <div>
            <p className="text-xs text-navy-400 font-medium">Data</p>
            <p className="text-sm font-semibold text-navy-800">
              {format(parseISO(evento.dataInicio), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-navy-50">
            <Clock className="h-5 w-5 text-navy-600" />
          </div>
          <div>
            <p className="text-xs text-navy-400 font-medium">Horário</p>
            <p className="text-sm font-semibold text-navy-800">{evento.horaInicio}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-navy-50">
            <MapPin className="h-5 w-5 text-navy-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-navy-400 font-medium">Local</p>
            <p className="text-sm font-semibold text-navy-800 truncate">{evento.local}</p>
          </div>
        </div>
        
        {evento.cliente && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-navy-50">
              <Building className="h-5 w-5 text-navy-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-navy-400 font-medium">Cliente</p>
              <p className="text-sm font-semibold text-navy-800 truncate">{evento.cliente.nome}</p>
            </div>
          </div>
        )}
        
        <EventoCountdown dataInicio={evento.dataInicio} horaInicio={evento.horaInicio} />

        {/* Tags */}
        {evento.tags && evento.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-navy-100">
            {evento.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-navy-50 text-navy-700 rounded-md text-xs font-medium"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
            {evento.tags.length > 2 && (
              <span className="px-2 py-1 bg-muted rounded-md text-xs text-navy-600">
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
