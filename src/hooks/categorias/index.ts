/**
 * Barrel export para hooks de categorias
 */

import { useCategoriasQueries as useCategoriasQueriesImpl } from '@/contexts/categorias/useCategoriasQueries';
import { useCategoriasMutations as useCategoriasMutationsImpl } from '@/contexts/categorias/useCategoriasMutations';

export { useCategoriasQueriesImpl as useCategoriasQueries };
export { useCategoriasMutationsImpl as useCategoriasMutations };

// Wrapper para compatibilidade
export function useCategorias() {
  return useCategoriasQueriesImpl();
}
