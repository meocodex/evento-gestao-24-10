import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Evento } from '@/types/eventos';
import { EventosList } from '@/components/eventos/EventosList';
import { EventoFilters, EventoFiltersType } from '@/components/eventos/EventoFilters';
import { NovoEventoDialog } from '@/components/eventos/NovoEventoDialog';
import { EventoDetailsDialog } from '@/components/eventos/EventoDetailsDialog';
import { useEventoPermissions } from '@/hooks/useEventoPermissions';
import { useEventos } from '@/contexts/EventosContext';

export default function Eventos() {
  const { eventos } = useEventos();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<EventoFiltersType>({ status: [], cidade: '', tags: [] });
  const [novoEventoOpen, setNovoEventoOpen] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const permissions = useEventoPermissions();

  const availableCities = useMemo(() => {
    return Array.from(new Set(eventos.map(e => e.cidade)));
  }, [eventos]);

  const availableTags = useMemo(() => {
    return Array.from(new Set(eventos.flatMap(e => e.tags)));
  }, [eventos]);

  const filteredEventos = useMemo(() => {
    return eventos.filter(evento => {
      const matchSearch = evento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evento.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filters.status.length === 0 || filters.status.includes(evento.status);
      const matchCidade = !filters.cidade || evento.cidade === filters.cidade;
      const matchTags = filters.tags.length === 0 || filters.tags.some(tag => evento.tags.includes(tag));
      
      return matchSearch && matchStatus && matchCidade && matchTags;
    });
  }, [eventos, searchTerm, filters]);

  const handleViewDetails = (evento: Evento) => {
    setSelectedEvento(evento);
    setDetailsOpen(true);
  };

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Header moderno com gradiente sutil */}
      <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="relative z-10">
          <h1 className="text-4xl font-display font-bold mb-2">Eventos</h1>
          <p className="text-lg text-muted-foreground">Gerencie todos os eventos da sua empresa</p>
        </div>
      </div>

      {/* Search e Filters com glass effect */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Buscar eventos por nome, cliente..."
            className="pl-10 h-11 border-2 focus:border-primary/50 transition-all"
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
          <Button 
            onClick={() => setNovoEventoOpen(true)}
            variant="gradient"
            size="lg"
            className="shadow-lg"
          >
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
