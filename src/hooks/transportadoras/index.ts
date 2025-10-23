/**
 * Barrel export para hooks de transportadoras
 */

import { useTransportadorasQueries as useTransportadorasQueriesImpl, useEnviosQueries } from '@/contexts/transportadoras/useTransportadorasQueries';
import { useTransportadorasMutations as useTransportadorasMutationsImpl } from '@/contexts/transportadoras/useTransportadorasMutations';

export { useTransportadorasQueriesImpl as useTransportadorasQueries, useEnviosQueries };
export { useTransportadorasMutationsImpl as useTransportadorasMutations };

// Wrapper para compatibilidade
export function useTransportadoras() {
  const transportadorasQueries = useTransportadorasQueriesImpl();
  const mutations = useTransportadorasMutationsImpl();
  
  return {
    ...transportadorasQueries,
    ...mutations,
  };
}
