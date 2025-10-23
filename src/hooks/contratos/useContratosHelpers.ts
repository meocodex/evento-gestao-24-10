/**
 * Helper temporário para facilitar migração
 * TODO: Remover após migração completa  
 */
import * as React from 'react';
import { 
  useContratosQueries, 
  useContratosMutations, 
  useTemplatesMutations, 
  useContratosWorkflow 
} from './index';
import { gerarPDFContrato } from '@/utils/pdfGenerator';

export function useContratos() {
  const [page] = React.useState(1);
  const [pageSize] = React.useState(20);
  const { templates, contratos, loading } = useContratosQueries(
    page,
    pageSize,
    { searchTerm: '', status: '' },
    page,
    pageSize,
    { searchTerm: '' }
  );
  const mutations = useContratosMutations();
  const templateMutations = useTemplatesMutations();
  const workflow = useContratosWorkflow();

  return {
    contratos,
    templates,
    loading,
    gerarPDF: gerarPDFContrato,
    ...mutations,
    ...templateMutations,
    ...workflow,
  };
}
