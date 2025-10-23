/**
 * Barrel export para hooks de contratos
 */

export { useContratosQueries } from '@/contexts/contratos/useContratosQueries';
export { useContratosMutations } from '@/contexts/contratos/useContratosMutations';
export { useContratosWorkflow } from '@/contexts/contratos/useContratosWorkflow';
export { useTemplatesMutations } from '@/contexts/contratos/useTemplatesMutations';

// Wrapper para compatibilidade
export function useContratos() {
  const queries = useContratosQueries();
  const mutations = useContratosMutations();
  const workflow = useContratosWorkflow();
  const templatesMutations = useTemplatesMutations();
  
  return {
    ...queries,
    ...mutations,
    ...workflow,
    criarTemplate: templatesMutations.criarTemplate,
    editarTemplate: templatesMutations.editarTemplate,
    excluirTemplate: templatesMutations.excluirTemplate,
  };
}
