import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TipoCategoria, Categoria } from '@/types/categorias';

export function useCategoriasQueries() {
  const { data: configuracoes, isLoading } = useQuery({
    queryKey: ['configuracoes_categorias'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('configuracoes_categorias')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    },
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
