import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Cliente } from '@/types/eventos';
import { useDebounce } from '@/hooks/useDebounce';

export function useClientesQueries(page = 1, pageSize = 20, searchTerm?: string, enabled = true) {
  // Debounce do termo de busca
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['clientes', page, pageSize, debouncedSearchTerm],
    enabled,
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Se houver termo de busca, usar Full-Text Search otimizado
      if (debouncedSearchTerm && debouncedSearchTerm.trim().length > 0) {
        const { data: searchResults, error: searchError } = await supabase
          .rpc('search_clientes', {
            query_text: debouncedSearchTerm.trim(),
            limit_count: pageSize
          });

        if (searchError) throw searchError;

        const clientesIds = (searchResults || []).map((r: any) => r.id);
        
        if (clientesIds.length === 0) {
          return { clientes: [], totalCount: 0 };
        }

        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .in('id', clientesIds);

        if (error) throw error;

        return {
          clientes: (data || []) as Cliente[],
          totalCount: (data || []).length
        };
      }
      
      // Query normal (sem busca)
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
    staleTime: 1000 * 60 * 15, // 15 minutos (clientes são relativamente estáveis)
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
