import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HistoricoMovimentacao } from '@/types/estoque';

export function useEstoqueHistorico(materialId: string, serialNumero?: string) {
  return useQuery({
    queryKey: ['historico-material', materialId, serialNumero],
    queryFn: async () => {
      let query = supabase
        .from('materiais_historico_movimentacao')
        .select('*')
        .eq('material_id', materialId);
      
      if (serialNumero) {
        query = query.eq('serial_numero', serialNumero);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        materialId: item.material_id,
        serialNumero: item.serial_numero,
        eventoId: item.evento_id,
        eventoNome: item.evento_nome,
        tipoOperacao: item.tipo_operacao,
        quantidade: item.quantidade,
        tipoEnvio: item.tipo_envio,
        transportadora: item.transportadora,
        responsavel: item.responsavel,
        dataMovimentacao: item.data_movimentacao,
        observacoes: item.observacoes,
        fotosComprovantes: item.fotos_comprovantes,
      })) as HistoricoMovimentacao[];
    },
    enabled: !!materialId,
  });
}
