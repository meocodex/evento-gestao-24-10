import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Evento } from '@/types/eventos';
import { EventoCard } from './EventoCard';
import { CalendarX } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

interface EventosVirtualListProps {
  eventos: Evento[];
  onViewDetails: (evento: Evento) => void;
  onEdit: (evento: Evento) => void;
  onDelete: (evento: Evento) => void;
  onChangeStatus: (evento: Evento) => void;
}

export function EventosVirtualList({ 
  eventos, 
  onViewDetails, 
  onEdit, 
  onDelete, 
  onChangeStatus 
}: EventosVirtualListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: eventos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 5,
  });

  if (eventos.length === 0) {
    return (
      <EmptyState
        icon={CalendarX}
        title="Nenhum evento encontrado"
        description="Tente ajustar os filtros de busca ou criar um novo evento para começar."
      />
    );
  }

  return (
    <div ref={parentRef} className="h-[calc(100vh-300px)] overflow-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const evento = eventos[virtualRow.index];
            return (
              <div
                key={evento.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <EventoCard
                  evento={evento}
                  onClick={onViewDetails}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onChangeStatus={onChangeStatus}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
