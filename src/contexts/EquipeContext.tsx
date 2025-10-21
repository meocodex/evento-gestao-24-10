import React, { createContext, useContext, ReactNode } from 'react';
import { useOperacionalQueries } from './equipe/useOperacionalQueries';
import { useOperacionalMutations } from './equipe/useOperacionalMutations';
import { useConflitosEquipe } from './equipe/useConflitosEquipe';
import { OperacionalEquipe, ConflitoDatas } from '@/types/equipe';

interface EquipeContextType {
  // Operacionais
  operacionais: OperacionalEquipe[];
  loading: boolean;
  error: any;
  refetch: () => void;
  
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
  const {
    operacionais,
    loading,
    error,
    refetch
  } = useOperacionalQueries();

  const {
    criarOperacional,
    editarOperacional,
    deletarOperacional
  } = useOperacionalMutations();

  const { verificarConflitos } = useConflitosEquipe();

  const value: EquipeContextType = {
    operacionais,
    loading,
    error,
    refetch,
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
