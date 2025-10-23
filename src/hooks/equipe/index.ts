/**
 * Barrel export para hooks de equipe
 */

import { useOperacionalQueries as useOperacionalQueriesImpl } from '@/contexts/equipe/useOperacionalQueries';
import { useOperacionalMutations as useOperacionalMutationsImpl } from '@/contexts/equipe/useOperacionalMutations';
import { useConflitosEquipe as useConflitosEquipeImpl } from '@/contexts/equipe/useConflitosEquipe';
import { useProfilesQueries as useProfilesQueriesImpl } from '@/contexts/equipe/useProfilesQueries';

export { useOperacionalQueriesImpl as useOperacionalQueries };
export { useOperacionalMutationsImpl as useOperacionalMutations };
export { useConflitosEquipeImpl as useConflitosEquipe };
export { useProfilesQueriesImpl as useProfilesQueries };
export type { FiltrosOperacional } from '@/contexts/equipe/types';

// Wrapper para compatibilidade
export function useEquipe() {
  const operacionalQueries = useOperacionalQueriesImpl();
  const operacionalMutations = useOperacionalMutationsImpl();
  const profilesQueries = useProfilesQueriesImpl();
  const conflitos = useConflitosEquipeImpl();
  
  return {
    ...operacionalQueries,
    ...operacionalMutations,
    ...profilesQueries,
    ...conflitos,
  };
}
