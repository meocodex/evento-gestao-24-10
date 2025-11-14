import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Clock, Zap } from 'lucide-react';
import { Evento } from '@/types/eventos';
import { useMemo } from 'react';
import { differenceInDays, parseISO } from 'date-fns';

interface EventosQuickFiltersProps {
  eventos: Evento[];
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

export function EventosQuickFilters({ eventos, activeFilter, onFilterChange }: EventosQuickFiltersProps) {
  const filterCounts = useMemo(() => {
    const hoje = new Date();
    
    return {
      urgentes: eventos.filter(e => {
        const dataEvento = parseISO(e.dataInicio);
        const diasAteEvento = differenceInDays(dataEvento, hoje);
        return diasAteEvento >= 0 && diasAteEvento < 7 && e.status !== 'finalizado' && e.status !== 'cancelado';
      }).length,
      confirmados: eventos.filter(e => e.status === 'confirmado').length,
      emPreparacao: eventos.filter(e => e.status === 'em_preparacao').length,
      altaPrioridade: eventos.filter(e => e.tags.includes('Alta Prioridade')).length,
    };
  }, [eventos]);

  const filters = [
    {
      id: 'urgentes',
      label: 'Urgentes',
      count: filterCounts.urgentes,
      icon: AlertTriangle,
      variant: 'destructive' as const,
    },
    {
      id: 'confirmados',
      label: 'Confirmados',
      count: filterCounts.confirmados,
      icon: CheckCircle2,
      variant: 'success' as const,
    },
    {
      id: 'emPreparacao',
      label: 'Em Preparação',
      count: filterCounts.emPreparacao,
      icon: Clock,
      variant: 'default' as const,
    },
    {
      id: 'altaPrioridade',
      label: 'Alta Prioridade',
      count: filterCounts.altaPrioridade,
      icon: Zap,
      variant: 'warning' as const,
    },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1">
      {filters.map(filter => (
        <Badge
          key={filter.id}
          variant={activeFilter === filter.id ? filter.variant : 'outline'}
          className={`cursor-pointer transition-all snap-start whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 ${
            activeFilter === filter.id ? 'ring-2 ring-ring ring-offset-1' : ''
          }`}
          onClick={() => onFilterChange(activeFilter === filter.id ? null : filter.id)}
        >
          <filter.icon className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="hidden xs:inline">{filter.label}</span>
          <span className="xs:hidden">{filter.label.substring(0, 4)}</span>
          <span className="ml-1 font-bold">({filter.count})</span>
        </Badge>
      ))}
    </div>
  );
}