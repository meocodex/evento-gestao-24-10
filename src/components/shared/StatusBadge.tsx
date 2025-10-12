import { Badge } from '@/components/ui/badge';
import { StatusEvento } from '@/types/eventos';

interface StatusBadgeProps {
  status: StatusEvento;
}

const statusConfig: Record<StatusEvento, { label: string; className: string }> = {
  orcamento_enviado: { 
    label: 'Orçamento', 
    className: 'bg-amber-100 text-amber-800 border-2 border-amber-300 hover:bg-amber-200' 
  },
  confirmado: { 
    label: 'Confirmado', 
    className: 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300 hover:bg-emerald-200' 
  },
  materiais_alocados: { 
    label: 'Materiais OK', 
    className: 'bg-navy-100 text-navy-800 border-2 border-navy-300 hover:bg-navy-200' 
  },
  em_preparacao: { 
    label: 'Em Preparação', 
    className: 'bg-purple-100 text-purple-800 border-2 border-purple-300 hover:bg-purple-200' 
  },
  em_andamento: { 
    label: 'Em Andamento', 
    className: 'bg-slate-100 text-slate-800 border-2 border-slate-300 hover:bg-slate-200' 
  },
  aguardando_retorno: { 
    label: 'Aguardando Retorno', 
    className: 'bg-orange-100 text-orange-800 border-2 border-orange-300 hover:bg-orange-200' 
  },
  aguardando_fechamento: { 
    label: 'Aguardando Fechamento', 
    className: 'bg-gray-100 text-gray-800 border-2 border-gray-300 hover:bg-gray-200' 
  },
  finalizado: { 
    label: 'Finalizado', 
    className: 'bg-green-100 text-green-800 border-2 border-green-300 hover:bg-green-200' 
  },
  cancelado: { 
    label: 'Cancelado', 
    className: 'bg-red-100 text-red-800 border-2 border-red-300 hover:bg-red-200' 
  },
  aguardando_alocacao: { 
    label: 'Aguardando Alocação', 
    className: 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300 hover:bg-yellow-200' 
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
