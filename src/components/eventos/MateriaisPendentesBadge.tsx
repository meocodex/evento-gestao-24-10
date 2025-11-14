import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { useMaterialPendente } from '@/hooks/eventos/useMaterialPendente';

interface MateriaisPendentesBadgeProps {
  eventoId: string;
  status: string;
}

export function MateriaisPendentesBadge({ eventoId, status }: MateriaisPendentesBadgeProps) {
  const { data: pendentes } = useMaterialPendente(eventoId);

  if (status !== 'finalizado' || !pendentes?.temPendentes) {
    return null;
  }

  return (
    <Badge variant="warning" className="gap-1">
      <AlertTriangle className="h-3 w-3" />
      {pendentes.quantidade} {pendentes.quantidade === 1 ? 'material pendente' : 'materiais pendentes'}
    </Badge>
  );
}
