/**
 * Barrel export para hooks de equipe
 */

export { useOperacionalQueries } from '@/contexts/equipe/useOperacionalQueries';
export { useOperacionalMutations } from '@/contexts/equipe/useOperacionalMutations';
export { useConflitosEquipe } from '@/contexts/equipe/useConflitosEquipe';
export { useProfilesQueries } from '@/contexts/equipe/useProfilesQueries';
export type { FiltrosOperacional } from '@/contexts/equipe/types';

// Wrapper para compatibilidade
export function useEquipe() {
  const operacionalQueries = useOperacionalQueries();
  const operacionalMutations = useOperacionalMutations();
  const profilesQueries = useProfilesQueries();
  const conflitos = useConflitosEquipe();
  
  return {
    ...operacionalQueries,
    ...operacionalMutations,
    ...profilesQueries,
    ...conflitos,
  };
}
