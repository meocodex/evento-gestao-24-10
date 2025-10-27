import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformEvento } from './transformEvento';
import { Evento } from '@/types/eventos';
import { useEffect } from 'react';

export function useEventoDetalhes(eventoId: string | null | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['evento-detalhes', eventoId],
    queryFn: async () => {
      if (!eventoId) return null;
      
      const { data, error } = await supabase
        .from('eventos')
        .select(`
          *,
          cliente:clientes(*),
          comercial:profiles!eventos_comercial_id_fkey(*),
          timeline:eventos_timeline(*),
          checklist:eventos_checklist(*),
          materiais_alocados:eventos_materiais_alocados(*),
          equipe:eventos_equipe(*),
          receitas:eventos_receitas(*),
          despesas:eventos_despesas(*),
          cobrancas:eventos_cobrancas(*)
        `)
        .eq('id', eventoId)
        .single();
      
      if (error) throw error;
      
      return transformEvento(data);
    },
    enabled: !!eventoId,
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 15,
  });

  // Realtime listeners para todas as tabelas relacionadas ao evento
  useEffect(() => {
    if (!eventoId) return;

    const channel = supabase
      .channel(`evento-detalhes-${eventoId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'eventos', filter: `id=eq.${eventoId}` },
        () => queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'eventos_timeline', filter: `evento_id=eq.${eventoId}` },
        () => queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'eventos_equipe', filter: `evento_id=eq.${eventoId}` },
        () => queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'eventos_receitas', filter: `evento_id=eq.${eventoId}` },
        () => queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'eventos_despesas', filter: `evento_id=eq.${eventoId}` },
        () => queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'eventos_cobrancas', filter: `evento_id=eq.${eventoId}` },
        () => queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventoId, queryClient]);

  return query;
}
