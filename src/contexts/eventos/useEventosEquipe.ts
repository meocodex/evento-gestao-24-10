import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useEventosEquipe(eventoId: string) {
  const queryClient = useQueryClient();
  
  const { data: equipeData, isLoading } = useQuery({
    queryKey: ['eventos-equipe', eventoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos_equipe')
        .select('*')
        .eq('evento_id', eventoId);
      
      if (error) throw error;
      return data;
    },
  });

  const adicionarMembroEquipe = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('eventos_equipe')
        .insert({ ...data, evento_id: eventoId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-equipe', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      toast.success('Membro adicionado à equipe!');
    },
  });

  const removerMembroEquipe = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('eventos_equipe')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-equipe', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      toast.success('Membro removido da equipe!');
    },
  });

  return {
    equipe: equipeData || [],
    loading: isLoading,
    adicionarMembroEquipe,
    removerMembroEquipe,
  };
}