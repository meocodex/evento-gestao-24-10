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
    criarContrato: mutations.criarContrato.mutateAsync,
    editarContrato: mutations.editarContrato.mutateAsync,
    excluirContrato: mutations.excluirContrato.mutateAsync,
    assinarContrato: workflow.assinarContrato.mutateAsync,
    aprovarProposta: workflow.aprovarProposta.mutateAsync,
    converterPropostaEmContrato: workflow.converterPropostaEmContrato.mutateAsync,
    criarTemplate: templatesMutations.criarTemplate.mutateAsync,
    editarTemplate: templatesMutations.editarTemplate.mutateAsync,
    excluirTemplate: templatesMutations.excluirTemplate.mutateAsync,
  };
}
