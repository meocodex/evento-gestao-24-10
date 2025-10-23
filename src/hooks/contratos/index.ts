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
export function useContratos(
  pageContratos?: number,
  pageSizeContratos?: number,
  filtrosContratos?: any,
  pageTemplates?: number,
  pageSizeTemplates?: number,
  filtrosTemplates?: any
) {
  const queries = useContratosQueriesImpl(
    pageContratos,
    pageSizeContratos,
    filtrosContratos,
    pageTemplates,
    pageSizeTemplates,
    filtrosTemplates
  );
  const mutations = useContratosMutationsImpl();
  const workflow = useContratosWorkflowImpl();
  const templatesMutations = useTemplatesMutationsImpl();
  
  return {
    ...queries,
    
    // Mutations (objetos completos com mutateAsync, isPending, etc)
    criarContrato: mutations.criarContrato,
    editarContrato: mutations.editarContrato,
    excluirContrato: mutations.excluirContrato,
    assinarContrato: workflow.assinarContrato,
    aprovarProposta: workflow.aprovarProposta,
    converterPropostaEmContrato: workflow.converterPropostaEmContrato,
    criarTemplate: templatesMutations.criarTemplate,
    editarTemplate: templatesMutations.editarTemplate,
    excluirTemplate: templatesMutations.excluirTemplate,
  };
}
