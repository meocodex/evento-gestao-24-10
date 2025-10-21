import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OperacionalEquipe } from '@/types/equipe';

export function useOperacionalQueries() {
  const { data: operacionais, isLoading, error, refetch } = useQuery({
    queryKey: ['equipe-operacional'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipe_operacional')
        .select('*')
        .order('nome', { ascending: true });
      
      if (error) throw error;
      
      return (data || []) as OperacionalEquipe[];
    },
    staleTime: 1000 * 60 * 30, // 30 minutos (equipe muda raramente)
    gcTime: 1000 * 60 * 60, // 1 hora
  });

  return {
    operacionais: operacionais || [],
    loading: isLoading,
    error,
    refetch
  };
}
