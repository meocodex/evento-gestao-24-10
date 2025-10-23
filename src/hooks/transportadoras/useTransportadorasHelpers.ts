/**
 * Helper temporário para facilitar migração
 * TODO: Remover após migração completa  
 */
import { useTransportadorasQueries, useEnviosQueries } from './index';

export function useTransportadoras() {
  const { data: transportadorasData, isLoading: loadingT } = useTransportadorasQueries();
  const { data: enviosData, isLoading: loadingE } = useEnviosQueries();

  return {
    transportadoras: transportadorasData?.transportadoras || [],
    envios: enviosData?.envios || [],
    loading: loadingT || loadingE,
  };
}
