import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface FiltrosTransportadora {
  searchTerm?: string;
  status?: 'todas' | 'ativa' | 'inativa';
}

export interface FiltrosEnvio {
  status?: string;
}

export function useTransportadorasQueries(
  pageTransportadoras = 1,
  pageSizeTransportadoras = 50,
  filtrosTransportadoras?: FiltrosTransportadora
) {
  const queryClient = useQueryClient();

  const transportadorasResult = useQuery({
    queryKey: ['transportadoras', pageTransportadoras, pageSizeTransportadoras, filtrosTransportadoras],
    queryFn: async () => {
      let query = supabase
        .from('transportadoras')
        .select(`
          *,
          rotas:transportadoras_rotas(*)
        `, { count: 'exact' });

      if (filtrosTransportadoras?.searchTerm) {
        query = query.or(`nome.ilike.%${filtrosTransportadoras.searchTerm}%,cnpj.ilike.%${filtrosTransportadoras.searchTerm}%`);
      }

      if (filtrosTransportadoras?.status && filtrosTransportadoras.status !== 'todas') {
        query = query.eq('status', filtrosTransportadoras.status);
      }

      const { data, error, count } = await query
        .order('nome')
        .range(
          (pageTransportadoras - 1) * pageSizeTransportadoras,
          pageTransportadoras * pageSizeTransportadoras - 1
        );

      if (error) throw error;

      return {
        transportadoras: data || [],
        totalCount: count || 0,
      };
    },
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

  const { data: transportadorasData } = transportadorasResult;

  const buscarTransportadoraPorId = async (id: string) => {
    const { data, error } = await supabase
      .from('transportadoras')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  };

  // Realtime listeners para transportadoras e rotas
  useEffect(() => {
    const channel = supabase
      .channel('transportadoras-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transportadoras' },
        () => queryClient.invalidateQueries({ queryKey: ['transportadoras'] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transportadoras_rotas' },
        () => queryClient.invalidateQueries({ queryKey: ['transportadoras'] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    ...transportadorasResult,
    transportadoras: transportadorasData?.transportadoras || [],
    totalCount: transportadorasData?.totalCount || 0,
    buscarTransportadoraPorId,
  };
}

export function useEnviosQueries(
  pageEnvios = 1,
  pageSizeEnvios = 50,
  filtrosEnvios?: FiltrosEnvio
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['envios', pageEnvios, pageSizeEnvios, filtrosEnvios],
    queryFn: async () => {
      let query = supabase
        .from('envios')
        .select('*', { count: 'exact' });

      if (filtrosEnvios?.status && filtrosEnvios.status !== 'todos') {
        query = query.eq('status', filtrosEnvios.status);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(
          (pageEnvios - 1) * pageSizeEnvios,
          pageEnvios * pageSizeEnvios - 1
        );

      if (error) throw error;

      return {
        envios: data || [],
        totalCount: count || 0,
      };
    },
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

  // Realtime listener para envios
  useEffect(() => {
    const channel = supabase
      .channel('envios-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'envios' },
        () => queryClient.invalidateQueries({ queryKey: ['envios'] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
