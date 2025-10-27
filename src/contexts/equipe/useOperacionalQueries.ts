import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OperacionalEquipe, FiltrosOperacional } from '@/types/equipe';
import { useDebounce } from '@/hooks/useDebounce';
import { useEffect } from 'react';

export function useOperacionalQueries(
  page = 1,
  pageSize = 50,
  filtros?: FiltrosOperacional,
  enabled = true
) {
  const queryClient = useQueryClient();
  // Debounce do termo de busca
  const debouncedSearchTerm = useDebounce(filtros?.searchTerm, 300);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['equipe-operacional', page, pageSize, debouncedSearchTerm, filtros?.funcao, filtros?.tipo, filtros?.status],
    enabled,
    queryFn: async () => {
      console.log('🔍 Buscando operacionais...', { page, pageSize, filtros });

      // Se houver termo de busca, usar Full-Text Search otimizado
      if (debouncedSearchTerm && debouncedSearchTerm.trim().length > 0) {
        const { data: searchResults, error: searchError } = await supabase
          .rpc('search_equipe_operacional', {
            query_text: debouncedSearchTerm.trim(),
            limit_count: pageSize
          });

        if (searchError) throw searchError;

        const operacionaisIds = (searchResults || []).map((r: any) => r.id);
        
        if (operacionaisIds.length === 0) {
          return { operacionais: [], totalCount: 0 };
        }

        let query = supabase
          .from('equipe_operacional')
          .select('*')
          .in('id', operacionaisIds);

        // Aplicar filtros adicionais
        if (filtros?.funcao && filtros.funcao !== 'todos') {
          query = query.eq('funcao_principal', filtros.funcao);
        }

        if (filtros?.tipo && filtros.tipo !== 'todos') {
          query = query.eq('tipo_vinculo', filtros.tipo);
        }

        if (filtros?.status && filtros.status !== 'todos') {
          query = query.eq('status', filtros.status);
        }

        const { data, error } = await query.order('nome', { ascending: true });

        if (error) throw error;

        return {
          operacionais: (data || []) as OperacionalEquipe[],
          totalCount: (data || []).length,
        };
      }

      // Query normal (sem busca)
      let query = supabase
        .from('equipe_operacional')
        .select('*', { count: 'exact' });

      // Filtros server-side
      if (filtros?.funcao && filtros.funcao !== 'todos') {
        query = query.eq('funcao_principal', filtros.funcao);
      }

      if (filtros?.tipo && filtros.tipo !== 'todos') {
        query = query.eq('tipo_vinculo', filtros.tipo);
      }

      if (filtros?.status && filtros.status !== 'todos') {
        query = query.eq('status', filtros.status);
      }

      const { data, error, count } = await query
        .order('nome', { ascending: true })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) throw error;

      return {
        operacionais: (data || []) as OperacionalEquipe[],
        totalCount: count || 0,
      };
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
    gcTime: 1000 * 60 * 60, // 1 hora
  });

  // Realtime listener para equipe operacional
  useEffect(() => {
    const channel = supabase
      .channel('equipe-operacional-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'equipe_operacional' },
        () => queryClient.invalidateQueries({ queryKey: ['equipe-operacional'] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    operacionais: data?.operacionais || [],
    totalCount: data?.totalCount || 0,
    loading: isLoading,
    error,
    refetch,
  };
}
