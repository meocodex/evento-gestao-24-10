import { Evento } from '@/types/eventos';
import { EventoCard } from './EventoCard';
import { CalendarX } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';

interface EventosListProps {
  eventos: Evento[];
  onViewDetails: (evento: Evento) => void;
  onEdit: (evento: Evento) => void;
  onDelete: (evento: Evento) => void;
  onChangeStatus: (evento: Evento) => void;
  isLoading?: boolean;
}

export function EventosList({ eventos, onViewDetails, onEdit, onDelete, onChangeStatus, isLoading }: EventosListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {[...Array(8)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

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
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {eventos.map((evento) => (
        <EventoCard
          key={evento.id}
          evento={evento}
          onClick={onViewDetails}
          onEdit={onEdit}
          onDelete={onDelete}
          onChangeStatus={onChangeStatus}
        />
      ))}
    </div>
  );
}
