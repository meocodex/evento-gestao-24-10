import { Badge } from '@/components/ui/badge';
import { StatusEvento } from '@/types/eventos';

interface StatusBadgeProps {
  status: StatusEvento;
}

const statusConfig: Record<StatusEvento, { label: string; className: string }> = {
  em_negociacao: { 
    label: 'Em Negociação', 
    className: 'bg-amber-100 text-amber-800 border-2 border-amber-300 hover:bg-amber-200' 
  },
  confirmado: { 
    label: 'Confirmado', 
    className: 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300 hover:bg-emerald-200' 
  },
  em_preparacao: { 
    label: 'Em Preparação', 
    className: 'bg-purple-100 text-purple-800 border-2 border-purple-300 hover:bg-purple-200' 
  },
  em_execucao: { 
    label: 'Em Execução', 
    className: 'bg-blue-100 text-blue-800 border-2 border-blue-300 hover:bg-blue-200' 
  },
  finalizado: { 
    label: 'Finalizado', 
    className: 'bg-green-100 text-green-800 border-2 border-green-300 hover:bg-green-200' 
  },
  arquivado: {
    label: 'Arquivado',
    className: 'bg-slate-100 text-slate-800 border-2 border-slate-300 hover:bg-slate-200'
  },
  cancelado: { 
    label: 'Cancelado', 
    className: 'bg-red-100 text-red-800 border-2 border-red-300 hover:bg-red-200' 
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
