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
  const enviosQueries = useEnviosQueries();
  const mutations = useTransportadorasMutationsImpl();
  
  return {
    ...transportadorasQueries,
    envios: enviosQueries.data?.envios || [],
    totalEnvios: enviosQueries.data?.totalCount || 0,
    loading: transportadorasQueries.isLoading || enviosQueries.isLoading,
    criarTransportadora: mutations.criarTransportadora.mutateAsync,
    editarTransportadora: mutations.editarTransportadora.mutateAsync,
    excluirTransportadora: mutations.excluirTransportadora.mutateAsync,
    adicionarRota: mutations.adicionarRota.mutateAsync,
    editarRota: mutations.editarRota.mutateAsync,
    removerRota: mutations.removerRota.mutateAsync,
    criarEnvio: mutations.criarEnvio.mutateAsync,
    editarEnvio: mutations.editarEnvio.mutateAsync,
    excluirEnvio: mutations.excluirEnvio.mutateAsync,
    atualizarStatusEnvio: mutations.atualizarStatusEnvio.mutateAsync,
  };
}
