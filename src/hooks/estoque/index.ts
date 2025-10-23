/**
 * Barrel export para hooks de estoque
 */

import { useEstoqueQueries as useEstoqueQueriesImpl } from '@/contexts/estoque/useEstoqueQueries';
import { useEstoqueMutations as useEstoqueMutationsImpl } from '@/contexts/estoque/useEstoqueMutations';
import { useEstoqueSeriais as useEstoqueSeriaisImpl } from '@/contexts/estoque/useEstoqueSeriais';

export { useEstoqueQueriesImpl as useEstoqueQueries };
export { useEstoqueMutationsImpl as useEstoqueMutations };
export { useEstoqueSeriaisImpl as useEstoqueSeriais };
export type { FiltrosEstoque, MaterialEstoque, SerialEstoque } from '@/types/estoque';

// Wrapper para compatibilidade
export function useEstoque() {
  const queries = useEstoqueQueriesImpl();
  const mutations = useEstoqueMutationsImpl();
  
  return {
    ...queries,
    
    // Mutations (objetos completos com mutateAsync, isPending, etc)
    adicionarMaterial: mutations.adicionarMaterial,
    editarMaterial: mutations.editarMaterial,
    excluirMaterial: mutations.excluirMaterial,
    adicionarSerial: mutations.adicionarSerial,
    editarSerial: mutations.editarSerial,
    excluirSerial: mutations.excluirSerial,
  };
}
