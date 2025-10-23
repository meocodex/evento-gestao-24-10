/**
 * Barrel export para hooks de eventos
 */

import { useEventosQueries as useEventosQueriesImpl } from '@/contexts/eventos/useEventosQueries';
import { useEventosMutations as useEventosMutationsImpl } from '@/contexts/eventos/useEventosMutations';

export { useEventosQueriesImpl as useEventosQueries };
export { useEventosMutationsImpl as useEventosMutations };
export { useEventosFinanceiro } from '@/contexts/eventos/useEventosFinanceiro';
export { useEventosEquipe } from '@/contexts/eventos/useEventosEquipe';
export { useEventosMateriaisAlocados } from '@/contexts/eventos/useEventosMateriaisAlocados';
export { useEventosObservacoes } from '@/contexts/eventos/useEventosObservacoes';
export { useEventosChecklist } from '@/contexts/eventos/useEventosChecklist';
export { useEventosArquivos } from '@/contexts/eventos/useEventosArquivos';
export { useEventosPropostas } from '@/contexts/eventos/useEventosPropostas';
export { useEventoDetalhes } from '@/contexts/eventos/useEventoDetalhes';

// Wrapper para compatibilidade
export function useEventos(page?: number, pageSize?: number) {
  const queries = useEventosQueriesImpl(page, pageSize);
  const mutations = useEventosMutationsImpl();
  
  return {
    ...queries,
    
    // Mutations (objetos completos com mutateAsync, isPending, etc)
    criarEvento: mutations.adicionarEvento,
    editarEvento: mutations.editarEvento,
    excluirEvento: mutations.excluirEvento,
    alterarStatus: mutations.alterarStatus,
  };
}
