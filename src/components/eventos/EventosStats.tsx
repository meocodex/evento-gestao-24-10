import { useMemo } from 'react';
import { Evento } from '@/types/eventos';
import { StatCard } from '@/components/dashboard/StatCard';
import { Calendar, CheckCircle, Clock } from 'lucide-react';

interface EventosStatsProps {
  eventos: Evento[];
}

export function EventosStats({ eventos }: EventosStatsProps) {
  const stats = useMemo(() => {
    const confirmados = eventos.filter(e => e.status === 'confirmado' || e.status === 'em_preparacao').length;
    const emExecucao = eventos.filter(e => e.status === 'em_execucao').length;

    return {
      total: eventos.length,
      confirmados,
      emExecucao,
    };
  }, [eventos]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
        <StatCard
          title="Total de Eventos"
          value={stats.total.toString()}
          subtitle="Mês atual"
          icon={Calendar}
          variant="primary"
        />
      </div>
      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <StatCard
          title="Confirmados"
          value={stats.confirmados.toString()}
          subtitle="Aguardando"
          icon={CheckCircle}
          variant="success"
        />
      </div>
      <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <StatCard
          title="Em Execução"
          value={stats.emExecucao.toString()}
          subtitle="Acontecendo agora"
          icon={Clock}
          variant="default"
        />
      </div>
    </div>
  );
}
