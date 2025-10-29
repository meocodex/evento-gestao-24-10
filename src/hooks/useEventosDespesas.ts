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
    vincularReembolsoADespesa: async (demandaId: string, reembolso: any) => {
      if (!eventoId) return; // no-op quando não há evento associado
      const valor = reembolso.valorTotal || reembolso.valor || 0;
      await financeiro.adicionarDespesa({
        descricao: reembolso.descricao || 'Reembolso',
        categoria: 'pessoal' as const,
        quantidade: 1,
        valorUnitario: valor,
        valor,
        status: 'pendente' as const,
        data: new Date().toISOString().split('T')[0]
      });
    }
  };
}
