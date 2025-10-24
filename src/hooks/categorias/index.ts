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

  return {
    ...queries,
    atualizarCategorias: mutations.atualizarCategorias,
    adicionarCategoria: mutations.adicionarCategoria,
    toggleCategoria: mutations.toggleCategoria,
    editarCategoria: mutations.editarCategoria,
    excluirCategoria: mutations.excluirCategoria,
  };
}
