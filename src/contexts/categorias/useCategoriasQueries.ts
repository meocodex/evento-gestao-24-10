import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TipoCategoria, Categoria } from '@/types/categorias';

export function useCategoriasQueries() {
  const { data: configuracoes, isLoading } = useQuery({
    queryKey: ['configuracoes_categorias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracoes_categorias')
        .select('*');

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos - dados são considerados "frescos"
    gcTime: 1000 * 60 * 10, // 10 minutos - cache é removido após este tempo
  });

  const getCategorias = (tipo: TipoCategoria): Categoria[] => {
    const config = configuracoes?.find(c => c.tipo === tipo);
    return (config?.categorias as unknown as Categoria[]) || [];
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
