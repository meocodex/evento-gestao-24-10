/**
 * Barrel export para hooks de contratos
 */

export { useContratosQueries } from '@/contexts/contratos/useContratosQueries';
export { useContratosMutations } from '@/contexts/contratos/useContratosMutations';
export { useContratosWorkflow } from '@/contexts/contratos/useContratosWorkflow';
export { useTemplatesMutations } from '@/contexts/contratos/useTemplatesMutations';

// Helper temporário para compatibilidade
export { useContratos } from './useContratosHelpers';
