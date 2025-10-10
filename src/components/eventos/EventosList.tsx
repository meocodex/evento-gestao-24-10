import { Evento } from '@/types/eventos';
import { EventoCard } from './EventoCard';
import { CalendarX } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';

interface EventosListProps {
  eventos: Evento[];
  onViewDetails: (evento: Evento) => void;
  isLoading?: boolean;
}

export function EventosList({ eventos, onViewDetails, isLoading }: EventosListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {eventos.map((evento) => (
        <EventoCard
          key={evento.id}
          evento={evento}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
