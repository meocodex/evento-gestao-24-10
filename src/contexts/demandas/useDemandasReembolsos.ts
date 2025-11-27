import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ItemReembolso } from '@/types/demandas';

export function useDemandasReembolsos() {
  const queryClient = useQueryClient();

  const adicionarDemandaReembolso = useMutation({
    mutationFn: async ({ 
      eventoId,
      eventoNome,
      membroEquipeId,
      membroEquipeNome,
      itens,
      observacoes 
    }: { 
      eventoId: string;
      eventoNome: string;
      membroEquipeId: string;
      membroEquipeNome: string;
      itens: ItemReembolso[];
      observacoes?: string;
    }) => {
      const valorTotal = itens.reduce((sum, item) => sum + item.valor, 0);
      const dataAtual = new Date().toLocaleDateString('pt-BR');

      const { error } = await supabase
        .from('demandas')
        .insert([{
          titulo: `Reembolso - ${membroEquipeNome} - ${dataAtual}`,
          descricao: observacoes || `Solicitação de reembolso de ${itens.length} item(ns)`,
          categoria: 'reembolso',
          prioridade: 'media',
          status: 'aberta',
          solicitante: membroEquipeNome,
          solicitante_id: membroEquipeId,
          evento_id: eventoId,
          tags: ['reembolso', eventoNome],
          dados_reembolso: JSON.parse(JSON.stringify({
            itens,
            valorTotal,
            membroEquipeId,
            membroEquipeNome,
            statusPagamento: 'pendente'
          }))
        }]);

      if (error) throw error;
      return valorTotal;
    },
    onSuccess: (valorTotal) => {
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
      toast({ 
        title: 'Solicitação de reembolso criada!', 
        description: `Valor total: R$ ${valorTotal.toFixed(2)}` 
      });
    },
    onError: (error) => {
      console.error('Erro ao criar reembolso:', error);
      toast({ title: 'Erro ao criar reembolso', variant: 'destructive' });
    },
  });

  const aprovarReembolso = useMutation({
    mutationFn: async ({ 
      demandaId, 
      formaPagamento, 
      observacoes 
    }: { 
      demandaId: string; 
      formaPagamento: string; 
      observacoes?: string;
    }) => {
      // Buscar demanda atual
      const { data: demanda, error: fetchError } = await supabase
        .from('demandas')
        .select('dados_reembolso')
        .eq('id', demandaId)
        .single();

      if (fetchError) throw fetchError;

      const reembolsoAtual = demanda.dados_reembolso as any;

      // Atualizar dados de reembolso
      const dadosAtualizados = {
        ...reembolsoAtual,
        statusPagamento: 'aprovado',
        formaPagamento,
        observacoesPagamento: observacoes,
      };

      const { error } = await supabase
        .from('demandas')
        .update({
          dados_reembolso: JSON.parse(JSON.stringify(dadosAtualizados)),
          status: 'em-andamento',
        })
        .eq('id', demandaId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
      queryClient.invalidateQueries({ queryKey: ['demanda-detalhes', variables.demandaId] });
      toast({ title: 'Reembolso aprovado!', description: 'Aguardando confirmação de pagamento.' });
    },
    onError: (error) => {
      console.error('Erro ao aprovar reembolso:', error);
      toast({ title: 'Erro ao aprovar reembolso', variant: 'destructive' });
    },
  });

  const marcarReembolsoPago = useMutation({
    mutationFn: async ({ 
      demandaId, 
      dataPagamento, 
      observacoes,
      comprovante 
    }: { 
      demandaId: string; 
      dataPagamento: string; 
      observacoes?: string;
      comprovante?: string;
    }) => {
      // Buscar demanda atual
      const { data: demanda, error: fetchError } = await supabase
        .from('demandas')
        .select('dados_reembolso')
        .eq('id', demandaId)
        .single();

      if (fetchError) throw fetchError;

      const reembolsoAtual = demanda.dados_reembolso as any;

      // Atualizar dados de reembolso
      const dadosAtualizados = {
        ...reembolsoAtual,
        statusPagamento: 'pago',
        dataPagamento,
        comprovantePagamento: comprovante,
        observacoesPagamento: observacoes || reembolsoAtual?.observacoesPagamento,
      };

      const { error } = await supabase
        .from('demandas')
        .update({
          dados_reembolso: JSON.parse(JSON.stringify(dadosAtualizados)),
          status: 'concluida',
          data_conclusao: new Date().toISOString(),
        })
        .eq('id', demandaId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
      queryClient.invalidateQueries({ queryKey: ['demanda-detalhes', variables.demandaId] });
      toast({ title: 'Pagamento confirmado!', description: 'O reembolso foi marcado como pago.' });
    },
    onError: (error) => {
      console.error('Erro ao marcar como pago:', error);
      toast({ title: 'Erro ao marcar como pago', variant: 'destructive' });
    },
  });

  const recusarReembolso = useMutation({
    mutationFn: async ({ demandaId, motivo }: { demandaId: string; motivo: string }) => {
      // Buscar demanda atual
      const { data: demanda, error: fetchError } = await supabase
        .from('demandas')
        .select('dados_reembolso')
        .eq('id', demandaId)
        .single();

      if (fetchError) throw fetchError;

      const reembolsoAtual = demanda.dados_reembolso as any;

      // Atualizar dados de reembolso
      const dadosAtualizados = {
        ...reembolsoAtual,
        statusPagamento: 'recusado',
        observacoesPagamento: motivo,
      };

      const { error } = await supabase
        .from('demandas')
        .update({
          dados_reembolso: JSON.parse(JSON.stringify(dadosAtualizados)),
          status: 'cancelada',
          data_conclusao: new Date().toISOString(),
        })
        .eq('id', demandaId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
      queryClient.invalidateQueries({ queryKey: ['demanda-detalhes', variables.demandaId] });
      toast({ title: 'Reembolso recusado', description: 'O solicitante será notificado.' });
    },
    onError: (error) => {
      console.error('Erro ao recusar reembolso:', error);
      toast({ title: 'Erro ao recusar reembolso', variant: 'destructive' });
    },
  });

  return {
    adicionarDemandaReembolso,
    aprovarReembolso,
    marcarReembolsoPago,
    recusarReembolso,
  };
}
