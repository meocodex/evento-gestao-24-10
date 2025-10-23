/**
 * Helpers temporários para facilitar migração
 * TODO: Remover após migração completa
 */
import * as React from 'react';
import { useDemandasQueries, useDemandasMutations } from './index';

export function useDemandasContext() {
  const [page] = React.useState(1);
  const { demandas = [], totalCount = 0 } = useDemandasQueries(page, 20);
  const mutations = useDemandasMutations();

  return {
    demandas,
    totalCount,
    page: 1,
    pageSize: 20,
    setPage: () => {},
    filtros: {},
    setFiltros: () => {},
    getDemandasFiltradas: () => demandas,
    getDemandasPorEvento: (eventoId: string) => demandas.filter((d: any) => d.eventoId === eventoId),
    getDemandasPorResponsavel: (responsavelId: string) => demandas.filter((d: any) => d.responsavelId === responsavelId),
    getDemandasPorSolicitante: (solicitanteId: string) => demandas.filter((d: any) => d.solicitanteId === solicitanteId),
    getEstatisticas: () => ({
      total: demandas.length,
      abertas: demandas.filter((d: any) => d.status === 'aberta').length,
      emAndamento: demandas.filter((d: any) => d.status === 'em-andamento').length,
      concluidas: demandas.filter((d: any) => d.status === 'concluida').length,
      canceladas: demandas.filter((d: any) => d.status === 'cancelada').length,
      urgentes: demandas.filter((d: any) => d.prioridade === 'urgente').length,
      arquivadas: demandas.filter((d: any) => d.arquivada).length,
      prazosVencidos: demandas.filter((d: any) => d.prazo && new Date(d.prazo) < new Date() && d.status !== 'concluida').length,
    }),
    ...mutations,
  };
}
