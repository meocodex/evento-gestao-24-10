import { useEventosFinanceiro } from '@/hooks/eventos';

/**
 * Hook para gerenciar despesas de eventos relacionadas a demandas de reembolso.
 * 
 * Este hook desacopla a lógica de vinculação de reembolsos das despesas,
 * eliminando a necessidade de callbacks globais e acoplamento circular
 * entre EventosContext e DemandasContext.
 */
export function useEventosDespesas() {
  const { vincularReembolsoADespesa } = useEventosFinanceiro();

  return {
    /**
     * Vincula uma demanda de reembolso a uma despesa do evento.
     * Cria uma nova despesa no financeiro do evento com base nos dados do reembolso.
     */
    vincularReembolsoADespesa
  };
}
