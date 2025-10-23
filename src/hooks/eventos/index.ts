/**
 * Barrel export para hooks de eventos
 */

export { useEventosQueries } from '@/contexts/eventos/useEventosQueries';
export { useEventosMutations } from '@/contexts/eventos/useEventosMutations';
export { useEventosFinanceiro } from '@/contexts/eventos/useEventosFinanceiro';
export { useEventosEquipe } from '@/contexts/eventos/useEventosEquipe';
export { useEventosMateriaisAlocados } from '@/contexts/eventos/useEventosMateriaisAlocados';
export { useEventosObservacoes } from '@/contexts/eventos/useEventosObservacoes';
export { useEventosChecklist } from '@/contexts/eventos/useEventosChecklist';
export { useEventosArquivos } from '@/contexts/eventos/useEventosArquivos';
export { useEventosPropostas } from '@/contexts/eventos/useEventosPropostas';
export { useEventoDetalhes } from '@/contexts/eventos/useEventoDetalhes';

// Wrapper para compatibilidade
export function useEventos() {
  const queries = useEventosQueries();
  const mutations = useEventosMutations();
  
  return {
    ...queries,
    ...mutations,
  };
}
