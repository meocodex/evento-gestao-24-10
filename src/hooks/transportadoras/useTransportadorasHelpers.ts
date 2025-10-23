/**
 * Helper temporário para facilitar migração
 * TODO: Remover após migração completa  
 */
import { useTransportadorasQueries, useEnviosQueries } from './index';
import { useTransportadorasMutations, useEnviosMutations } from '@/contexts/transportadoras/useTransportadorasMutations';
import { supabase } from '@/integrations/supabase/client';

export function useTransportadoras() {
  const { data: transportadorasData, isLoading: loadingT } = useTransportadorasQueries();
  const { data: enviosData, isLoading: loadingE } = useEnviosQueries();
  const transportadorasMutations = useTransportadorasMutations();
  const enviosMutations = useEnviosMutations();

  return {
    transportadoras: transportadorasData?.transportadoras || [],
    envios: enviosData?.envios || [],
    loading: loadingT || loadingE,
    setFiltrosTransportadoras: () => {},
    criarTransportadora: (data: any) => transportadorasMutations.criarTransportadora.mutateAsync(data),
    editarTransportadora: (id: string, data: any) => transportadorasMutations.editarTransportadora.mutateAsync({ id, data }),
    excluirTransportadora: async (id: string) => {
      const { error } = await supabase.from('transportadoras').delete().eq('id', id);
      if (error) throw error;
    },
    adicionarRota: (transportadoraId: string, rota: any) => transportadorasMutations.adicionarRota.mutateAsync({ transportadoraId, rota }),
    editarRota: (transportadoraId: string, rotaIndex: number, rota: any) => transportadorasMutations.editarRota.mutateAsync({ transportadoraId, rotaIndex, rota }),
    removerRota: (transportadoraId: string, rotaIndex: number) => transportadorasMutations.removerRota.mutateAsync({ transportadoraId, rotaIndex }),
    criarEnvio: (data: any) => enviosMutations.criarEnvio.mutateAsync(data),
    atualizarStatusEnvio: (id: string, status: string) => enviosMutations.atualizarStatusEnvio.mutateAsync({ id, status }),
    excluirEnvio: (id: string) => enviosMutations.excluirEnvio.mutateAsync(id),
  };
}
