/**
 * Barrel export para hooks de clientes
 */

import { useClientesQueries as useClientesQueriesImpl } from '@/contexts/clientes/useClientesQueries';
import { useClientesMutations as useClientesMutationsImpl } from '@/contexts/clientes/useClientesMutations';

export { useClientesQueriesImpl as useClientesQueries };
export { useClientesMutationsImpl as useClientesMutations };

// Wrapper para compatibilidade
export function useClientes(page?: number, pageSize?: number, searchTerm?: string) {
  const queries = useClientesQueriesImpl(page, pageSize, searchTerm);
  const mutations = useClientesMutationsImpl();
  
  return {
    ...queries,
    
    // Mutations (objetos completos com mutateAsync, isPending, etc)
    criarCliente: mutations.criarCliente,
    editarCliente: mutations.editarCliente,
    excluirCliente: mutations.excluirCliente,
  };
}
