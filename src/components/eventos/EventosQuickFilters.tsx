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
        return diasAteEvento >= 0 && diasAteEvento < 7 && e.status !== 'concluido' && e.status !== 'cancelado';
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
    <div className="flex flex-wrap gap-2">
      {filters.map(filter => (
        <Badge
          key={filter.id}
          variant={activeFilter === filter.id ? filter.variant : 'outline'}
          className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
            activeFilter === filter.id ? 'ring-2 ring-ring ring-offset-2' : ''
          }`}
          onClick={() => onFilterChange(activeFilter === filter.id ? null : filter.id)}
        >
          <filter.icon className="h-3 w-3 mr-1" />
          {filter.label}
          <span className="ml-1 font-bold">({filter.count})</span>
        </Badge>
      ))}
    </div>
  );
}