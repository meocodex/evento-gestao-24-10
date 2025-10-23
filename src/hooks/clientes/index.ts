/**
 * Barrel export para hooks de clientes
 */

export { useClientesQueries } from '@/contexts/clientes/useClientesQueries';
export { useClientesMutations } from '@/contexts/clientes/useClientesMutations';

// Wrapper para compatibilidade
export function useClientes() {
  const queries = useClientesQueries();
  const mutations = useClientesMutations();
  
  return {
    ...queries,
    ...mutations,
  };
}
