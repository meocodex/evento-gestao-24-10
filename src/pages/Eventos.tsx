import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, Grid3x3, List, ArrowUpDown, Kanban, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const { eventos = [], totalCount = 0 } = useEventos(page, pageSize, searchTerm);
  const navigate = useNavigate();
  const [filters, setFilters] = useState<EventoFiltersType>({ 
    status: [], 
    cidade: '', 
    tags: [], 
    incluirArquivados: false,
    urgentes: false,
    altaPrioridade: false,
  });
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const permissions = usePermissions();
  const [activeTab, setActiveTab] = useState<string>('todos');
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
      // Filtro de arquivados - mostra não arquivados sempre, arquivados apenas se filtro ativo
      const matchArquivado = !evento.arquivado || filters.incluirArquivados;
      
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
      
      // Quick filters (from advanced filters)
      let matchUrgentes = true;
      if (filters.urgentes) {
        const dataEvento = parseISO(evento.dataInicio);
        const diasAteEvento = differenceInDays(dataEvento, hoje);
        matchUrgentes = diasAteEvento >= 0 && diasAteEvento < 7 && evento.status !== 'finalizado' && evento.status !== 'cancelado';
      }
      
      let matchAltaPrioridade = true;
      if (filters.altaPrioridade) {
        matchAltaPrioridade = evento.tags.includes('Alta Prioridade');
      }
      
      return matchArquivado && matchSearch && matchStatus && matchCidade && matchTags && matchTab && matchUrgentes && matchAltaPrioridade;
    });
  }, [eventos, searchTerm, filters, activeTab]);

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
        {/* Stats Cards - Desktop only */}
        <div className="hidden md:block">
          <EventosStats eventos={eventos} />
        </div>

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

          {/* Counter + Pagination - pushed right */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            <span className="hidden xl:flex items-center gap-1 text-xs text-muted-foreground">
              <span className="font-semibold text-primary">{sortedEventos.length}</span>/<span>{totalCount}</span>
            </span>

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
