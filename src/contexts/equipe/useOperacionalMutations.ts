import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OperacionalEquipe } from '@/types/equipe';

export function useOperacionalMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const criarOperacional = useMutation({
    mutationFn: async (operacional: Omit<OperacionalEquipe, 'id' | 'created_at' | 'updated_at' | 'avaliacao'>) => {
      const { data, error } = await supabase
        .from('equipe_operacional')
        .insert([operacional])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipe-operacional'] });
      toast({
        title: 'Membro cadastrado!',
        description: 'Membro da equipe operacional cadastrado com sucesso.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao cadastrar membro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const editarOperacional = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OperacionalEquipe> & { id: string }) => {
      const { data, error } = await supabase
        .from('equipe_operacional')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipe-operacional'] });
      toast({
        title: 'Membro atualizado!',
        description: 'Informações atualizadas com sucesso.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar membro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const excluirOperacional = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('equipe_operacional')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipe_operacional'] });
      toast({
        title: 'Membro excluído',
        description: 'O membro foi removido da equipe operacional com sucesso'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir membro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    criarOperacional,
    editarOperacional,
    excluirOperacional
  };
}
