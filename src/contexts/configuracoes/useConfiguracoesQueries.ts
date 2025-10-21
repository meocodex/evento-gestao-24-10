import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useConfiguracoesQueries() {
  const { data: configuracoes, isLoading, error, refetch } = useQuery({
    queryKey: ['configuracoes'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('configuracoes_usuario')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Se não existir configuração, criar uma padrão
      if (!data) {
        const { data: newConfig, error: insertError } = await supabase
          .from('configuracoes_usuario')
          .insert({
            user_id: user.id,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newConfig;
      }
      
      return data;
    },
    staleTime: 1000 * 60 * 60, // 60 minutos (configurações mudam raramente)
    gcTime: 1000 * 60 * 120, // 2 horas
  });

  return {
    configuracoes,
    loading: isLoading,
    error,
    refetch
  };
}
