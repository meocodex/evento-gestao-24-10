/**
 * Barrel export para hooks de estoque
 */

export { useEstoqueQueries } from '@/contexts/estoque/useEstoqueQueries';
export { useEstoqueMutations } from '@/contexts/estoque/useEstoqueMutations';
export { useEstoqueSeriais } from '@/contexts/estoque/useEstoqueSeriais';
export type { FiltrosEstoque, MaterialEstoque, SerialEstoque } from '@/contexts/estoque/types';

// Wrapper para compatibilidade
export function useEstoque() {
  const queries = useEstoqueQueries();
  const mutations = useEstoqueMutations();
  const seriais = useEstoqueSeriais();
  
  return {
    ...queries,
    ...mutations,
    ...seriais,
  };
}
