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
      const { data, error } = await supabase.functions.invoke('excluir-operacional', {
        body: { operacional_id: id }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Erro ao excluir');
      
      return data;
    },
    onSuccess: async () => {
      // Invalidar e refazer queries
      await queryClient.invalidateQueries({ queryKey: ['equipe-operacional'] });
      await queryClient.invalidateQueries({ queryKey: ['profiles-equipe'] });
      await queryClient.refetchQueries({ queryKey: ['equipe-operacional'] });
      await queryClient.refetchQueries({ queryKey: ['profiles-equipe'] });
      
      toast({
        title: 'Membro excluído',
        description: 'O membro foi removido da equipe operacional com sucesso'
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Erro ao excluir membro';
      
      toast({
        title: 'Erro ao excluir membro',
        description: errorMessage.includes('permissão') 
          ? 'Você não tem permissão para excluir membros. Solicite "equipe.editar" ou "admin.full_access".'
          : errorMessage,
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
