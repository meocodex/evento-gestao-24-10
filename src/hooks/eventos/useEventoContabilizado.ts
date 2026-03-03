import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useEventoContabilizado(eventoId: string) {
  const { data: jaContabilizado = false, isLoading } = useQuery({
    queryKey: ['evento-contabilizado', eventoId],
    queryFn: async () => {
      const { data: receber } = await supabase
        .from('contas_receber')
        .select('id')
        .eq('evento_id', eventoId)
        .limit(1);

      if (receber && receber.length > 0) return true;

      const { data: pagar } = await supabase
        .from('contas_pagar')
        .select('id')
        .eq('evento_id', eventoId)
        .limit(1);

      return !!(pagar && pagar.length > 0);
    },
    enabled: !!eventoId,
    staleTime: 30_000,
  });

  return { jaContabilizado, isLoading };
}
