import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DatabaseError, getErrorMessage, ReceitaCreateData, DespesaCreateData } from '@/types/utils';
import type { Database } from '@/integrations/supabase/types';

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
    mutationFn: async (data: ReceitaCreateData) => {
      if (!eventoId) throw new Error('Evento ID não fornecido');
      const { error } = await supabase
        .from('eventos_receitas')
        .insert([{ ...data, evento_id: eventoId } as Database['public']['Tables']['eventos_receitas']['Insert']]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-receitas', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast.success('Receita adicionada com sucesso!');
    },
    onError: (error: DatabaseError) => {
      toast.error('Erro ao adicionar receita: ' + getErrorMessage(error));
    }
  });

  const adicionarDespesaMutation = useMutation({
    mutationFn: async (data: DespesaCreateData) => {
      if (!eventoId) throw new Error('Evento ID não fornecido');
      const { error } = await supabase
        .from('eventos_despesas')
        .insert([{ ...data, evento_id: eventoId } as Database['public']['Tables']['eventos_despesas']['Insert']]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-despesas', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast.success('Despesa adicionada com sucesso!');
    },
    onError: (error: DatabaseError) => {
      toast.error('Erro ao adicionar despesa: ' + getErrorMessage(error));
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
    onError: (error: DatabaseError) => {
      toast.error('Erro ao remover receita: ' + getErrorMessage(error));
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
    onError: (error: DatabaseError) => {
      toast.error('Erro ao remover despesa: ' + getErrorMessage(error));
    }
  });

  const adicionarReceitaComTaxasMutation = useMutation({
    mutationFn: async ({ receita, formasPagamento }: { 
      receita: ReceitaCreateData; 
      formasPagamento: Array<{ forma: string; valor: number; taxa_percentual: number }> 
    }) => {
      if (!eventoId) throw new Error('Evento ID não fornecido');
      
      const valorTotal = formasPagamento.reduce((sum, fp) => sum + fp.valor, 0);
      
      // Criar receita com taxas
      const { data: receitaData, error: receitaError } = await supabase
        .from('eventos_receitas')
        .insert([{
          ...receita,
          evento_id: eventoId,
          valor: valorTotal,
          tem_taxas: true,
          formas_pagamento: formasPagamento,
        } as Database['public']['Tables']['eventos_receitas']['Insert']])
        .select()
        .single();
      
      if (receitaError) throw receitaError;
      
      // Criar despesas para cada taxa > 0
      const despesasTaxas = formasPagamento
        .filter(fp => fp.taxa_percentual > 0)
        .map(fp => ({
          evento_id: eventoId,
          descricao: `Taxa de ${fp.forma} - ${receita.tipo_servico || receita.descricao}`,
          categoria: 'taxas' as Database['public']['Enums']['categoria_financeira'],
          valor: fp.valor * fp.taxa_percentual / 100,
          valor_unitario: fp.valor * fp.taxa_percentual / 100,
          quantidade: 1,
          data: receita.data,
          status: 'pendente' as Database['public']['Enums']['status_financeiro'],
        }));
      
      if (despesasTaxas.length > 0) {
        const { data: despesasData, error: despesasError } = await supabase
          .from('eventos_despesas')
          .insert(despesasTaxas as Database['public']['Tables']['eventos_despesas']['Insert'][])
          .select();
        
        if (despesasError) throw despesasError;
        
        // Vincular IDs das despesas à receita
        const despesasIds = despesasData.map(d => d.id);
        const { error: updateError } = await supabase
          .from('eventos_receitas')
          .update({ despesas_taxas_ids: despesasIds })
          .eq('id', receitaData.id);
        
        if (updateError) throw updateError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-receitas', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['eventos-despesas', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast.success('Receita com taxas adicionada com sucesso!');
    },
    onError: (error: DatabaseError) => {
      // Mensagens de erro mais específicas
      const mensagemBase = getErrorMessage(error);
      let mensagem = 'Erro ao adicionar receita';
      
      if (mensagemBase.includes('categoria_financeira')) {
        mensagem = 'Erro de categoria. Por favor, atualize a página e tente novamente.';
      } else if (mensagemBase.includes('eventos_despesas')) {
        mensagem = 'Erro ao criar despesas de taxa. Verifique os valores e tente novamente.';
      } else {
        mensagem = `Erro ao adicionar receita: ${mensagemBase}`;
      }
      
      toast.error(mensagem);
    }
  });

  return {
    receitas: receitasData || [],
    despesas: despesasData || [],
    loading: isLoadingReceitas || isLoadingDespesas,
    adicionarReceita: adicionarReceitaMutation.mutateAsync,
    adicionarReceitaComTaxas: adicionarReceitaComTaxasMutation.mutateAsync,
    adicionarDespesa: adicionarDespesaMutation.mutateAsync,
    removerReceita: removerReceitaMutation.mutateAsync,
    removerDespesa: removerDespesaMutation.mutateAsync,
  };
}