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
      
      // Transformar dados do Supabase para o tipo Evento com tratamento de erros
      return (data || []).map((eventoData) => {
        try {
          return transformEvento(eventoData);
        } catch (transformError) {
          console.error('Erro ao transformar evento:', eventoData.id, transformError);
          // Retornar evento com dados mínimos em caso de erro
          return {
            id: eventoData.id,
            nome: eventoData.nome || 'Evento sem nome',
            data_inicio: eventoData.data_inicio,
            data_fim: eventoData.data_fim,
            status: eventoData.status || 'orcamento',
            // ... outros campos essenciais com fallbacks
          } as any;
        }
      }).filter(Boolean);
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
