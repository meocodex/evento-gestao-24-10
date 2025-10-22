import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformDemanda } from './transformDemanda';
import { Demanda } from '@/types/demandas';

export function useDemandasQueries(page = 1, pageSize = 20, enabled = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['demandas', page, pageSize],
    enabled,
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error, count } = await supabase
        .from('demandas')
        .select(`
          *,
          comentarios:demandas_comentarios(*),
          anexos:demandas_anexos(*)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      return {
        demandas: (data || []).map(transformDemanda),
        totalCount: count || 0
      };
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
    gcTime: 1000 * 60 * 30,
  });

  return {
    demandas: data?.demandas || [],
    totalCount: data?.totalCount || 0,
    loading: isLoading,
    error,
    refetch
  };
}
