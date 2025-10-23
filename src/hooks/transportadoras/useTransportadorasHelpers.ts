/**
 * Helper temporário para facilitar migração
 * TODO: Remover após migração completa  
 */
import { useTransportadorasQueries } from './index';

export function useTransportadoras() {
  const { transportadoras, envios, loading } = useTransportadorasQueries();

  return {
    transportadoras: transportadoras || [],
    envios: envios || [],
    loading,
  };
}
