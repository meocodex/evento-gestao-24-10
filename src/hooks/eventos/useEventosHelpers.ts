/**
 * Helpers temporários para facilitar migração
 * TODO: Remover após migração completa
 */
import * as React from 'react';
import { useEventosQueries, useEventosMutations } from './index';

export function useEventos() {
  const [page] = React.useState(1);
  const { eventos = [], totalCount = 0 } = useEventosQueries(page, 50);
  const mutations = useEventosMutations();

  return {
    eventos,
    totalCount,
    page: 1,
    pageSize: 50,
    setPage: () => {},
    ...mutations,
  };
}
