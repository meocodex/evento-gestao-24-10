import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformDemanda } from '@/contexts/demandas/transformDemanda';
import { Demanda } from '@/types/demandas';
import type { RawDemandaFromDB } from '@/types/utils';

/**
 * Hook otimizado para buscar apenas demandas de reembolso
 * Usado no módulo Financeiro para evitar carregar 1000+ demandas
 */
export function useDemandasReembolso() {
  return useQuery({
    queryKey: ['demandas-reembolso'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('demandas')
        .select('*')
        .eq('categoria', 'reembolso')
        .eq('arquivada', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(d => transformDemanda(d as unknown as RawDemandaFromDB)) as Demanda[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 15,
  });
}
