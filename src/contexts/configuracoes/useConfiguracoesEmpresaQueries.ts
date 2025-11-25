import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useConfiguracoesEmpresaQueries() {
  const { data: configuracoes, isLoading, error, refetch } = useQuery({
    queryKey: ['configuracoes_empresa'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracoes_empresa')
        .select('*')
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Se não existir configuração, criar uma padrão (apenas admin pode)
      if (!data) {
        const { data: newConfig, error: insertError } = await supabase
          .from('configuracoes_empresa')
          .insert({})
          .select()
          .single();

        if (insertError) {
          // Se falhar (sem permissão), retornar null
          return null;
        }
        return newConfig;
      }
      
      return data;
    },
    staleTime: 1000 * 60 * 60, // 60 minutos (dados da empresa mudam raramente)
    gcTime: 1000 * 60 * 120, // 2 horas
  });

  return {
    configuracoes,
    loading: isLoading,
    error,
    refetch
  };
}
