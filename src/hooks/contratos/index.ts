/**
 * Barrel export para hooks de contratos
 */

import { useContratosQueries as useContratosQueriesImpl } from '@/contexts/contratos/useContratosQueries';
import { useContratosMutations as useContratosMutationsImpl } from '@/contexts/contratos/useContratosMutations';
import { useContratosWorkflow as useContratosWorkflowImpl } from '@/contexts/contratos/useContratosWorkflow';
import { useTemplatesMutations as useTemplatesMutationsImpl } from '@/contexts/contratos/useTemplatesMutations';

export { useContratosQueriesImpl as useContratosQueries };
export { useContratosMutationsImpl as useContratosMutations };
export { useContratosWorkflowImpl as useContratosWorkflow };
export { useTemplatesMutationsImpl as useTemplatesMutations };

// Wrapper para compatibilidade
export function useContratos() {
  const queries = useContratosQueriesImpl();
  const mutations = useContratosMutationsImpl();
  const workflow = useContratosWorkflowImpl();
  const templatesMutations = useTemplatesMutationsImpl();
  
  return {
    ...queries,
    ...mutations,
    ...workflow,
    criarTemplate: templatesMutations.criarTemplate,
    editarTemplate: templatesMutations.editarTemplate,
    excluirTemplate: templatesMutations.excluirTemplate,
  };
}
