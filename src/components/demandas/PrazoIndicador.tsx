import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { differenceInDays, differenceInHours, isPast } from 'date-fns';

interface PrazoIndicadorProps {
  prazo: string;
  compact?: boolean;
}

export function PrazoIndicador({ prazo, compact = false }: PrazoIndicadorProps) {
  const dataPrazo = new Date(prazo);
  const agora = new Date();
  
  const diasRestantes = differenceInDays(dataPrazo, agora);
  const horasRestantes = differenceInHours(dataPrazo, agora);
  const vencido = isPast(dataPrazo);

  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
  let icon = Clock;
  let texto = '';
  let className = '';

  if (vencido) {
    variant = 'destructive';
    icon = AlertTriangle;
    className = 'bg-red-500/10 text-red-600 border-red-500/20';
    const diasVencidos = Math.abs(diasRestantes);
    texto = compact 
      ? `Vencido ${diasVencidos}d`
      : `Vencido há ${diasVencidos} dia${diasVencidos !== 1 ? 's' : ''}`;
  } else if (diasRestantes === 0) {
    variant = 'destructive';
    icon = AlertTriangle;
    className = 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    const horasRest = Math.max(0, horasRestantes);
    texto = compact
      ? `Hoje ${horasRest}h`
      : `Hoje (${horasRest}h restantes)`;
  } else if (diasRestantes <= 3) {
    variant = 'outline';
    icon = AlertTriangle;
    className = 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    texto = compact
      ? `${diasRestantes}d`
      : `${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''} restante${diasRestantes !== 1 ? 's' : ''}`;
  } else {
    variant = 'secondary';
    icon = CheckCircle2;
    className = 'bg-green-500/10 text-green-600 border-green-500/20';
    texto = compact
      ? `${diasRestantes}d`
      : `${diasRestantes} dias restantes`;
  }

  const Icon = icon;

  return (
    <Badge variant={variant} className={className}>
      <Icon className="h-3 w-3 mr-1" />
      {texto}
    </Badge>
  );
}
