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
    const unificados = [...operacionais.map((op: any) => ({ 
      ...op, 
      tipo: 'operacional' as const, 
      tipo_membro: 'operacional',
      funcao_principal: op.funcao_principal || 'Operacional',
      avatar_url: op.foto || null
    }))];
    profiles.forEach((p: any) => {
      if (!operacionais.find((op: any) => op.email === p.email)) {
        unificados.push({ 
          ...p, 
          tipo: 'operacional' as const, 
          tipo_membro: 'sistema',
          telefone: p.telefone || null,
          cpf: p.cpf || null,
          whatsapp: p.whatsapp || null,
          funcao_principal: 'Sistema'
        });
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
    criarOperacional: mutations.criarOperacional,
    editarOperacional: mutations.editarOperacional,
    excluirOperacional: (id: string) => mutations.deletarOperacional.mutateAsync(id),
  };
}
