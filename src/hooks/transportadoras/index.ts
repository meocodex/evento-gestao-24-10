/**
 * Barrel export para hooks de transportadoras
 */

export { useTransportadorasQueries, useEnviosQueries } from '@/contexts/transportadoras/useTransportadorasQueries';
export { useTransportadorasMutations } from '@/contexts/transportadoras/useTransportadorasMutations';

// Wrapper para compatibilidade
export function useTransportadoras() {
  const transportadorasQueries = useTransportadorasQueries();
  const mutations = useTransportadorasMutations();
  
  return {
    ...transportadorasQueries,
    ...mutations,
  };
}
