import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MembroEquipe } from '@/types/eventos';

export function useEventosEquipe() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const adicionarMembro = useMutation({
    mutationFn: async ({ 
      eventoId, 
      membro 
    }: { 
      eventoId: string; 
      membro: Omit<MembroEquipe, 'id'> 
    }) => {
      const { data, error } = await supabase
        .from('eventos_equipe')
        .insert([{
          evento_id: eventoId,
          nome: membro.nome,
          funcao: membro.funcao,
          telefone: membro.telefone,
          whatsapp: membro.whatsapp,
          data_inicio: membro.dataInicio,
          data_fim: membro.dataFim,
          observacoes: membro.observacoes,
          operacional_id: membro.operacionalId
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast({
        title: 'Membro adicionado!',
        description: `${variables.membro.nome} foi adicionado à equipe.`
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao adicionar membro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const removerMembro = useMutation({
    mutationFn: async ({ membroId }: { membroId: string }) => {
      const { error } = await supabase
        .from('eventos_equipe')
        .delete()
        .eq('id', membroId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast({
        title: 'Membro removido!',
        description: 'Membro removido da equipe.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover membro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    adicionarMembro,
    removerMembro
  };
}
