import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Receita, Despesa } from '@/types/eventos';

export function useEventosFinanceiro() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Receitas
  const adicionarReceita = useMutation({
    mutationFn: async ({ 
      eventoId, 
      receita 
    }: { 
      eventoId: string; 
      receita: Omit<Receita, 'id'> 
    }) => {
      const { data, error } = await supabase
        .from('eventos_receitas')
        .insert([{
          evento_id: eventoId,
          descricao: receita.descricao,
          tipo: receita.tipo,
          quantidade: receita.quantidade,
          valor_unitario: receita.valorUnitario,
          valor: receita.valor,
          status: receita.status,
          data: receita.data,
          comprovante: receita.comprovante
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast({
        title: 'Receita adicionada!',
        description: `${variables.receita.descricao} foi adicionada ao financeiro.`
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao adicionar receita',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const removerReceita = useMutation({
    mutationFn: async ({ receitaId }: { receitaId: string }) => {
      const { error } = await supabase
        .from('eventos_receitas')
        .delete()
        .eq('id', receitaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast({
        title: 'Receita removida!',
        description: 'Receita removida do financeiro.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover receita',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Despesas
  const adicionarDespesa = useMutation({
    mutationFn: async ({ 
      eventoId, 
      despesa 
    }: { 
      eventoId: string; 
      despesa: Omit<Despesa, 'id'> 
    }) => {
      const { data, error } = await supabase
        .from('eventos_despesas')
        .insert([{
          evento_id: eventoId,
          descricao: despesa.descricao,
          categoria: despesa.categoria,
          quantidade: despesa.quantidade,
          valor_unitario: despesa.valorUnitario,
          valor: despesa.valor,
          status: despesa.status,
          data: despesa.data,
          data_pagamento: despesa.dataPagamento,
          responsavel: despesa.responsavel,
          observacoes: despesa.observacoes,
          comprovante: despesa.comprovante,
          selecionada_relatorio: despesa.selecionadaRelatorio
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast({
        title: 'Despesa adicionada!',
        description: `${variables.despesa.descricao} foi adicionada ao financeiro.`
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao adicionar despesa',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const editarDespesa = useMutation({
    mutationFn: async ({ 
      despesaId, 
      data 
    }: { 
      despesaId: string; 
      data: Partial<Despesa> 
    }) => {
      const updateData: any = {};
      
      if (data.descricao !== undefined) updateData.descricao = data.descricao;
      if (data.categoria !== undefined) updateData.categoria = data.categoria;
      if (data.quantidade !== undefined) updateData.quantidade = data.quantidade;
      if (data.valorUnitario !== undefined) updateData.valor_unitario = data.valorUnitario;
      if (data.valor !== undefined) updateData.valor = data.valor;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.data !== undefined) updateData.data = data.data;
      if (data.dataPagamento !== undefined) updateData.data_pagamento = data.dataPagamento;
      if (data.responsavel !== undefined) updateData.responsavel = data.responsavel;
      if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;
      if (data.comprovante !== undefined) updateData.comprovante = data.comprovante;
      if (data.selecionadaRelatorio !== undefined) updateData.selecionada_relatorio = data.selecionadaRelatorio;

      const { error } = await supabase
        .from('eventos_despesas')
        .update(updateData)
        .eq('id', despesaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast({
        title: 'Despesa atualizada!',
        description: 'Despesa atualizada com sucesso.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar despesa',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const removerDespesa = useMutation({
    mutationFn: async ({ despesaId }: { despesaId: string }) => {
      const { error } = await supabase
        .from('eventos_despesas')
        .delete()
        .eq('id', despesaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast({
        title: 'Despesa removida!',
        description: 'Despesa removida do financeiro.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover despesa',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    adicionarReceita,
    removerReceita,
    adicionarDespesa,
    editarDespesa,
    removerDespesa
  };
}
