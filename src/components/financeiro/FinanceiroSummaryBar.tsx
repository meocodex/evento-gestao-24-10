import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

interface FinanceiroSummaryBarProps {
  pendente: number;
  vencidas: number;
  pagasNoMes: number;
  tipo: 'pagar' | 'receber';
}

export function FinanceiroSummaryBar({ pendente, vencidas, pagasNoMes, tipo }: FinanceiroSummaryBarProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const labelPagasRecebidas = tipo === 'pagar' ? 'Pagas no Mês' : 'Recebidas no Mês';

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/30 border rounded-lg">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Pendente:</span>
        <Badge variant="outline" className="font-bold text-primary border-primary/30">
          {formatCurrency(pendente)}
        </Badge>
      </div>
      
      <div className="h-4 w-px bg-border hidden sm:block" />
      
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <span className="text-sm text-muted-foreground">Vencidas:</span>
        <Badge variant="destructive" className="font-bold">
          {formatCurrency(vencidas)}
        </Badge>
      </div>
      
      <div className="h-4 w-px bg-border hidden sm:block" />
      
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-success" />
        <span className="text-sm text-muted-foreground">{labelPagasRecebidas}:</span>
        <Badge variant="secondary" className="font-bold text-success border-success/30">
          {formatCurrency(pagasNoMes)}
        </Badge>
      </div>
    </div>
  );
}
