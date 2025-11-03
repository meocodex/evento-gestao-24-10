import { useDemandasQueries } from '@/contexts/demandas/useDemandasQueries';
import { useDemandasMutations } from '@/contexts/demandas/useDemandasMutations';
import { useDemandasConversa } from '@/contexts/demandas/useDemandasConversa';
import { useDemandasReembolsos } from '@/contexts/demandas/useDemandasReembolsos';

export function useDemandas(page = 1, pageSize = 20, searchTerm?: string, enabled = true) {
  const queries = useDemandasQueries(page, pageSize, searchTerm, enabled);
  const mutations = useDemandasMutations();
  const conversa = useDemandasConversa();
  const reembolsos = useDemandasReembolsos();

  return {
    ...queries,
    
    // Mutations básicas
    criarDemanda: mutations.adicionarDemanda,
    editarDemanda: mutations.editarDemanda,
    excluirDemanda: mutations.excluirDemanda,
    alterarStatus: mutations.alterarStatus,
    atribuirResponsavel: mutations.atribuirResponsavel,
    marcarComoResolvida: mutations.marcarComoResolvida,
    reabrirDemanda: mutations.reabrirDemanda,
    arquivarDemanda: mutations.arquivarDemanda,
    desarquivarDemanda: mutations.desarquivarDemanda,
    
    // Conversa
    adicionarMensagem: conversa.adicionarMensagem,
    
    // Reembolsos
    adicionarDemandaReembolso: reembolsos.adicionarDemandaReembolso,
    aprovarReembolso: reembolsos.aprovarReembolso,
    recusarReembolso: reembolsos.recusarReembolso,
    marcarReembolsoPago: reembolsos.marcarReembolsoPago,
  };
}
