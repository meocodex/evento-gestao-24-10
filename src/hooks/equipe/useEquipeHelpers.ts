/**
 * Helpers temporários para facilitar migração
 * TODO: Remover após migração completa
 */
import * as React from 'react';
import { useOperacionalQueries, useOperacionalMutations, useProfilesQueries } from './index';

export function useEquipe() {
  const [page] = React.useState(1);
  const { operacionais = [], totalCount = 0, loading, error, refetch } = useOperacionalQueries(page, 50, {}, true);
  const { data: profiles = [], isLoading: loadingProfiles } = useProfilesQueries(true);
  const mutations = useOperacionalMutations();

  const membrosUnificados = React.useMemo(() => {
    const unificados = [...operacionais.map((op: any) => ({ ...op, tipo: 'operacional' as const }))];
    profiles.forEach((p: any) => {
      if (!operacionais.find((op: any) => op.email === p.email)) {
        unificados.push({ ...p, tipo: 'sistema' as const });
      }
    });
    return unificados;
  }, [operacionais, profiles]);

  return {
    operacionais,
    totalCount,
    loading,
    error,
    refetch,
    membrosUnificados,
    loadingMembros: loading || loadingProfiles,
    page: 1,
    setPage: () => {},
    pageSize: 50,
    filtros: {},
    setFiltros: () => {},
    ...mutations,
  };
}
