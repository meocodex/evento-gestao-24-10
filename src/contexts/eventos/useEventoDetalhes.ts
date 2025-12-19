import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformEvento } from './transformEvento';

export function useEventoDetalhes(eventoId: string | null | undefined) {
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

  // Realtime é gerenciado pelo useRealtimeHub centralizado

  return query;
}
