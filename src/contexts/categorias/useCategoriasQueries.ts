import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TipoCategoria, Categoria } from '@/types/categorias';
import { useAuth } from '@/contexts/AuthContext';

export function useCategoriasQueries() {
  const { user } = useAuth();
  const userId = user?.id;

  const { data: configuracoes, isLoading } = useQuery({
    queryKey: ['configuracoes_categorias', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('configuracoes_categorias')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
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
