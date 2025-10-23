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
export type { FiltrosOperacional } from '@/types/equipe';

// Wrapper para compatibilidade - retorna objetos completos das mutations
export function useEquipe() {
  const queries = useOperacionalQueriesImpl();
  const mutations = useOperacionalMutationsImpl();
  const profiles = useProfilesQueriesImpl();

  return {
    // Queries
    ...queries,
    ...profiles,
    
    // Mutations (objetos completos com mutateAsync, isPending, etc)
    criarOperacional: mutations.criarOperacional,
    editarOperacional: mutations.editarOperacional,
    excluirOperacional: mutations.excluirOperacional,
  };
}
