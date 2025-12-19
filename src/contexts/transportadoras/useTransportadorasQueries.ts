import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RotaTransportadoraDB } from '@/types/utils';

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

      // Transformar rotas para formato camelCase esperado pelo código
      const transportadorasTransformadas = (data || []).map(t => ({
        ...t,
        rotasAtendidas: (t.rotas || []).map((r: RotaTransportadoraDB) => ({
          id: r.id,
          cidadeDestino: r.cidade_destino,
          estadoDestino: r.estado_destino,
          prazoEntrega: r.prazo_entrega,
          valorBase: r.valor_base,
          ativa: r.ativa,
        }))
      }));

      return {
        transportadoras: transportadorasTransformadas,
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

  // Realtime é gerenciado pelo useRealtimeHub centralizado

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

  // Realtime é gerenciado pelo useRealtimeHub centralizado

  return query;
}
