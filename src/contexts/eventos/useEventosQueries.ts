import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformEvento } from './transformEvento';
import { Evento } from '@/types/eventos';

export function useEventosQueries() {
  const { data: eventos, isLoading, error, refetch } = useQuery({
    queryKey: ['eventos'],
    queryFn: async () => {
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
        .order('data_inicio', { ascending: false });
      
      if (error) throw error;
      
      // Transformar dados do Supabase para o tipo Evento
      return (data || []).map(transformEvento);
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  return {
    eventos: (eventos || []) as Evento[],
    loading: isLoading,
    error,
    refetch
  };
}
