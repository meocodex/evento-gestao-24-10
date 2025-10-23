/**
 * Barrel export para hooks de transportadoras
 */

export { 
  useTransportadorasQueries, 
  useEnviosQueries,
  type FiltrosTransportadora,
  type FiltrosEnvio 
} from '@/contexts/transportadoras/useTransportadorasQueries';

// Helper temporário para compatibilidade
export { useTransportadoras } from './useTransportadorasHelpers';
