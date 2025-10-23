/**
 * Helpers temporários para facilitar migração
 * TODO: Remover após migração completa
 */
import * as React from 'react';
import { 
  useEventosQueries, 
  useEventosMutations, 
  useEventosFinanceiro,
  useEventosEquipe,
  useEventosMateriaisAlocados,
  useEventosObservacoes
} from './index';

export function useEventos() {
  const [page] = React.useState(1);
  const { eventos = [], totalCount = 0 } = useEventosQueries(page, 50);
  const mutations = useEventosMutations();
  const financeiro = useEventosFinanceiro();
  const equipe = useEventosEquipe();
  const materiais = useEventosMateriaisAlocados();
  const observacoes = useEventosObservacoes();

  return {
    eventos,
    totalCount,
    page: 1,
    pageSize: 50,
    setPage: () => {},
    ...mutations,
    ...financeiro,
    ...equipe,
    ...materiais,
    ...observacoes,
  };
}
