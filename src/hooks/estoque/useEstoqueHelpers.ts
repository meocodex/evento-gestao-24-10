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

  const excluirMaterialFn = React.useCallback(async (id: string) => {
    return await mutations.excluirMaterial.mutateAsync(id);
  }, [mutations.excluirMaterial]);

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
    adicionarMaterial: (dados: any) => mutations.adicionarMaterial.mutateAsync(dados),
    editarMaterial: (id: string, dados: any) => mutations.editarMaterial.mutateAsync({ id, dados }),
    excluirMaterial: excluirMaterialFn,
    adicionarSerial: (materialId: string, dados: any) => mutations.adicionarSerial.mutateAsync({ materialId, dados }),
    editarSerial: (materialId: string, numeroSerial: string, dados: any) => mutations.editarSerial.mutateAsync({ materialId, numeroSerial, dados }),
    excluirSerial: (materialId: string, numeroSerial: string) => mutations.excluirSerial.mutateAsync({ materialId, numeroSerial }),
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
