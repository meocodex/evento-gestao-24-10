import { useMemo } from 'react';
import { Evento } from '@/types/eventos';
import { StatCard } from '@/components/dashboard/StatCard';
import { Calendar, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface EventosStatsProps {
  eventos: Evento[];
}

export function EventosStats({ eventos }: EventosStatsProps) {
  const stats = useMemo(() => {
    const confirmados = eventos.filter(e => e.status === 'confirmado' || e.status === 'em_preparacao').length;
    const emExecucao = eventos.filter(e => e.status === 'em_execucao').length;
    const concluidos = eventos.filter(e => e.status === 'concluido').length;

    return {
      total: eventos.length,
      confirmados,
      emExecucao,
      concluidos,
    };
  }, [eventos]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          subtitle="Aguardando execução"
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
      <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
        <StatCard
          title="Concluídos"
          value={stats.concluidos.toString()}
          subtitle="Finalizados"
          icon={TrendingUp}
          variant="default"
        />
      </div>
    </div>
  );
}
