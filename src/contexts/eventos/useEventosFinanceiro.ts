import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useEventosFinanceiro(eventoId?: string) {
  const queryClient = useQueryClient();
  const { data: receitasData, isLoading: isLoadingReceitas } = useQuery({
    queryKey: ['eventos-receitas', eventoId],
    enabled: !!eventoId,
    queryFn: async () => {
      if (!eventoId) return [];
      const { data, error } = await supabase
        .from('eventos_receitas')
        .select('*')
        .eq('evento_id', eventoId);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: despesasData, isLoading: isLoadingDespesas } = useQuery({
    queryKey: ['eventos-despesas', eventoId],
    enabled: !!eventoId,
    queryFn: async () => {
      if (!eventoId) return [];
      const { data, error } = await supabase
        .from('eventos_despesas')
        .select('*')
        .eq('evento_id', eventoId);
      
      if (error) throw error;
      return data;
    },
  });

  const adicionarReceitaMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!eventoId) throw new Error('Evento ID não fornecido');
      const { error } = await supabase
        .from('eventos_receitas')
        .insert({ ...data, evento_id: eventoId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-receitas', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast.success('Receita adicionada com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao adicionar receita: ' + error.message);
    }
  });

  const adicionarDespesaMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!eventoId) throw new Error('Evento ID não fornecido');
      const { error } = await supabase
        .from('eventos_despesas')
        .insert({ ...data, evento_id: eventoId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-despesas', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast.success('Despesa adicionada com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao adicionar despesa: ' + error.message);
    }
  });

  const removerReceitaMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!eventoId) throw new Error('Evento ID não fornecido');
      const { error } = await supabase
        .from('eventos_receitas')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-receitas', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      toast.success('Receita removida com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao remover receita: ' + error.message);
    }
  });

  const removerDespesaMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!eventoId) throw new Error('Evento ID não fornecido');
      const { error } = await supabase
        .from('eventos_despesas')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-despesas', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      toast.success('Despesa removida com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao remover despesa: ' + error.message);
    }
  });

  return {
    receitas: receitasData || [],
    despesas: despesasData || [],
    loading: isLoadingReceitas || isLoadingDespesas,
    adicionarReceita: adicionarReceitaMutation.mutateAsync,
    adicionarDespesa: adicionarDespesaMutation.mutateAsync,
    removerReceita: removerReceitaMutation.mutateAsync,
    removerDespesa: removerDespesaMutation.mutateAsync,
  };
}