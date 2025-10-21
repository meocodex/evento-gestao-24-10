import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FiltrosEstoque } from './types';

export const useEstoqueQueries = (page = 1, pageSize = 50, filtros?: FiltrosEstoque) => {
  return useQuery({
    queryKey: ['materiais_estoque', page, pageSize, filtros],
    queryFn: async () => {
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;

      let query = supabase
        .from('materiais_estoque')
        .select('*', { count: 'exact' });

      // Aplicar filtros server-side
      if (filtros?.busca) {
        query = query.or(`nome.ilike.%${filtros.busca}%,categoria.ilike.%${filtros.busca}%,id.ilike.%${filtros.busca}%`);
      }
      
      if (filtros?.categoria && filtros.categoria !== 'todas') {
        query = query.eq('categoria', filtros.categoria);
      }

      const { data, error, count } = await query
        .order('nome')
        .range(start, end);

      if (error) throw error;

      return {
        materiais: data || [],
        totalCount: count || 0,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
  });
};
