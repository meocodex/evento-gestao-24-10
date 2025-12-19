import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformDemanda } from './transformDemanda';
import { Demanda } from '@/types/demandas';
import { useDebounce } from '@/hooks/useDebounce';
import { SearchResultRow, RawDemandaFromDB } from '@/types/utils';

// Interface para demanda com relações do banco
interface RawDemandaWithRelations extends RawDemandaFromDB {
  // As relações já estão definidas na interface base como opcionais
}

export function useDemandasQueries(page = 1, pageSize = 20, searchTerm?: string, enabled = true) {
  // Debounce do termo de busca
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['demandas', page, pageSize, debouncedSearchTerm],
    enabled,
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Se houver termo de busca, usar Full-Text Search otimizado
      if (debouncedSearchTerm && debouncedSearchTerm.trim().length > 0) {
        const { data: searchResults, error: searchError } = await supabase
          .rpc('search_demandas', {
            query_text: debouncedSearchTerm.trim(),
            limit_count: pageSize
          });

        if (searchError) throw searchError;

        const demandasIds = (searchResults || []).map((r: SearchResultRow) => r.id);
        
        if (demandasIds.length === 0) {
          return { demandas: [], totalCount: 0 };
        }

        const { data, error } = await supabase
          .from('demandas')
          .select(`
            *,
            comentarios:demandas_comentarios(*),
            anexos:demandas_anexos(*)
          `)
          .in('id', demandasIds);

        if (error) throw error;

        return {
          demandas: (data || []).map((d) => {
            const transformed = transformDemanda(d as RawDemandaWithRelations);
            return {
              ...transformed,
              comentarios: transformed.comentarios || [],
              anexos: transformed.anexos || [],
            } as Demanda;
          }),
          totalCount: (data || []).length
        };
      }
      
      // Query normal (sem busca)
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
        demandas: (data || []).map((d) => {
          const transformed = transformDemanda(d as RawDemandaWithRelations);
          return {
            ...transformed,
            comentarios: transformed.comentarios || [],
            anexos: transformed.anexos || [],
          } as Demanda;
        }),
        totalCount: count || 0
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutos (aumentado - realtime cuida das atualizações)
    gcTime: 1000 * 60 * 15,
  });

  // Realtime é gerenciado pelo useRealtimeHub centralizado

  return {
    demandas: data?.demandas || [],
    totalCount: data?.totalCount || 0,
    loading: isLoading,
    error,
    refetch
  };
}
