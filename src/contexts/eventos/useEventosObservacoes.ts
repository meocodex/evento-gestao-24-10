import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useEventosObservacoes(eventoId: string) {
  const queryClient = useQueryClient();
  
  const { data: observacoesData, isLoading } = useQuery({
    queryKey: ['eventos-observacoes', eventoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select('observacoes_operacionais')
        .eq('id', eventoId)
        .single();
      
      if (error) throw error;
      return data?.observacoes_operacionais || [];
    },
  });

  const adicionarObservacaoOperacional = useMutation({
    mutationFn: async (observacao: string) => {
      const { data: evento, error: fetchError } = await supabase
        .from('eventos')
        .select('observacoes_operacionais')
        .eq('id', eventoId)
        .single();

      if (fetchError) throw fetchError;

      const observacoesAtuais = evento.observacoes_operacionais || [];
      
      const { error } = await supabase
        .from('eventos')
        .update({
          observacoes_operacionais: [...observacoesAtuais, observacao]
        })
        .eq('id', eventoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-observacoes', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      toast.success('Observação adicionada!');
    },
  });

  return {
    observacoes: observacoesData || [],
    loading: isLoading,
    adicionarObservacaoOperacional,
  };
}