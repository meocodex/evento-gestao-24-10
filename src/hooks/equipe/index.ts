/**
 * Barrel export para hooks de equipe
 */

import { useOperacionalQueries as useOperacionalQueriesImpl } from '@/contexts/equipe/useOperacionalQueries';
import { useOperacionalMutations as useOperacionalMutationsImpl } from '@/contexts/equipe/useOperacionalMutations';
import { useConflitosEquipe as useConflitosEquipeImpl } from '@/contexts/equipe/useConflitosEquipe';
import { useProfilesQueries as useProfilesQueriesImpl } from '@/contexts/equipe/useProfilesQueries';
import { FiltrosOperacional } from '@/types/equipe';

export { useConflitosEquipe } from '@/contexts/equipe/useConflitosEquipe';
export type { FiltrosOperacional } from '@/types/equipe';

// Wrapper para compatibilidade - retorna objetos completos das mutations
export function useEquipe(page?: number, pageSize?: number, filtros?: FiltrosOperacional, enabled?: boolean) {
  const queries = useOperacionalQueriesImpl(page, pageSize, filtros, enabled);
  const mutations = useOperacionalMutationsImpl();
  const profiles = useProfilesQueriesImpl(enabled);

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
