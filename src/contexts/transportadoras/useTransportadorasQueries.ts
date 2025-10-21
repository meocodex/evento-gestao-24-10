import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  return useQuery({
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
}

export function useEnviosQueries(
  pageEnvios = 1,
  pageSizeEnvios = 50,
  filtrosEnvios?: FiltrosEnvio
) {
  return useQuery({
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
}
