import { useMemo } from 'react';
import { Evento } from '@/types/eventos';
import { CalendarCheck, AlertTriangle, CalendarClock, CheckCircle2 } from 'lucide-react';
import { differenceInDays, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

interface EventosStatsProps {
  eventos: Evento[];
}

export function EventosStats({ eventos }: EventosStatsProps) {
  const stats = useMemo(() => {
    const hoje = new Date();
    const inicioMes = startOfMonth(hoje);
    const fimMes = endOfMonth(hoje);

    const eventosProximos7Dias = eventos.filter(e => {
      const dataEvento = parseISO(e.dataInicio);
      const diasAteEvento = differenceInDays(dataEvento, hoje);
      return diasAteEvento >= 0 && diasAteEvento <= 7;
    }).length;

    const eventosUrgentes = eventos.filter(e => {
      const dataEvento = parseISO(e.dataInicio);
      const diasAteEvento = differenceInDays(dataEvento, hoje);
      return diasAteEvento >= 0 && diasAteEvento < 7 && e.status !== 'finalizado' && e.status !== 'cancelado';
    }).length;

    const eventosFinalizadosEsteMes = eventos.filter(e => {
      if (e.status !== 'finalizado') return false;
      const dataFim = parseISO(e.dataFim);
      return isWithinInterval(dataFim, { start: inicioMes, end: fimMes });
    }).length;

    return {
      total: eventos.length,
      proximos7Dias: eventosProximos7Dias,
      urgentes: eventosUrgentes,
      finalizadosEsteMes: eventosFinalizadosEsteMes,
    };
  }, [eventos]);

  const statsCards = [
    {
      title: 'Total de Eventos',
      value: stats.total,
      icon: CalendarCheck,
      gradient: 'from-primary/20 to-accent/20',
      iconColor: 'text-primary',
    },
    {
      title: 'Próximos 7 Dias',
      value: stats.proximos7Dias,
      icon: CalendarClock,
      gradient: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Eventos Urgentes',
      value: stats.urgentes,
      icon: AlertTriangle,
      gradient: 'from-warning/20 to-destructive/20',
      iconColor: 'text-warning',
    },
    {
      title: 'Finalizados Este Mês',
      value: stats.finalizadosEsteMes,
      icon: CheckCircle2,
      gradient: 'from-success/20 to-emerald-500/20',
      iconColor: 'text-success',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {statsCards.map((stat, index) => (
        <div
          key={stat.title}
          className="relative overflow-hidden rounded-xl border bg-card p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in group"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50 group-hover:opacity-70 transition-opacity`} />
          
          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-2">
              <div className={`p-2 rounded-lg bg-background/50 backdrop-blur-sm ${stat.iconColor} transition-transform group-hover:scale-110`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            
            <p className="text-2xl font-display font-bold mb-1">{stat.value}</p>
            <p className="text-xs text-muted-foreground font-medium">{stat.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}