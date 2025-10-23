/**
 * Barrel export para hooks de transportadoras
 */

import { useTransportadorasQueries as useTransportadorasQueriesImpl, useEnviosQueries } from '@/contexts/transportadoras/useTransportadorasQueries';
import { useTransportadorasMutations as useTransportadorasMutationsImpl } from '@/contexts/transportadoras/useTransportadorasMutations';

export { useEnviosQueries };

// Wrapper para compatibilidade - retorna objetos completos das mutations
export function useTransportadoras() {
  const transportadorasQueries = useTransportadorasQueriesImpl();
  const enviosQueries = useEnviosQueries();
  const mutations = useTransportadorasMutationsImpl();
  
  return {
    // Queries
    ...transportadorasQueries,
    envios: enviosQueries.data?.envios || [],
    totalEnvios: enviosQueries.data?.totalCount || 0,
    loading: transportadorasQueries.isLoading || enviosQueries.isLoading,
    
    // Mutations (objetos completos com mutateAsync, isPending, etc)
    criarTransportadora: mutations.criarTransportadora,
    editarTransportadora: mutations.editarTransportadora,
    excluirTransportadora: mutations.excluirTransportadora,
    adicionarRota: mutations.adicionarRota,
    editarRota: mutations.editarRota,
    removerRota: mutations.removerRota,
    criarEnvio: mutations.criarEnvio,
    editarEnvio: mutations.editarEnvio,
    excluirEnvio: mutations.excluirEnvio,
    atualizarStatusEnvio: mutations.atualizarStatusEnvio,
  };
}
