/**
 * Barrel export para hooks de equipe
 */

export { useOperacionalQueries } from '@/contexts/equipe/useOperacionalQueries';
export { useOperacionalMutations } from '@/contexts/equipe/useOperacionalMutations';
export { useConflitosEquipe } from '@/contexts/equipe/useConflitosEquipe';
export { useProfilesQueries } from '@/contexts/equipe/useProfilesQueries';
export type { FiltrosOperacional } from '@/contexts/equipe/types';

// Helpers temporários
export { useEquipe } from './useEquipeHelpers';
