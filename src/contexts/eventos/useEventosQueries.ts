import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformEvento } from './transformEvento';
import { Evento } from '@/types/eventos';

interface EventosQueryResult {
  eventos: Evento[];
  totalCount: number;
}

export function useEventosQueries(page = 1, pageSize = 50) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['eventos', page, pageSize],
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
          local,
          cidade,
          estado,
          tags,
          cliente_id,
          comercial_id,
          cliente:clientes(id, nome, email),
          comercial:profiles!eventos_comercial_id_fkey(id, nome, email)
        `, { count: 'exact' })
        .order('data_inicio', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      // Transformar dados básicos
      const eventos = (data || []).map((eventoData) => ({
        id: eventoData.id,
        nome: eventoData.nome,
        status: eventoData.status,
        data_inicio: eventoData.data_inicio,
        data_fim: eventoData.data_fim,
        local: eventoData.local,
        cidade: eventoData.cidade,
        estado: eventoData.estado,
        tags: eventoData.tags || [],
        cliente_id: eventoData.cliente_id,
        comercial_id: eventoData.comercial_id,
        cliente: eventoData.cliente,
        comercial: eventoData.comercial,
        // Dados que serão carregados sob demanda
        timeline: [],
        checklist: [],
        materiais_alocados: [],
        equipe: [],
        receitas: [],
        despesas: [],
        cobrancas: [],
      })) as Evento[];
      
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
