import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useEventosQueries() {
  const { data: eventos, isLoading, error, refetch } = useQuery({
    queryKey: ['eventos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select(`
          *,
          cliente:clientes(*),
          comercial:profiles!comercial_id(*),
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
      
      // Retornar dados brutos por enquanto, vamos transformar depois
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  return {
    eventos: eventos || [],
    loading: isLoading,
    error,
    refetch
  };
}
