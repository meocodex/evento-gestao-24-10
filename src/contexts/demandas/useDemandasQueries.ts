import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformDemanda } from './transformDemanda';
import { Demanda } from '@/types/demandas';

export function useDemandasQueries() {
  const { data: demandas, isLoading, error, refetch } = useQuery({
    queryKey: ['demandas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('demandas')
        .select(`
          *,
          comentarios:demandas_comentarios(*),
          anexos:demandas_anexos(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(transformDemanda);
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  return {
    demandas: (demandas || []) as Demanda[],
    loading: isLoading,
    error,
    refetch
  };
}
