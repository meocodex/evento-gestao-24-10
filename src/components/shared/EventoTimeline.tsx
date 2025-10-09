import { TimelineItem } from '@/types/eventos';
import { Calendar, CheckCircle, Package, Truck, Users, FileCheck, XCircle, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventoTimelineProps {
  timeline: TimelineItem[];
}

const tipoIcons = {
  criacao: Calendar,
  edicao: Edit,
  confirmacao: CheckCircle,
  alocacao: Package,
  envio: Truck,
  entrega: Truck,
  execucao: Users,
  retorno: Truck,
  fechamento: FileCheck,
  cancelamento: XCircle,
};

const tipoColors = {
  criacao: 'text-blue-500',
  edicao: 'text-gray-500',
  confirmacao: 'text-green-500',
  alocacao: 'text-purple-500',
  envio: 'text-orange-500',
  entrega: 'text-orange-600',
  execucao: 'text-blue-600',
  retorno: 'text-yellow-500',
  fechamento: 'text-green-600',
  cancelamento: 'text-red-500',
};

export function EventoTimeline({ timeline }: EventoTimelineProps) {
  return (
    <div className="space-y-4">
      {timeline.map((item, index) => {
        const Icon = tipoIcons[item.tipo];
        const colorClass = tipoColors[item.tipo];

        return (
          <div key={item.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`rounded-full p-2 bg-background border-2 ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              {index < timeline.length - 1 && (
                <div className="w-0.5 h-full bg-border mt-2" />
              )}
            </div>
            <div className="flex-1 pb-8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{item.descricao}</p>
                  <p className="text-sm text-muted-foreground">{item.usuario}</p>
                </div>
                <time className="text-xs text-muted-foreground">
                  {format(new Date(item.data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </time>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
