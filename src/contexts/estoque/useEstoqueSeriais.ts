import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { dbToUiStatus, StatusSerialDB } from '@/lib/estoqueStatus';

export const useEstoqueSeriais = (materialId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['materiais_seriais', materialId],
    queryFn: async () => {
      if (!materialId) return [];

      // Buscar seriais
      const { data, error } = await supabase
        .from('materiais_seriais')
        .select(`
          *,
          eventos:evento_id (
            id,
            nome
          )
        `)
        .eq('material_id', materialId)
        .order('numero');
      
      if (error) throw error;

      // Para seriais em uso, buscar tipo_envio de eventos_materiais_alocados
      const seriaisEmUso = (data || []).filter(s => s.status === 'em-uso' && s.evento_id);
      let tiposEnvioMap: Record<string, string> = {};
      
      if (seriaisEmUso.length > 0) {
        const { data: alocacoes } = await supabase
          .from('eventos_materiais_alocados')
          .select('serial, tipo_envio')
          .eq('item_id', materialId)
          .in('serial', seriaisEmUso.map(s => s.numero))
          .eq('status_devolucao', 'pendente');
        
        if (alocacoes) {
          tiposEnvioMap = Object.fromEntries(
            alocacoes.map(a => [a.serial, a.tipo_envio])
          );
        }
      }

      return (data || []).map(s => ({
        numero: s.numero,
        status: dbToUiStatus(s.status as StatusSerialDB),
        localizacao: s.localizacao,
        eventoId: s.evento_id || undefined,
        eventoNome: s.eventos?.nome || undefined,
        tipoEnvio: tiposEnvioMap[s.numero] as 'antecipado' | 'com_tecnicos' | undefined,
        ultimaManutencao: s.ultima_manutencao || undefined,
        dataAquisicao: s.data_aquisicao || undefined,
        observacoes: s.observacoes || undefined,
      }));
    },
    enabled: !!materialId,
    staleTime: 1000 * 30, // 30 segundos (com real-time não precisa ser 0)
  });

  // Listener realtime para materiais_seriais
  useEffect(() => {
    if (!materialId) return;

    const channel = supabase
      .channel(`materiais-seriais-${materialId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'materiais_seriais',
          filter: `material_id=eq.${materialId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['materiais_seriais', materialId] });
          queryClient.invalidateQueries({ queryKey: ['materiais_estoque'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [materialId, queryClient]);

  return query;
};
