import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useEventosObservacoes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const adicionarObservacao = useMutation({
    mutationFn: async ({ 
      eventoId, 
      observacao 
    }: { 
      eventoId: string; 
      observacao: string 
    }) => {
      // Buscar observações atuais
      const { data: evento, error: fetchError } = await supabase
        .from('eventos')
        .select('observacoes_operacionais')
        .eq('id', eventoId)
        .single();

      if (fetchError) throw fetchError;

      const observacoesAtuais = evento.observacoes_operacionais || [];
      
      // Adicionar nova observação ao array
      const { data, error } = await supabase
        .from('eventos')
        .update({
          observacoes_operacionais: [...observacoesAtuais, observacao]
        })
        .eq('id', eventoId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast({
        title: 'Observação adicionada!',
        description: 'Observação operacional registrada com sucesso.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao adicionar observação',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    adicionarObservacao
  };
}
