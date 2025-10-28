import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMaterialPendente(eventoId: string) {
  return useQuery({
    queryKey: ['materiais-pendentes', eventoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos_materiais_alocados')
        .select('id, nome, serial')
        .eq('evento_id', eventoId)
        .eq('status_devolucao', 'pendente');

      if (error) throw error;
      
      return {
        temPendentes: (data?.length || 0) > 0,
        quantidade: data?.length || 0,
        materiais: data || []
      };
    },
    enabled: !!eventoId,
    staleTime: 30000, // 30 segundos
  });
}
