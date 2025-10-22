import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformEvento } from './transformEvento';
import { Evento } from '@/types/eventos';

interface EventosQueryResult {
  eventos: Evento[];
  totalCount: number;
}

export function useEventosQueries(page = 1, pageSize = 50, enabled = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['eventos', page, pageSize],
    enabled,
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Query otimizada - carregar apenas dados essenciais
      const { data, error, count } = await supabase
        .from('eventos')
        .select(`
          id,
          nome,
          status,
          data_inicio,
          data_fim,
          hora_inicio,
          hora_fim,
          local,
          endereco,
          cidade,
          estado,
          tipo_evento,
          tags,
          cliente_id,
          comercial_id,
          cliente:clientes(id, nome, email, tipo, documento, telefone, whatsapp, endereco),
          comercial:profiles!eventos_comercial_id_fkey(id, nome, email)
        `, { count: 'exact' })
        .order('data_inicio', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      // Transformar dados usando transformEvento para garantir nomenclatura consistente
      const eventos = (data || []).map((eventoData) => {
        const eventoTransformado = transformEvento(eventoData);
        
        // Manter dados vazios para campos não carregados (otimização)
        return {
          ...eventoTransformado,
          checklist: [],
          materiaisAlocados: { antecipado: [], comTecnicos: [] },
          financeiro: { receitas: [], despesas: [], cobrancas: [] },
          equipe: [],
          timeline: [],
        };
      });
      
      return { eventos, totalCount: count || 0 };
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
  });

  return {
    eventos: (data?.eventos || []) as Evento[],
    totalCount: data?.totalCount || 0,
    loading: isLoading,
    error,
    refetch
  };
}
