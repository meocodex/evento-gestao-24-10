import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useEventosFinanceiro(eventoId?: string) {
  const { data: receitasData, isLoading: isLoadingReceitas } = useQuery({
    queryKey: ['eventos-receitas', eventoId],
    enabled: !!eventoId,
    queryFn: async () => {
      if (!eventoId) return [];
      const { data, error } = await supabase
        .from('eventos_financeiro')
        .select('*')
        .eq('evento_id', eventoId)
        .eq('tipo', 'receita');
      
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
        .from('eventos_financeiro')
        .select('*')
        .eq('evento_id', eventoId)
        .eq('tipo', 'despesa');
      
      if (error) throw error;
      return data;
    },
  });

  const adicionarReceita = async (data: any) => {
    if (!eventoId) return;
    const { error } = await supabase
      .from('eventos_financeiro')
      .insert({ ...data, evento_id: eventoId, tipo: 'receita' });
    if (error) throw error;
    toast.success('Receita adicionada com sucesso!');
  };

  const adicionarDespesa = async (data: any) => {
    if (!eventoId) return;
    const { error } = await supabase
      .from('eventos_financeiro')
      .insert({ ...data, evento_id: eventoId, tipo: 'despesa' });
    if (error) throw error;
    toast.success('Despesa adicionada com sucesso!');
  };

  const removerReceita = async (id: string) => {
    if (!eventoId) return;
    const { error } = await supabase
      .from('eventos_financeiro')
      .delete()
      .eq('id', id);
    if (error) throw error;
    toast.success('Receita removida com sucesso!');
  };

  const removerDespesa = async (id: string) => {
    if (!eventoId) return;
    const { error } = await supabase
      .from('eventos_financeiro')
      .delete()
      .eq('id', id);
    if (error) throw error;
    toast.success('Despesa removida com sucesso!');
  };

  return {
    receitas: receitasData || [],
    despesas: despesasData || [],
    loading: isLoadingReceitas || isLoadingDespesas,
    adicionarReceita,
    adicionarDespesa,
    removerReceita,
    removerDespesa,
  };
}