import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StatCard } from '@/components/dashboard/StatCard';
import { Calendar, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export function EventosStatsOptimized() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['eventos-stats-optimized'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_eventos_stats')
        .select('*');
      
      if (error) throw error;

      const totals = {
        total: 0,
        confirmados: 0,
        emExecucao: 0,
        concluidos: 0,
      };

      data?.forEach(row => {
        totals.total += row.total || 0;
        if (row.status === 'confirmado' || row.status === 'em_preparacao') {
          totals.confirmados += row.total || 0;
        }
        if (row.status === 'em_execucao') {
          totals.emExecucao += row.total || 0;
        }
        if (row.status === 'concluido') {
          totals.concluidos += row.total || 0;
        }
      });

      return totals;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos (view materializada)
  });

  if (isLoading || !stats) return null;

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
