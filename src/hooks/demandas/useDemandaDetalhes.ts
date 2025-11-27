import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { transformDemanda } from '@/contexts/demandas/transformDemanda';

export function useDemandaDetalhes(demandaId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['demanda-detalhes', demandaId],
    enabled: !!demandaId,
    queryFn: async () => {
      if (!demandaId) return null;

      const { data, error } = await supabase
        .from('demandas')
        .select('*')
        .eq('id', demandaId)
        .single();

      if (error) throw error;
      return data ? transformDemanda(data) : null;
    },
    staleTime: 1000 * 60, // 1 minuto (com real-time específico não precisa ser 0)
  });

  // Real-time listener para essa demanda específica
  useEffect(() => {
    if (!demandaId) return;
    
    const channel = supabase
      .channel(`demanda-${demandaId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'demandas', 
          filter: `id=eq.${demandaId}` 
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['demanda-detalhes', demandaId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [demandaId, queryClient]);

  return query;
}
