/**
 * Barrel export para hooks de eventos
 * Facilita importações e mantém API limpa
 */

// Queries
export { useEventosQueries } from '@/contexts/eventos/useEventosQueries';
export { useEventoDetalhes } from '@/contexts/eventos/useEventoDetalhes';

// Mutations
export { useEventosMutations } from '@/contexts/eventos/useEventosMutations';

// Features
export { useEventosChecklist } from '@/contexts/eventos/useEventosChecklist';
export { useEventosMateriaisAlocados } from '@/contexts/eventos/useEventosMateriaisAlocados';
export { useEventosEquipe } from '@/contexts/eventos/useEventosEquipe';
export { useEventosFinanceiro } from '@/contexts/eventos/useEventosFinanceiro';
export { useEventosObservacoes } from '@/contexts/eventos/useEventosObservacoes';
export { useEventosArquivos } from '@/contexts/eventos/useEventosArquivos';
export { useEventosPropostas } from '@/contexts/eventos/useEventosPropostas';
