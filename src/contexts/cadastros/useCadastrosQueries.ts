import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformCadastro } from './transformCadastro';

export function useCadastrosQueries() {
  const { data: cadastros, isLoading, error, refetch } = useQuery({
    queryKey: ['cadastros-publicos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cadastros_publicos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(transformCadastro);
    },
    staleTime: 1000 * 60 * 2, // 2 minutos (cadastros pendentes mudam frequentemente)
  });

  return {
    cadastros: cadastros || [],
    loading: isLoading,
    error,
    refetch
  };
}
