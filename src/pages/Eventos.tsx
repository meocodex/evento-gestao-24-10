import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, Grid3x3, List, ArrowUpDown } from 'lucide-react';
import { Evento } from '@/types/eventos';
import { EventosList } from '@/components/eventos/EventosList';
import { EventoFilters, EventoFiltersType } from '@/components/eventos/EventoFilters';
import { NovoEventoDialog } from '@/components/eventos/NovoEventoDialog';
import { EventoDetailsDialog } from '@/components/eventos/EventoDetailsDialog';
import { useEventoPermissions } from '@/hooks/useEventoPermissions';
import { useEventos } from '@/contexts/EventosContext';
import { EventosStats } from '@/components/eventos/EventosStats';
import { EventosQuickFilters } from '@/components/eventos/EventosQuickFilters';
import { EventosTableView } from '@/components/eventos/EventosTableView';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { differenceInDays, parseISO, startOfMonth, endOfMonth, addMonths, isWithinInterval } from 'date-fns';

export default function Eventos() {
  const { eventos } = useEventos();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<EventoFiltersType>({ status: [], cidade: '', tags: [] });
  const [novoEventoOpen, setNovoEventoOpen] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const permissions = useEventoPermissions();
  const [activeTab, setActiveTab] = useState<string>('todos');
  const [quickFilter, setQuickFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('dataProxima');

  const availableCities = useMemo(() => {
    return Array.from(new Set(eventos.map(e => e.cidade)));
  }, [eventos]);

  const availableTags = useMemo(() => {
    return Array.from(new Set(eventos.flatMap(e => e.tags)));
  }, [eventos]);

  const filteredEventos = useMemo(() => {
    const hoje = new Date();
    
    return eventos.filter(evento => {
      // Search filter
      const matchSearch = evento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evento.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Advanced filters
      const matchStatus = filters.status.length === 0 || filters.status.includes(evento.status);
      const matchCidade = !filters.cidade || evento.cidade === filters.cidade;
      const matchTags = filters.tags.length === 0 || filters.tags.some(tag => evento.tags.includes(tag));
      
      // Tab filter
      let matchTab = true;
      if (activeTab === 'proximos7') {
        const dataEvento = parseISO(evento.dataInicio);
        const diasAteEvento = differenceInDays(dataEvento, hoje);
        matchTab = diasAteEvento >= 0 && diasAteEvento <= 7;
      } else if (activeTab === 'esteMes') {
        const dataEvento = parseISO(evento.dataInicio);
        matchTab = isWithinInterval(dataEvento, { start: startOfMonth(hoje), end: endOfMonth(hoje) });
      } else if (activeTab === 'proximoMes') {
        const proximoMes = addMonths(hoje, 1);
        const dataEvento = parseISO(evento.dataInicio);
        matchTab = isWithinInterval(dataEvento, { start: startOfMonth(proximoMes), end: endOfMonth(proximoMes) });
      } else if (activeTab === 'finalizados') {
        matchTab = evento.status === 'finalizado';
      }
      
      // Quick filter
      let matchQuickFilter = true;
      if (quickFilter === 'urgentes') {
        const dataEvento = parseISO(evento.dataInicio);
        const diasAteEvento = differenceInDays(dataEvento, hoje);
        matchQuickFilter = diasAteEvento >= 0 && diasAteEvento < 7 && evento.status !== 'finalizado' && evento.status !== 'cancelado';
      } else if (quickFilter === 'confirmados') {
        matchQuickFilter = evento.status === 'confirmado';
      } else if (quickFilter === 'emPreparacao') {
        matchQuickFilter = evento.status === 'em_preparacao';
      } else if (quickFilter === 'altaPrioridade') {
        matchQuickFilter = evento.tags.includes('Alta Prioridade');
      }
      
      return matchSearch && matchStatus && matchCidade && matchTags && matchTab && matchQuickFilter;
    });
  }, [eventos, searchTerm, filters, activeTab, quickFilter]);

  const sortedEventos = useMemo(() => {
    const sorted = [...filteredEventos];
    
    switch (sortBy) {
      case 'dataProxima':
        return sorted.sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime());
      case 'dataDistante':
        return sorted.sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime());
      case 'nomeAZ':
        return sorted.sort((a, b) => a.nome.localeCompare(b.nome));
      case 'status':
        return sorted.sort((a, b) => a.status.localeCompare(b.status));
      case 'ultimaAtualizacao':
        return sorted.sort((a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime());
      default:
        return sorted;
    }
  }, [filteredEventos, sortBy]);

  const handleViewDetails = (evento: Evento) => {
    setSelectedEvento(evento);
    setDetailsOpen(true);
  };

  return (
    <div className="min-h-full">
      {/* Container with premium max-width and spacing */}
      <div className="mx-auto max-w-[1600px] px-6 py-8 space-y-6 animate-fade-in">
        {/* Premium header with enhanced glassmorphism */}
        <div className="relative overflow-hidden rounded-3xl p-8 border border-border/40 bg-gradient-to-br from-card/60 via-card/40 to-transparent backdrop-blur-2xl">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8" />
          
          {/* Floating accent elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
          
          <div className="relative z-10">
            <h1 className="text-5xl font-display font-bold mb-3 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              Eventos
            </h1>
            <p className="text-lg text-muted-foreground/80 font-medium">
              Gerencie todos os eventos da sua empresa com eficiência e profissionalismo
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <EventosStats eventos={eventos} />

        {/* Navigation Tabs - Premium style */}
        <div className="relative">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto bg-card/60 backdrop-blur-xl border border-border/40 p-1">
              <TabsTrigger value="todos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Todos</TabsTrigger>
              <TabsTrigger value="proximos7" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Próximos 7 Dias</TabsTrigger>
              <TabsTrigger value="esteMes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Este Mês</TabsTrigger>
              <TabsTrigger value="proximoMes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Próximo Mês</TabsTrigger>
              <TabsTrigger value="finalizados" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Finalizados</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-col gap-4">
          <EventosQuickFilters 
            eventos={eventos}
            activeFilter={quickFilter}
            onFilterChange={setQuickFilter}
          />
          
          {/* Search, Filters, Sort and View Toggle - Premium glassmorphic container */}
          <div className="flex flex-col lg:flex-row gap-3 p-4 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/40">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Buscar eventos por nome, cliente..."
                className="pl-10 h-10 bg-background/60 border-border/60 focus:border-primary/50 focus:bg-background transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px] h-10 bg-background/60 border-border/60">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dataProxima">Data Mais Próxima</SelectItem>
                  <SelectItem value="dataDistante">Data Mais Distante</SelectItem>
                  <SelectItem value="nomeAZ">Nome (A-Z)</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="ultimaAtualizacao">Última Atualização</SelectItem>
                </SelectContent>
              </Select>

              <EventoFilters
                filters={filters}
                onFiltersChange={setFilters}
                availableCities={availableCities}
                availableTags={availableTags}
              />

              <div className="flex border border-border/60 rounded-xl overflow-hidden bg-background/40">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-none h-10 w-10 hover:bg-primary/10"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-none h-10 w-10 hover:bg-primary/10"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {permissions.canCreateEvent && (
                <Button 
                  onClick={() => setNovoEventoOpen(true)}
                  className="shadow-lg h-10 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Evento
                </Button>
              )}
            </div>
          </div>

          {/* Results counter with premium styling */}
          <div className="flex items-center gap-2 px-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Mostrando</span>
              <span className="px-2 py-1 rounded-lg bg-primary/10 text-primary font-bold text-base">{sortedEventos.length}</span>
              <span className="text-muted-foreground">de</span>
              <span className="px-2 py-1 rounded-lg bg-muted/50 font-semibold">{eventos.length}</span>
              <span className="text-muted-foreground">eventos</span>
            </div>
          </div>
        </div>

        {/* Events List or Table View */}
        {viewMode === 'grid' ? (
          <EventosList
            eventos={sortedEventos}
            onViewDetails={handleViewDetails}
          />
        ) : (
          <EventosTableView
            eventos={sortedEventos}
            onViewDetails={handleViewDetails}
          />
        )}

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
    </div>
  );
}
