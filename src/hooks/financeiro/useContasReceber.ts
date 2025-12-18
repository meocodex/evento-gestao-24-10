import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect } from 'react';
import type { ContaReceber } from '@/types/financeiro';
import { DatabaseError, getErrorMessage } from '@/types/utils';

export function useContasReceber() {
  const queryClient = useQueryClient();

  // Real-time listener
  useEffect(() => {
    const channel = supabase
      .channel('contas-receber-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contas_receber' },
        () => queryClient.invalidateQueries({ queryKey: ['contas-receber'] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  
  const { data: contas = [], isLoading } = useQuery({
    queryKey: ['contas-receber'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contas_receber')
        .select('*')
        .order('data_vencimento', { ascending: true });
      
      if (error) throw error;
      return data as ContaReceber[];
    },
  });
  
  const criar = useMutation({
    mutationFn: async (data: Partial<ContaReceber>) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: result, error } = await supabase
        .from('contas_receber')
        .insert({
          ...data,
          created_by: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas-receber'] });
      toast.success('Conta a receber criada com sucesso!');
    },
    onError: (error: DatabaseError) => {
      toast.error('Erro ao criar conta: ' + getErrorMessage(error));
    },
  });
  
  const atualizar = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ContaReceber> & { id: string }) => {
      const { error } = await supabase
        .from('contas_receber')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas-receber'] });
      toast.success('Conta atualizada com sucesso!');
    },
  });
  
  const marcarComoRecebido = useMutation({
    mutationFn: async ({ 
      id, 
      data_recebimento, 
      forma_recebimento 
    }: { 
      id: string; 
      data_recebimento: string; 
      forma_recebimento: string;
    }) => {
      const { error } = await supabase
        .from('contas_receber')
        .update({ 
          status: 'recebido', 
          data_recebimento,
          forma_recebimento
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas-receber'] });
      toast.success('Recebimento registrado! Próxima recorrência gerada automaticamente.');
    },
  });
  
  const deletar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contas_receber')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas-receber'] });
      toast.success('Conta excluída com sucesso!');
    },
  });
  
  const historicoRecorrencia = (origemId: string) => useQuery({
    queryKey: ['contas-receber-historico', origemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contas_receber')
        .select('*')
        .or(`id.eq.${origemId},recorrencia_origem_id.eq.${origemId}`)
        .order('data_vencimento', { ascending: false });
      
      if (error) throw error;
      return data as ContaReceber[];
    },
  });
  
  return {
    contas,
    isLoading,
    criar,
    atualizar,
    marcarComoRecebido,
    deletar,
    historicoRecorrencia,
  };
}
