import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { useEstoqueQueries } from './estoque/useEstoqueQueries';
import { useEstoqueMutations } from './estoque/useEstoqueMutations';
import { useEstoqueSeriais } from './estoque/useEstoqueSeriais';
import type { MaterialEstoque, SerialEstoque, FiltrosEstoque } from './estoque/types';

export type { MaterialEstoque, SerialEstoque, FiltrosEstoque };

interface EstoqueContextData {
  materiais: any[];
  loading: boolean;
  filtros: FiltrosEstoque;
  setFiltros: (filtros: FiltrosEstoque) => void;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  totalCount: number;
  adicionarMaterial: (material: Omit<MaterialEstoque, 'id' | 'seriais' | 'quantidadeTotal' | 'quantidadeDisponivel' | 'unidade'>) => Promise<any>;
  editarMaterial: (id: string, dados: Partial<MaterialEstoque>) => Promise<void>;
  excluirMaterial: (id: string) => Promise<void>;
  adicionarSerial: (materialId: string, serial: SerialEstoque) => Promise<void>;
  editarSerial: (materialId: string, numeroSerial: string, dados: Partial<SerialEstoque>) => Promise<void>;
  excluirSerial: (materialId: string, numeroSerial: string) => Promise<void>;
  buscarMaterialPorId: (id: string) => MaterialEstoque | undefined;
  materiaisFiltrados: any[];
  getEstatisticas: () => {
    totalItens: number;
    totalDisponiveis: number;
    totalEmUso: number;
    totalManutencao: number;
    categorias: number;
  };
}

const EstoqueContext = createContext<EstoqueContextData | undefined>(undefined);

export function EstoqueProvider({ children }: { children: ReactNode }) {
  const [filtros, setFiltros] = useState<FiltrosEstoque>({
    busca: '',
    categoria: 'todas',
    status: 'todos',
    localizacao: '',
  });
  const [page, setPage] = useState(1);
  const pageSize = 50;

  // Usar queries otimizadas
  const { data, isLoading: loading } = useEstoqueQueries(page, pageSize, filtros);
  const materiais = data?.materiais || [];
  const totalCount = data?.totalCount || 0;

  const mutations = useEstoqueMutations();

  // Filtros server-side (busca e categoria já aplicados)
  // Filtros client-side apenas para status e localização (dados de seriais)
  const materiaisFiltrados = useMemo(() => {
    if (filtros.status === 'todos' && !filtros.localizacao) {
      return materiais;
    }

    // TODO: Carregar seriais sob demanda quando necessário filtrar por status/localização
    return materiais;
  }, [materiais, filtros]);

  const adicionarMaterial = async (dados: Omit<MaterialEstoque, 'id' | 'seriais' | 'quantidadeTotal' | 'quantidadeDisponivel' | 'unidade'>) => {
    return mutations.adicionarMaterial.mutateAsync(dados);
  };

  const editarMaterial = async (id: string, dados: Partial<MaterialEstoque>) => {
    return mutations.editarMaterial.mutateAsync({ id, dados });
  };

  const excluirMaterial = async (id: string): Promise<void> => {
    await mutations.excluirMaterial.mutateAsync(id);
  };

  const adicionarSerial = async (materialId: string, dados: SerialEstoque) => {
    return mutations.adicionarSerial.mutateAsync({ materialId, dados });
  };

  const editarSerial = async (materialId: string, numeroSerial: string, dados: Partial<SerialEstoque>) => {
    return mutations.editarSerial.mutateAsync({ materialId, numeroSerial, dados });
  };

  const excluirSerial = async (materialId: string, numeroSerial: string) => {
    return mutations.excluirSerial.mutateAsync({ materialId, numeroSerial });
  };

  const buscarMaterialPorId = (id: string) => {
    return materiais.find(m => m.id === id);
  };

  const getEstatisticas = () => {
    const totalItens = materiais.reduce((acc, m) => acc + (m.quantidade_total || 0), 0);
    const totalDisponiveis = materiais.reduce((acc, m) => acc + (m.quantidade_disponivel || 0), 0);
    
    // Estimativa sem carregar todos os seriais
    const totalEmUso = totalItens - totalDisponiveis;
    const totalManutencao = 0; // TODO: Calcular quando necessário

    const categorias = new Set(materiais.map(m => m.categoria)).size;

    return {
      totalItens,
      totalDisponiveis,
      totalEmUso,
      totalManutencao,
      categorias,
    };
  };

  return (
    <EstoqueContext.Provider
      value={{
        materiais,
        loading,
        filtros,
        setFiltros,
        page,
        setPage,
        pageSize,
        totalCount,
        adicionarMaterial,
        editarMaterial,
        excluirMaterial,
        adicionarSerial,
        editarSerial,
        excluirSerial,
        buscarMaterialPorId,
        materiaisFiltrados,
        getEstatisticas,
      }}
    >
      {children}
    </EstoqueContext.Provider>
  );
}

export function useEstoque() {
  const context = useContext(EstoqueContext);
  if (!context) {
    throw new Error('useEstoque deve ser usado dentro de EstoqueProvider');
  }
  return context;
}
