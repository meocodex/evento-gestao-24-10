import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect } from 'react';
import type { ContaPagar } from '@/types/financeiro';

export function useContasPagar() {
  const queryClient = useQueryClient();

  // Real-time listener
  useEffect(() => {
    const channel = supabase
      .channel('contas-pagar-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contas_pagar' },
        () => queryClient.invalidateQueries({ queryKey: ['contas-pagar'] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  
  const { data: contas = [], isLoading } = useQuery({
    queryKey: ['contas-pagar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contas_pagar')
        .select('*')
        .order('data_vencimento', { ascending: true });
      
      if (error) throw error;
      return data as ContaPagar[];
    },
  });
  
  const criar = useMutation({
    mutationFn: async (data: Partial<ContaPagar>) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: result, error } = await supabase
        .from('contas_pagar')
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
      queryClient.invalidateQueries({ queryKey: ['contas-pagar'] });
      toast.success('Conta a pagar criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar conta: ' + error.message);
    },
  });
  
  const atualizar = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ContaPagar> & { id: string }) => {
      const { error } = await supabase
        .from('contas_pagar')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas-pagar'] });
      toast.success('Conta atualizada com sucesso!');
    },
  });
  
  const marcarComoPago = useMutation({
    mutationFn: async ({ 
      id, 
      data_pagamento, 
      forma_pagamento 
    }: { 
      id: string; 
      data_pagamento: string; 
      forma_pagamento: string;
    }) => {
      const { error } = await supabase
        .from('contas_pagar')
        .update({ 
          status: 'pago', 
          data_pagamento,
          forma_pagamento
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas-pagar'] });
      toast.success('Pagamento registrado! Próxima recorrência gerada automaticamente.');
    },
  });
  
  const deletar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contas_pagar')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas-pagar'] });
      toast.success('Conta excluída com sucesso!');
    },
  });
  
  const historicoRecorrencia = (origemId: string) => useQuery({
    queryKey: ['contas-pagar-historico', origemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contas_pagar')
        .select('*')
        .or(`id.eq.${origemId},recorrencia_origem_id.eq.${origemId}`)
        .order('data_vencimento', { ascending: false });
      
      if (error) throw error;
      return data as ContaPagar[];
    },
  });
  
  return {
    contas,
    isLoading,
    criar,
    atualizar,
    marcarComoPago,
    deletar,
    historicoRecorrencia,
  };
}
