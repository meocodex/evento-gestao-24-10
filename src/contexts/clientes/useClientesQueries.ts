import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Cliente } from '@/types/eventos';

export function useClientesQueries(page = 1, pageSize = 20) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['clientes', page, pageSize],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error, count } = await supabase
        .from('clientes')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      return { 
        clientes: (data || []) as Cliente[], 
        totalCount: count || 0 
      };
    },
    staleTime: 1000 * 60 * 30, // 30 minutos (clientes mudam raramente)
    gcTime: 1000 * 60 * 60, // 1 hora
  });

  return {
    clientes: data?.clientes || [],
    totalCount: data?.totalCount || 0,
    loading: isLoading,
    error,
    refetch
  };
}
