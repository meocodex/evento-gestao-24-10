import { Evento } from '@/types/eventos';
import { EventoCard } from './EventoCard';
import { CalendarX } from 'lucide-react';

interface EventosListProps {
  eventos: Evento[];
  onViewDetails: (evento: Evento) => void;
  isLoading?: boolean;
}

export function EventosList({ eventos, onViewDetails, isLoading }: EventosListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (eventos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CalendarX className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Nenhum evento encontrado</h3>
        <p className="text-muted-foreground">
          Tente ajustar os filtros ou criar um novo evento
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
