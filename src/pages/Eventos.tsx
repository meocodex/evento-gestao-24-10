import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, Grid3x3, List, ArrowUpDown, Kanban, Sparkles, Calendar, ChevronLeft, ChevronRight, Archive } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Evento } from '@/types/eventos';
import { EventosList } from '@/components/eventos/EventosList';
import { EventosListAccordion } from '@/components/eventos/EventosListAccordion';
import { EventosKanbanView } from '@/components/eventos/EventosKanbanView';
import { EventosCalendarView } from '@/components/eventos/EventosCalendarView';
import { QuickCreateEventSheet } from '@/components/eventos/QuickCreateEventSheet';
import { EventoFilters, EventoFiltersType } from '@/components/eventos/EventoFilters';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { useEventos } from '@/hooks/eventos';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [mostrarArquivados, setMostrarArquivados] = useState(false);
  const { eventos = [], totalCount = 0 } = useEventos(page, pageSize, searchTerm);
  const navigate = useNavigate();
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
      // Filtro de arquivados
      const matchArquivado = evento.arquivado === mostrarArquivados;
      
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
      
      return matchArquivado && matchSearch && matchStatus && matchCidade && matchTags && matchTab && matchQuickFilter;
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
    <div className="min-h-full overflow-x-hidden">
      {/* Container responsivo sem max-width fixo */}
      <div className="w-full px-3 sm:px-6 py-4 sm:py-6 space-y-4 animate-fade-in bg-background">
        {/* Navy Hero Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            Eventos
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gerencie todos os eventos da sua empresa
          </p>
        </div>

        {/* Stats Cards */}
        <EventosStats eventos={eventos} />

        {/* Single Unified Toolbar */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-3 p-2 sm:p-3 rounded-2xl glass-card">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-shrink-0">
            <TabsList className="h-8 p-0.5 bg-muted/50">
              <TabsTrigger value="todos" className="text-xs px-2 h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Todos</TabsTrigger>
              <TabsTrigger value="proximos7" className="text-xs px-2 h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">7D</TabsTrigger>
              <TabsTrigger value="esteMes" className="text-xs px-2 h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Mês</TabsTrigger>
              <TabsTrigger value="proximoMes" className="text-xs px-2 h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hidden lg:flex">Próx</TabsTrigger>
              <TabsTrigger value="finalizados" className="text-xs px-2 h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hidden lg:flex">Fin</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="hidden xl:block h-6 w-px bg-border/50" />

          {/* Quick Filters */}
          <div className="hidden lg:flex gap-1.5 flex-shrink-0">
            <EventosQuickFilters 
              eventos={eventos}
              activeFilter={quickFilter}
              onFilterChange={setQuickFilter}
            />
          </div>

          <div className="hidden xl:block h-6 w-px bg-border/50" />

          {/* Search */}
          <div className="relative min-w-[100px] max-w-[140px] flex-shrink">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-8 h-8 text-xs bg-background/60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="hidden xl:block h-6 w-px bg-border/50" />

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[90px] h-8 text-xs">
              <ArrowUpDown className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              <SelectValue placeholder="Ord" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dataProxima">Data ↑</SelectItem>
              <SelectItem value="dataDistante">Data ↓</SelectItem>
              <SelectItem value="nomeAZ">Nome</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="ultimaAtualizacao">Atualiz.</SelectItem>
            </SelectContent>
          </Select>

          {/* Filters */}
          <EventoFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableCities={availableCities}
            availableTags={availableTags}
          />

          <div className="hidden xl:block h-6 w-px bg-border/50" />

          {/* View Mode */}
          <div className="flex border border-border/60 rounded-lg overflow-hidden bg-background/40">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-none h-8 w-8"
              onClick={() => setViewMode('grid')}
              aria-label="Grade"
            >
              <Grid3x3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-none h-8 w-8"
              onClick={() => setViewMode('list')}
              aria-label="Lista"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-none h-8 w-8"
              onClick={() => setViewMode('kanban')}
              aria-label="Kanban"
            >
              <Kanban className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-none h-8 w-8"
              onClick={() => setViewMode('calendar')}
              aria-label="Calendário"
            >
              <Calendar className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Create */}
          <Button onClick={() => setQuickCreateOpen(true)} size="sm" className="gap-1 h-8 text-xs px-2.5">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Criar</span>
          </Button>

          {/* Counter + Archived + Pagination - pushed right */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            <span className="hidden xl:flex items-center gap-1 text-xs text-muted-foreground">
              <span className="font-semibold text-primary">{sortedEventos.length}</span>/<span>{totalCount}</span>
            </span>
            
            <div className="flex items-center gap-1.5">
              <Switch
                id="arquivados"
                checked={mostrarArquivados}
                onCheckedChange={setMostrarArquivados}
                className="scale-75"
              />
              <Label htmlFor="arquivados" className="text-xs flex items-center gap-1 cursor-pointer">
                <Archive className="h-3 w-3" />
              </Label>
            </div>

            {totalCount > pageSize && (
              <>
                <div className="h-6 w-px bg-border/50" />
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-xs text-muted-foreground">{page}/{Math.ceil(totalCount / pageSize)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPage(Math.min(Math.ceil(totalCount / pageSize), page + 1))}
                    disabled={page >= Math.ceil(totalCount / pageSize)}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Filters - mobile/tablet only */}
        <div className="flex lg:hidden gap-2 overflow-x-auto scrollbar-hide p-2 rounded-xl glass-card">
          <EventosQuickFilters 
            eventos={eventos}
            activeFilter={quickFilter}
            onFilterChange={setQuickFilter}
          />
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
