import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { mockEventos } from '@/lib/mock-data/eventos';
import { Evento } from '@/types/eventos';
import { EventosList } from '@/components/eventos/EventosList';
import { EventoFilters, EventoFiltersType } from '@/components/eventos/EventoFilters';
import { NovoEventoDialog } from '@/components/eventos/NovoEventoDialog';
import { EventoDetailsDialog } from '@/components/eventos/EventoDetailsDialog';
import { useEventoPermissions } from '@/hooks/useEventoPermissions';

export default function Eventos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<EventoFiltersType>({ status: [], cidade: '', tags: [] });
  const [novoEventoOpen, setNovoEventoOpen] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const permissions = useEventoPermissions();

  const availableCities = useMemo(() => {
    return Array.from(new Set(mockEventos.map(e => e.cidade)));
  }, []);

  const availableTags = useMemo(() => {
    return Array.from(new Set(mockEventos.flatMap(e => e.tags)));
  }, []);

  const filteredEventos = useMemo(() => {
    return mockEventos.filter(evento => {
      const matchSearch = evento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evento.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filters.status.length === 0 || filters.status.includes(evento.status);
      const matchCidade = !filters.cidade || evento.cidade === filters.cidade;
      const matchTags = filters.tags.length === 0 || filters.tags.some(tag => evento.tags.includes(tag));
      
      return matchSearch && matchStatus && matchCidade && matchTags;
    });
  }, [searchTerm, filters]);

  const handleViewDetails = (evento: Evento) => {
    setSelectedEvento(evento);
    setDetailsOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Eventos</h1>
        <p className="text-muted-foreground">Gerencie todos os eventos da sua empresa</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos por nome, cliente..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <EventoFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableCities={availableCities}
          availableTags={availableTags}
        />
        {permissions.canCreateEvent && (
          <Button onClick={() => setNovoEventoOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        )}
      </div>

      <EventosList
        eventos={filteredEventos}
        onViewDetails={handleViewDetails}
      />

      <NovoEventoDialog
        open={novoEventoOpen}
        onOpenChange={setNovoEventoOpen}
        onEventoCreated={() => {}}
      />

      <EventoDetailsDialog
        evento={selectedEvento}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
}
