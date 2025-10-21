import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useOperacionalQueries } from './equipe/useOperacionalQueries';
import { useOperacionalMutations } from './equipe/useOperacionalMutations';
import { useConflitosEquipe } from './equipe/useConflitosEquipe';
import { OperacionalEquipe, ConflitoDatas } from '@/types/equipe';
import { FiltrosOperacional } from './equipe/types';

interface EquipeContextType {
  // Operacionais
  operacionais: OperacionalEquipe[];
  totalCount: number;
  loading: boolean;
  error: any;
  refetch: () => void;
  
  // Paginação
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  
  // Filtros
  filtros: FiltrosOperacional;
  setFiltros: (filtros: FiltrosOperacional) => void;
  
  // Mutations
  criarOperacional: any;
  editarOperacional: any;
  deletarOperacional: any;
  
  // Conflitos
  verificarConflitos: (params: {
    operacionalId?: string;
    nome?: string;
    funcao?: string;
    dataInicio: string;
    dataFim: string;
    eventoAtualId?: string;
  }) => Promise<ConflitoDatas[]>;
}

const EquipeContext = createContext<EquipeContextType | undefined>(undefined);

export function EquipeProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [filtros, setFiltros] = useState<FiltrosOperacional>({});

  const {
    operacionais,
    totalCount,
    loading,
    error,
    refetch
  } = useOperacionalQueries(page, pageSize, filtros);

  const {
    criarOperacional,
    editarOperacional,
    deletarOperacional
  } = useOperacionalMutations();

  const { verificarConflitos } = useConflitosEquipe();

  const value: EquipeContextType = {
    operacionais,
    totalCount,
    loading,
    error,
    refetch,
    page,
    setPage,
    pageSize,
    filtros,
    setFiltros,
    criarOperacional,
    editarOperacional,
    deletarOperacional,
    verificarConflitos
  };

  return (
    <EquipeContext.Provider value={value}>
      {children}
    </EquipeContext.Provider>
  );
}

export function useEquipe() {
  const context = useContext(EquipeContext);
  if (context === undefined) {
    throw new Error('useEquipe must be used within a EquipeProvider');
  }
  return context;
}
