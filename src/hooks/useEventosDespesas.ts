import { useEventosFinanceiro } from '@/hooks/eventos';

/**
 * Hook para gerenciar despesas de eventos relacionadas a demandas de reembolso.
 * 
 * Este hook desacopla a lógica de vinculação de reembolsos das despesas,
 * eliminando a necessidade de callbacks globais e acoplamento circular
 * entre EventosContext e DemandasContext.
 */
export function useEventosDespesas() {
  const { adicionarDespesa } = useEventosFinanceiro();

  return {
    /**
     * Vincula uma demanda de reembolso a uma despesa do evento.
     * Cria uma nova despesa no financeiro do evento com base nos dados do reembolso.
     */
    vincularReembolsoADespesa: async (eventoId: string, demandaId: string, reembolso: any) => {
      await adicionarDespesa.mutateAsync({
        eventoId,
        despesa: {
          descricao: reembolso.descricao || 'Reembolso',
          categoria: 'pessoal' as const,
          valor: reembolso.valorTotal || reembolso.valor,
          demandaId,
        }
      });
    }
  };
}
