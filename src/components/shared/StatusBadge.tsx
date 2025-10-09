import { Badge } from '@/components/ui/badge';
import { StatusEvento } from '@/types/eventos';

interface StatusBadgeProps {
  status: StatusEvento;
}

const statusConfig: Record<StatusEvento, { label: string; className: string }> = {
  orcamento_enviado: { label: 'Orçamento Enviado', className: 'bg-yellow-500 hover:bg-yellow-600' },
  confirmado: { label: 'Confirmado', className: 'bg-green-500 hover:bg-green-600' },
  materiais_alocados: { label: 'Materiais Alocados', className: 'bg-blue-500 hover:bg-blue-600' },
  em_preparacao: { label: 'Em Preparação', className: 'bg-purple-500 hover:bg-purple-600' },
  em_andamento: { label: 'Em Andamento', className: 'bg-gray-800 hover:bg-gray-900' },
  aguardando_retorno: { label: 'Aguardando Retorno', className: 'bg-orange-500 hover:bg-orange-600' },
  aguardando_fechamento: { label: 'Aguardando Fechamento', className: 'bg-gray-400 hover:bg-gray-500' },
  finalizado: { label: 'Finalizado', className: 'bg-green-600 hover:bg-green-700' },
  cancelado: { label: 'Cancelado', className: 'bg-red-500 hover:bg-red-600' },
  aguardando_alocacao: { label: 'Aguardando Alocação', className: 'bg-yellow-600 hover:bg-yellow-700' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
}
