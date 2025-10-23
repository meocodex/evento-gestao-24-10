/**
 * Barrel export para hooks de cadastros públicos
 */

import { useCadastrosQueries } from '@/contexts/cadastros/useCadastrosQueries';
import { useCadastrosMutations } from '@/contexts/cadastros/useCadastrosMutations';

export { useCadastrosQueries };
export { useCadastrosMutations };

/**
 * Hook unificado para gerenciar cadastros públicos de eventos
 */
export function useCadastros() {
  const queries = useCadastrosQueries();
  const mutations = useCadastrosMutations();
  
  return {
    // Queries
    cadastros: queries.cadastros,
    loading: queries.loading,
    error: queries.error,
    refetch: queries.refetch,
    
    // Mutations (objetos completos com mutateAsync, isPending, etc)
    criarCadastro: mutations.criarCadastro,
    aprovarCadastro: mutations.aprovarCadastro,
    recusarCadastro: mutations.recusarCadastro,
  };
}
