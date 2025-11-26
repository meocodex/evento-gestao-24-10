import { Badge } from '@/components/ui/badge';
import { StatusEvento } from '@/types/eventos';

interface StatusBadgeProps {
  status: StatusEvento;
}

const statusConfig: Record<StatusEvento, { label: string; className: string }> = {
  em_negociacao: { 
    label: 'Em Negociação', 
    className: 'bg-warning/20 text-warning border-2 border-warning/40 hover:bg-warning/30 dark:bg-warning/30 dark:border-warning/50' 
  },
  confirmado: { 
    label: 'Confirmado', 
    className: 'bg-success/20 text-success border-2 border-success/40 hover:bg-success/30 dark:bg-success/30 dark:border-success/50' 
  },
  em_preparacao: { 
    label: 'Em Preparação', 
    className: 'bg-purple-500/20 text-purple-500 border-2 border-purple-500/40 hover:bg-purple-500/30 dark:bg-purple-500/30 dark:border-purple-500/50 dark:text-purple-400' 
  },
  em_execucao: { 
    label: 'Em Execução', 
    className: 'bg-primary/20 text-primary border-2 border-primary/40 hover:bg-primary/30 dark:bg-primary/30 dark:border-primary/50' 
  },
  finalizado: { 
    label: 'Finalizado', 
    className: 'bg-success/20 text-success border-2 border-success/40 hover:bg-success/30 dark:bg-success/30 dark:border-success/50' 
  },
  arquivado: {
    label: 'Arquivado',
    className: 'bg-muted text-muted-foreground border-2 border-border hover:bg-muted/80'
  },
  cancelado: { 
    label: 'Cancelado', 
    className: 'bg-destructive/20 text-destructive border-2 border-destructive/40 hover:bg-destructive/30 dark:bg-destructive/30 dark:border-destructive/50' 
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge className={`${config.className} font-semibold px-3 py-1 rounded-full text-xs uppercase tracking-wide`}>
      {config.label}
    </Badge>
  );
}
