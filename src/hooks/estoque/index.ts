/**
 * Barrel export para hooks de estoque
 */

import { useEstoqueQueries as useEstoqueQueriesImpl } from '@/contexts/estoque/useEstoqueQueries';
import { useEstoqueMutations as useEstoqueMutationsImpl } from '@/contexts/estoque/useEstoqueMutations';
import { useEstoqueSeriais as useEstoqueSeriaisImpl } from '@/contexts/estoque/useEstoqueSeriais';

export { useEstoqueQueriesImpl as useEstoqueQueries };
export { useEstoqueMutationsImpl as useEstoqueMutations };
export { useEstoqueSeriaisImpl as useEstoqueSeriais };
export type { FiltrosEstoque, MaterialEstoque, SerialEstoque } from '@/contexts/estoque/types';

// Wrapper para compatibilidade
export function useEstoque() {
  const queries = useEstoqueQueriesImpl();
  const mutations = useEstoqueMutationsImpl();
  const seriais = useEstoqueSeriaisImpl();
  
  return {
    ...queries,
    adicionarMaterial: mutations.adicionarMaterial.mutateAsync,
    editarMaterial: mutations.editarMaterial.mutateAsync,
    excluirMaterial: mutations.excluirMaterial.mutateAsync,
    adicionarSerial: seriais.adicionarSerial.mutateAsync,
    editarSerial: seriais.editarSerial.mutateAsync,
    excluirSerial: seriais.excluirSerial.mutateAsync,
  };
}
