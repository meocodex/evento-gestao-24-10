import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OperacionalEquipe, FiltrosOperacional } from '@/types/equipe';

export function useOperacionalQueries(
  page = 1,
  pageSize = 50,
  filtros?: FiltrosOperacional,
  enabled = true
) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['equipe-operacional', page, pageSize, filtros],
    enabled,
    queryFn: async () => {
      console.log('🔍 Buscando operacionais...', { page, pageSize, filtros });
      let query = supabase
        .from('equipe_operacional')
        .select('*', { count: 'exact' });

      // Filtros server-side
      if (filtros?.searchTerm) {
        query = query.or(
          `nome.ilike.%${filtros.searchTerm}%,telefone.ilike.%${filtros.searchTerm}%,cpf.ilike.%${filtros.searchTerm}%`
        );
      }

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

  return {
    operacionais: data?.operacionais || [],
    totalCount: data?.totalCount || 0,
    loading: isLoading,
    error,
    refetch,
  };
}
