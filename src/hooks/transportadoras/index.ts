/**
 * Barrel export para hooks de transportadoras
 */

export { 
  useTransportadorasQueries,
  type FiltrosTransportadora
} from '@/contexts/transportadoras/useTransportadorasQueries';

export {
  useEnviosQueries,
  type FiltrosEnvio
} from '@/contexts/transportadoras/useTransportadorasQueries';

// Helper temporário para compatibilidade
export { useTransportadoras } from './useTransportadorasHelpers';
