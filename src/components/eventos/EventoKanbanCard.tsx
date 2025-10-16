import { Evento } from '@/types/eventos';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Calendar, MapPin, User, GripVertical } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface EventoKanbanCardProps {
  evento: Evento;
  onViewDetails: (evento: Evento) => void;
}

export function EventoKanbanCard({ evento, onViewDetails }: EventoKanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: evento.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "touch-none",
        isDragging && "opacity-50 cursor-grabbing"
      )}
    >
      <Card
        className={cn(
          "cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]",
          "border-l-4",
          evento.status === 'orcamento_enviado' && "border-l-yellow-500",
          evento.status === 'confirmado' && "border-l-blue-500",
          evento.status === 'aguardando_alocacao' && "border-l-orange-500",
          evento.status === 'materiais_alocados' && "border-l-indigo-500",
          evento.status === 'em_preparacao' && "border-l-purple-500",
          evento.status === 'em_andamento' && "border-l-green-500",
          evento.status === 'aguardando_retorno' && "border-l-cyan-500",
          evento.status === 'aguardando_fechamento' && "border-l-teal-500",
          evento.status === 'finalizado' && "border-l-gray-500",
          evento.status === 'cancelado' && "border-l-red-500"
        )}
        onClick={() => onViewDetails(evento)}
      >
        <CardContent className="p-3 space-y-2">
          {/* Header com drag handle */}
          <div className="flex items-start gap-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-muted rounded"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm line-clamp-2">{evento.nome}</h4>
            </div>
          </div>

          {/* Info compacta */}
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{evento.cliente.nome}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span>
                {format(parseISO(evento.dataInicio), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
            
            {evento.cidade && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{evento.cidade}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {evento.tags && evento.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {evento.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs"
                >
                  {tag}
                </span>
              ))}
              {evento.tags.length > 2 && (
                <span className="px-2 py-0.5 bg-muted rounded text-xs">
                  +{evento.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
