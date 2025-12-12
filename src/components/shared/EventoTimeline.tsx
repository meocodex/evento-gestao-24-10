import { TimelineItem } from '@/types/eventos';
import { 
  CalendarPlus, 
  Pencil, 
  CheckCircle2, 
  PackagePlus, 
  Send, 
  MapPin, 
  Play, 
  RotateCcw, 
  Flag, 
  Ban, 
  DollarSign,
  Calendar,
  LucideIcon
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface EventoTimelineProps {
  timeline: TimelineItem[];
}

const tipoLabels: Record<string, string> = {
  criacao: 'Evento Criado',
  edicao: 'Evento Editado',
  confirmacao: 'Evento Confirmado',
  alocacao: 'Material Alocado',
  envio: 'Material Enviado',
  entrega: 'Material Entregue',
  execucao: 'Evento em Execução',
  retorno: 'Material Retornado',
  fechamento: 'Evento Fechado',
  cancelamento: 'Evento Cancelado',
  financeiro: 'Movimentação Financeira',
};

const tipoIcons: Record<string, LucideIcon> = {
  criacao: CalendarPlus,
  edicao: Pencil,
  confirmacao: CheckCircle2,
  alocacao: PackagePlus,
  envio: Send,
  entrega: MapPin,
  execucao: Play,
  retorno: RotateCcw,
  fechamento: Flag,
  cancelamento: Ban,
  financeiro: DollarSign,
};

const tipoColors: Record<string, string> = {
  criacao: 'text-blue-500 dark:text-blue-400',
  edicao: 'text-slate-500 dark:text-slate-400',
  confirmacao: 'text-emerald-500 dark:text-emerald-400',
  alocacao: 'text-purple-500 dark:text-purple-400',
  envio: 'text-orange-500 dark:text-orange-400',
  entrega: 'text-amber-600 dark:text-amber-500',
  execucao: 'text-sky-600 dark:text-sky-500',
  retorno: 'text-teal-500 dark:text-teal-400',
  fechamento: 'text-green-600 dark:text-green-500',
  cancelamento: 'text-red-500 dark:text-red-400',
  financeiro: 'text-yellow-600 dark:text-yellow-500',
};

export function EventoTimeline({ timeline }: EventoTimelineProps) {
  if (!timeline || timeline.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Nenhuma atividade registrada ainda.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {timeline.map((item) => {
        const Icon = tipoIcons[item.tipo] || Calendar;
        const colorClass = tipoColors[item.tipo] || 'text-muted-foreground';
        const label = tipoLabels[item.tipo] || item.tipo;

        return (
          <div 
            key={item.id} 
            className="flex items-center gap-2 py-1.5 hover:bg-muted/50 rounded-md px-2 -mx-2 transition-colors"
          >
            <div className={`rounded-full p-1.5 bg-muted shrink-0 ${colorClass}`}>
              <Icon className="h-3 w-3" />
            </div>
            <div className="flex-1 min-w-0 flex items-center gap-1.5">
              <span className="font-medium text-sm">{label}</span>
              <span className="text-xs text-muted-foreground truncate">· {item.usuario}</span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <time className="text-xs text-muted-foreground whitespace-nowrap shrink-0 cursor-help">
                  {formatDistanceToNow(new Date(item.data), { addSuffix: true, locale: ptBR })}
                </time>
              </TooltipTrigger>
              <TooltipContent side="left">
                {format(new Date(item.data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </TooltipContent>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
}
