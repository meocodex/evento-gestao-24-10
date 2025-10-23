/**
 * Helpers temporários para facilitar migração
 * TODO: Remover após migração completa  
 */
import * as React from 'react';
import { useEstoqueQueries, useEstoqueMutations, type FiltrosEstoque } from './index';

export function useEstoque() {
  const [page] = React.useState(1);
  const [filtros, setFiltros] = React.useState<FiltrosEstoque>({ busca: '', categoria: 'todas', status: 'todos', localizacao: '' });
  const { data, isLoading: loading } = useEstoqueQueries(page, 50, filtros);
  const materiais = data?.materiais || [];
  const mutations = useEstoqueMutations();

  return {
    materiais,
    materiaisFiltrados: materiais,
    loading,
    filtros,
    setFiltros,
    page: 1,
    setPage: () => {},
    pageSize: 50,
    totalCount: data?.totalCount || 0,
    ...mutations,
    getEstatisticas: () => ({
      totalItens: materiais.reduce((sum: number, m: any) => sum + m.quantidadeTotal, 0),
      totalDisponiveis: materiais.reduce((sum: number, m: any) => sum + m.quantidadeDisponivel, 0),
      totalEmUso: materiais.reduce((sum: number, m: any) => sum + (m.quantidadeTotal - m.quantidadeDisponivel), 0),
      totalManutencao: 0,
      categorias: new Set(materiais.map((m: any) => m.categoria)).size,
    }),
    buscarMaterialPorId: (id: string) => materiais.find((m: any) => m.id === id),
  };
}
