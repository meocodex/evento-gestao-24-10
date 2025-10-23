import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, Grid3x3, List, ArrowUpDown, Kanban, Sparkles, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Evento } from '@/types/eventos';
import { EventosList } from '@/components/eventos/EventosList';
import { EventosListAccordion } from '@/components/eventos/EventosListAccordion';
import { EventosKanbanView } from '@/components/eventos/EventosKanbanView';
import { EventosCalendarView } from '@/components/eventos/EventosCalendarView';
import { QuickCreateEventSheet } from '@/components/eventos/QuickCreateEventDialog';
import { EventoFilters, EventoFiltersType } from '@/components/eventos/EventoFilters';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { useEventosQueries } from '@/hooks/eventos';
import { EventosStats } from '@/components/eventos/EventosStats';
import { EventosQuickFilters } from '@/components/eventos/EventosQuickFilters';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { differenceInDays, parseISO, startOfMonth, endOfMonth, addMonths, isWithinInterval } from 'date-fns';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

export default function Eventos() {
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const { eventos = [], totalCount = 0 } = useEventosQueries(page, pageSize);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<EventoFiltersType>({ status: [], cidade: '', tags: [] });
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const permissions = usePermissions();
  const [activeTab, setActiveTab] = useState<string>('todos');
  const [quickFilter, setQuickFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban' | 'calendar'>('grid');
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
        matchTab = evento.status === 'concluido';
      }
      
      // Quick filter
      let matchQuickFilter = true;
      if (quickFilter === 'urgentes') {
        const dataEvento = parseISO(evento.dataInicio);
        const diasAteEvento = differenceInDays(dataEvento, hoje);
        matchQuickFilter = diasAteEvento >= 0 && diasAteEvento < 7 && evento.status !== 'concluido' && evento.status !== 'cancelado';
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
    navigate(`/eventos/${evento.id}`);
  };

  const handleEditarEvento = (evento: Evento) => {
    navigate(`/eventos/${evento.id}`);
  };

  const handleDeletarEvento = (evento: Evento) => {
    navigate(`/eventos/${evento.id}`);
  };

  const handleAlterarStatus = (evento: Evento) => {
    navigate(`/eventos/${evento.id}`);
  };

  return (
    <div className="min-h-full">
      {/* Container with premium max-width and spacing */}
      <div className="mx-auto max-w-[1600px] px-6 py-6 space-y-4 animate-fade-in bg-navy-50 dark:bg-navy-950">
        {/* Navy Hero Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-900 dark:text-navy-50">
            Eventos
          </h1>
          <p className="text-navy-600 dark:text-navy-400 mt-1">
            Gerencie todos os eventos da sua empresa com eficiência e profissionalismo
          </p>
        </div>

        {/* Stats Cards */}
        <EventosStats eventos={eventos} />

        {/* Navigation Tabs - Premium style */}
        <div className="relative">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto scrollbar-hide snap-x snap-mandatory bg-card/60 backdrop-blur-xl border border-border/40 p-1">
              <TabsTrigger value="todos" className="snap-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Todos</TabsTrigger>
              <TabsTrigger value="proximos7" className="snap-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">Próximos 7 Dias</TabsTrigger>
              <TabsTrigger value="esteMes" className="snap-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">Este Mês</TabsTrigger>
              <TabsTrigger value="proximoMes" className="snap-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">Próximo Mês</TabsTrigger>
              <TabsTrigger value="finalizados" className="snap-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Finalizados</TabsTrigger>
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
                <Button
                  variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-none h-10 w-10 hover:bg-primary/10"
                  onClick={() => setViewMode('kanban')}
                >
                  <Kanban className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-none h-10 w-10 hover:bg-primary/10"
                  onClick={() => setViewMode('calendar')}
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
              
              <Button onClick={() => setQuickCreateOpen(true)} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Criação Rápida
              </Button>

            </div>
          </div>

          {/* Results counter with premium styling */}
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Mostrando</span>
              <span className="px-2 py-1 rounded-lg bg-primary/10 text-primary font-bold text-base">{sortedEventos.length}</span>
              <span className="text-muted-foreground">de</span>
              <span className="px-2 py-1 rounded-lg bg-muted/50 font-semibold">{totalCount}</span>
              <span className="text-muted-foreground">eventos</span>
            </div>

            {/* Pagination */}
            {totalCount > pageSize && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, Math.ceil(totalCount / pageSize)) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink 
                          onClick={() => setPage(pageNum)} 
                          isActive={page === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.min(Math.ceil(totalCount / pageSize), page + 1))}
                      disabled={page >= Math.ceil(totalCount / pageSize)}
                      className="gap-1"
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>

        {/* Events Views */}
        {viewMode === 'grid' && (
          <EventosList
            eventos={sortedEventos}
            onViewDetails={handleViewDetails}
            onEdit={handleEditarEvento}
            onDelete={handleDeletarEvento}
            onChangeStatus={handleAlterarStatus}
          />
        )}
        
        {viewMode === 'list' && (
          <EventosListAccordion
            eventos={sortedEventos}
            onViewDetails={handleViewDetails}
          />
        )}
        
        {viewMode === 'kanban' && (
          <EventosKanbanView
            eventos={sortedEventos}
            onViewDetails={handleViewDetails}
          />
        )}
        
        {viewMode === 'calendar' && (
          <EventosCalendarView
            eventos={sortedEventos}
            onEventoClick={handleViewDetails}
          />
        )}

        <QuickCreateEventSheet
          open={quickCreateOpen}
          onOpenChange={setQuickCreateOpen}
        />
      </div>
    </div>
  );
}
