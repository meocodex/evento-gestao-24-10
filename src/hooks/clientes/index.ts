/**
 * Barrel export para hooks de clientes
 */

import { useClientesQueries as useClientesQueriesImpl } from '@/contexts/clientes/useClientesQueries';
import { useClientesMutations as useClientesMutationsImpl } from '@/contexts/clientes/useClientesMutations';

export { useClientesQueriesImpl as useClientesQueries };
export { useClientesMutationsImpl as useClientesMutations };

// Wrapper para compatibilidade
export function useClientes() {
  const queries = useClientesQueriesImpl();
  const mutations = useClientesMutationsImpl();
  
  return {
    ...queries,
    ...mutations,
  };
}
