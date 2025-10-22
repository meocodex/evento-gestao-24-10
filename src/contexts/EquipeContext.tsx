import React, { createContext, useContext, ReactNode, useState, useMemo, useEffect } from 'react';
import { useOperacionalQueries } from './equipe/useOperacionalQueries';
import { useOperacionalMutations } from './equipe/useOperacionalMutations';
import { useConflitosEquipe } from './equipe/useConflitosEquipe';
import { useProfilesQueries } from './equipe/useProfilesQueries';
import { OperacionalEquipe, ConflitoDatas, MembroEquipeUnificado } from '@/types/equipe';
import { FiltrosOperacional } from './equipe/types';

interface EquipeContextType {
  // Operacionais
  operacionais: OperacionalEquipe[];
  totalCount: number;
  loading: boolean;
  error: any;
  refetch: () => void;
  
  // Membros Unificados (operacionais + profiles)
  membrosUnificados: MembroEquipeUnificado[];
  loadingMembros: boolean;
  
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
    operacionais = [],
    totalCount = 0,
    loading,
    error,
    refetch
  } = useOperacionalQueries(page, pageSize, filtros);

  const { 
    data: profiles = [], 
    isLoading: loadingProfiles,
    error: profilesError 
  } = useProfilesQueries();

  // Logs temporários para debugging
  useEffect(() => {
    if (error) console.error('❌ Erro em operacionais:', error);
    if (profilesError) console.error('❌ Erro em profiles:', profilesError);
  }, [error, profilesError]);

  const {
    criarOperacional,
    editarOperacional,
    deletarOperacional
  } = useOperacionalMutations();

  const { verificarConflitos } = useConflitosEquipe();

  // Unificar operacionais e profiles
  const membrosUnificados = useMemo(() => {
    const membros: MembroEquipeUnificado[] = [];

    // Adicionar operacionais
    operacionais.forEach(op => {
      // Verificar se existe profile com mesmo CPF ou email
      const profileCorrespondente = profiles.find(
        p => (p.cpf && op.cpf && p.cpf === op.cpf) || 
             (p.email && op.email && p.email.toLowerCase() === op.email.toLowerCase())
      );

      membros.push({
        id: op.id,
        nome: op.nome,
        email: op.email || '',
        telefone: op.telefone,
        cpf: op.cpf || null,
        avatar_url: op.foto || null,
        tipo_membro: profileCorrespondente ? 'ambos' : 'operacional',
        funcao_principal: op.funcao_principal,
        tipo_vinculo: op.tipo_vinculo,
        status: op.status,
        avaliacao: op.avaliacao,
        whatsapp: op.whatsapp,
        permissions: profileCorrespondente?.permissions,
        created_at: op.created_at,
        updated_at: op.updated_at,
      });
    });

    // Adicionar profiles que não estão em operacionais
    profiles.forEach(profile => {
      const jaAdicionado = membros.some(
        m => (m.cpf && profile.cpf && m.cpf === profile.cpf) ||
             (m.email && profile.email && m.email.toLowerCase() === profile.email.toLowerCase())
      );

      if (!jaAdicionado) {
        membros.push({
          id: profile.id,
          nome: profile.nome,
          email: profile.email,
          telefone: profile.telefone,
          cpf: profile.cpf,
          avatar_url: profile.avatar_url,
          tipo_membro: 'sistema',
          funcao_principal: 'Usuário do Sistema',
          permissions: profile.permissions,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        });
      }
    });

    return membros.sort((a, b) => a.nome.localeCompare(b.nome));
  }, [operacionais, profiles]);

  const value: EquipeContextType = {
    operacionais,
    totalCount,
    loading,
    error,
    refetch,
    membrosUnificados,
    loadingMembros: loading || loadingProfiles,
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
