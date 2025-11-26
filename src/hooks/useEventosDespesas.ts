import { useEventosFinanceiro } from '@/hooks/eventos';

/**
 * Hook para gerenciar despesas de eventos relacionadas a demandas de reembolso.
 * 
 * Este hook desacopla a lógica de vinculação de reembolsos das despesas,
 * eliminando a necessidade de callbacks globais e acoplamento circular
 * entre EventosContext e DemandasContext.
 */
export function useEventosDespesas(eventoId: string) {
  const financeiro = useEventosFinanceiro(eventoId || undefined as any);

  return {
    /**
     * Vincula uma demanda de reembolso a uma despesa do evento.
     * Cria uma nova despesa no financeiro do evento com base nos dados do reembolso.
     */
    vincularReembolsoADespesa: async (
      demandaId: string, 
      reembolso: any, 
      dataPagamento: string, 
      comprovante?: string
    ) => {
      if (!eventoId) return; // no-op quando não há evento associado
      const valor = reembolso.valorTotal || reembolso.valor || 0;
      
      await financeiro.adicionarDespesa({
        descricao: `Reembolso - ${reembolso.membroEquipeNome}`,
        categoria: 'Reembolso de Equipe' as const,
        quantidade: 1,
        valor_unitario: valor,
        valor,
        status: 'pago' as const,
        data: dataPagamento,
        data_pagamento: dataPagamento,
        responsavel: reembolso.membroEquipeNome,
        comprovante: comprovante,
        observacoes: `Demanda #${demandaId.slice(0,8)} - ${reembolso.itens?.length || 0} item(ns)`
      });
    }
  };
}
