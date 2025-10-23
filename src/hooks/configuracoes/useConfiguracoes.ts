import { useConfiguracoesQueries } from '@/contexts/configuracoes/useConfiguracoesQueries';
import { useConfiguracoesMutations } from '@/contexts/configuracoes/useConfiguracoesMutations';

export function useConfiguracoes() {
  const queries = useConfiguracoesQueries();
  const mutations = useConfiguracoesMutations();

  return {
    ...queries,
    
    // Mutations de configurações
    atualizarNotificacoes: mutations.atualizarNotificacoes,
    atualizarEmpresa: mutations.atualizarEmpresa,
    atualizarSistema: mutations.atualizarSistema,
  };
}
