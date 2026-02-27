import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TipoCategoria, Categoria } from '@/types/categorias';
import { queryKeys } from '@/lib/queryKeys';

export function useCategoriasQueries() {
  const { data: configuracoes, isLoading } = useQuery({
    queryKey: queryKeys.configuracoes.categorias,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracoes_categorias')
        .select('*');

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const getCategorias = (tipo: TipoCategoria): Categoria[] => {
    const configs = configuracoes?.filter(c => c.tipo === tipo) || [];
    const allCategorias: Categoria[] = [];
    const seen = new Set<string>();
    for (const config of configs) {
      const cats = (config.categorias as unknown as Categoria[]) || [];
      for (const cat of cats) {
        if (!seen.has(cat.value)) {
          seen.add(cat.value);
          allCategorias.push(cat);
        }
      }
    }
    return allCategorias;
  };

  const getCategoriasAtivas = (tipo: TipoCategoria): Categoria[] => {
    return getCategorias(tipo).filter(c => c.ativa);
  };

  return {
    configuracoes,
    isLoading,
    categoriasDemandas: getCategoriasAtivas('demandas'),
    categoriasEstoque: getCategoriasAtivas('estoque'),
    categoriasDespesas: getCategoriasAtivas('despesas'),
    funcoesEquipe: getCategoriasAtivas('funcoes_equipe'),
    getCategorias,
    getCategoriasAtivas,
  };
}
