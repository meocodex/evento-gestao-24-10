import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Cliente } from '@/types/eventos';

export function useClientesQueries(page = 1, pageSize = 20, searchTerm?: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['clientes', page, pageSize, searchTerm],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      let query = supabase
        .from('clientes')
        .select('*', { count: 'exact' });

      // Usar full-text search nativo quando houver termo de busca
      if (searchTerm && searchTerm.trim().length > 0) {
        query = query.textSearch('search_vector', searchTerm.trim(), {
          type: 'websearch',
          config: 'portuguese'
        });
      }

      const { data, error, count } = await query
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
