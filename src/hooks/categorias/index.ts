/**
 * Barrel export para hooks de categorias
 */

import { useCategoriasQueries } from '@/contexts/categorias/useCategoriasQueries';
import { useCategoriasMutations } from '@/contexts/categorias/useCategoriasMutations';
import { TipoCategoria, Categoria } from '@/types/categorias';

export { useCategoriasQueries };
export { useCategoriasMutations };

/**
 * Hook unificado de categorias que combina queries e mutations
 */
export function useCategorias() {
  const queries = useCategoriasQueries();
  const mutations = useCategoriasMutations();

  const atualizarCategorias = async (tipo: TipoCategoria, categorias: Categoria[]) => {
    await mutations.atualizarCategorias.mutateAsync({ tipo, categorias });
  };

  const adicionarCategoria = async (tipo: TipoCategoria, categoria: Categoria) => {
    await mutations.adicionarCategoria.mutateAsync({ tipo, categoria });
  };

  const toggleCategoria = async (tipo: TipoCategoria, value: string) => {
    await mutations.toggleCategoria.mutateAsync({ tipo, value });
  };

  const editarCategoria = async (tipo: TipoCategoria, value: string, novoLabel: string) => {
    await mutations.editarCategoria.mutateAsync({ tipo, value, novoLabel });
  };

  const excluirCategoria = async (tipo: TipoCategoria, value: string) => {
    await mutations.excluirCategoria.mutateAsync({ tipo, value });
  };

  return {
    ...queries,
    atualizarCategorias,
    adicionarCategoria,
    toggleCategoria,
    editarCategoria,
    excluirCategoria,
  };
}
