import { Evento, StatusEvento } from '@/types/eventos';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { EventoKanbanCard } from './EventoKanbanCard';
import { cn } from '@/lib/utils';

interface EventoKanbanColumnProps {
  status: StatusEvento;
  label: string;
  color: string;
  eventos: Evento[];
  onViewDetails: (evento: Evento) => void;
}

export function EventoKanbanColumn({ status, label, color, eventos, onViewDetails }: EventoKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-shrink-0 w-80 snap-center",
        "md:w-72 lg:w-80"
      )}
    >
      <div className={cn(
        "rounded-lg border-2 h-full transition-all",
        color,
        isOver && "ring-2 ring-primary scale-105"
      )}>
        {/* Header */}
        <div className="p-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{label}</h3>
            <span className="text-xs bg-background/50 px-2 py-1 rounded-full">
              {eventos.length}
            </span>
          </div>
        </div>

        {/* Cards */}
        <div className="p-3 space-y-3 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto">
          <SortableContext
            items={eventos.map(e => e.id)}
            strategy={verticalListSortingStrategy}
          >
            {eventos.map((evento) => (
              <EventoKanbanCard
                key={evento.id}
                evento={evento}
                onViewDetails={onViewDetails}
              />
            ))}
          </SortableContext>

          {eventos.length === 0 && (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              Nenhum evento
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
