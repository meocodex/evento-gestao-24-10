import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformEvento } from './transformEvento';
import { Evento } from '@/types/eventos';
import { useDebounce } from '@/hooks/useDebounce';
import { useEffect } from 'react';

interface EventosQueryResult {
  eventos: Evento[];
  totalCount: number;
}

export function useEventosQueries(page = 1, pageSize = 50, searchTerm?: string, enabled = true) {
  const queryClient = useQueryClient();
  // Debounce do termo de busca para evitar queries desnecessárias
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['eventos', page, pageSize, debouncedSearchTerm],
    enabled,
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Se houver termo de busca, usar Full-Text Search otimizado
      if (debouncedSearchTerm && debouncedSearchTerm.trim().length > 0) {
        const { data: searchResults, error: searchError } = await supabase
          .rpc('search_eventos', {
            query_text: debouncedSearchTerm.trim(),
            limit_count: pageSize
          });

        if (searchError) throw searchError;

        // Buscar dados completos dos eventos encontrados
        const eventosIds = (searchResults || []).map((r: any) => r.id);
        
        if (eventosIds.length === 0) {
          return { eventos: [], totalCount: 0 };
        }

        const { data, error } = await supabase
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
          `)
          .in('id', eventosIds);

        if (error) throw error;

        const eventos = (data || []).map((eventoData) => {
          const eventoTransformado = transformEvento(eventoData);
          return {
            ...eventoTransformado,
            checklist: [],
            materiaisAlocados: { antecipado: [], comTecnicos: [] },
            financeiro: { receitas: [], despesas: [], cobrancas: [] },
            equipe: [],
            timeline: [],
          };
        });

        return { eventos, totalCount: eventos.length };
      }

      // Query normal (sem busca) - carregar apenas dados essenciais com paginação
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
    staleTime: 1000 * 60 * 5, // 5 minutos (eventos mudam com frequência moderada)
    gcTime: 1000 * 60 * 30,
  });

  // Realtime listener para eventos
  useEffect(() => {
    const channel = supabase
      .channel('eventos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'eventos'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['eventos'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    eventos: (data?.eventos || []) as Evento[],
    totalCount: data?.totalCount || 0,
    loading: isLoading,
    error,
    refetch
  };
}
