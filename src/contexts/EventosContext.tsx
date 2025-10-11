import React, { createContext, useContext, ReactNode } from 'react';
import { Evento, EventoFormData, MaterialChecklist, MaterialAntecipado, MaterialComTecnicos, Receita, Despesa, MembroEquipe, StatusEvento, TipoReceita, StatusFinanceiro } from '@/types/eventos';
import { materiaisEstoque } from '@/lib/mock-data/estoque';
import { useToast } from '@/hooks/use-toast';
import { useEventosQueries } from './eventos/useEventosQueries';
import { useEventosMutations } from './eventos/useEventosMutations';

interface EventosContextType {
  eventos: Evento[];
  criarEvento: (data: EventoFormData) => Promise<Evento>;
  editarEvento: (id: string, data: Partial<Evento>) => Promise<void>;
  deletarEvento: (id: string) => Promise<void>;
  alterarStatus: (id: string, novoStatus: StatusEvento, observacao?: string) => Promise<void>;
  adicionarMaterialChecklist: (eventoId: string, material: Omit<MaterialChecklist, 'id' | 'alocado'>) => Promise<void>;
  removerMaterialChecklist: (eventoId: string, materialId: string) => Promise<void>;
  alocarMaterial: (eventoId: string, tipo: 'antecipado' | 'comTecnicos', material: Omit<MaterialAntecipado | MaterialComTecnicos, 'id'>) => Promise<void>;
  removerMaterialAlocado: (eventoId: string, tipo: 'antecipado' | 'comTecnicos', materialId: string) => Promise<void>;
  adicionarReceita: (eventoId: string, receita: Omit<Receita, 'id'>) => Promise<void>;
  removerReceita: (eventoId: string, receitaId: string) => Promise<void>;
  adicionarDespesa: (eventoId: string, despesa: Omit<Despesa, 'id'>) => Promise<void>;
  editarDespesa: (eventoId: string, despesaId: string, data: Partial<Despesa>) => Promise<void>;
  removerDespesa: (eventoId: string, despesaId: string) => Promise<void>;
  adicionarMembroEquipe: (eventoId: string, membro: Omit<MembroEquipe, 'id'>) => Promise<void>;
  removerMembroEquipe: (eventoId: string, membroId: string) => Promise<void>;
  adicionarObservacaoOperacional: (eventoId: string, observacao: string) => Promise<void>;
  uploadArquivo: (eventoId: string, tipo: 'plantaBaixa' | 'documentos' | 'fotosEvento', arquivo: File) => Promise<string>;
  vincularReembolsoADespesa: (eventoId: string, demandaId: string, descricao: string, valor: number, membroNome: string) => Promise<void>;
  criarEventoDeProposta: (contratoId: string, dadosEvento: any) => string;
  adicionarReceitasDeItens: (eventoId: string, itens: any[]) => void;
}

const EventosContext = createContext<EventosContextType | undefined>(undefined);

export function EventosProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Usar hooks do Supabase
  const { eventos, loading, refetch } = useEventosQueries();
  const { criarEvento, editarEvento, excluirEvento, alterarStatus } = useEventosMutations();

  // Funções CRUD principais agora usam os hooks do Supabase
  // criarEvento, editarEvento, excluirEvento (deletarEvento), alterarStatus já vêm dos hooks
  
  const deletarEvento = excluirEvento; // Alias para manter compatibilidade

  const adicionarMaterialChecklist = async (eventoId: string, material: Omit<MaterialChecklist, 'id' | 'alocado'>): Promise<void> => {
    // TODO: Implementar com Supabase
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade será implementada em breve.'
    });
  };

  const removerMaterialChecklist = async (eventoId: string, materialId: string): Promise<void> => {
    // TODO: Implementar com Supabase
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade será implementada em breve.'
    });
  };

  const alocarMaterial = async (eventoId: string, tipo: 'antecipado' | 'comTecnicos', material: any): Promise<void> => {
    // TODO: Implementar com Supabase
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade será implementada em breve.'
    });
  };

  const removerMaterialAlocado = async (eventoId: string, tipo: 'antecipado' | 'comTecnicos', materialId: string): Promise<void> => {
    // TODO: Implementar com Supabase
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade será implementada em breve.'
    });
  };

  const adicionarReceita = async (eventoId: string, receita: Omit<Receita, 'id'>): Promise<void> => {
    // TODO: Implementar com Supabase
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade será implementada em breve.'
    });
  };

  const removerReceita = async (eventoId: string, receitaId: string): Promise<void> => {
    // TODO: Implementar com Supabase
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade será implementada em breve.'
    });
  };

  const adicionarDespesa = async (eventoId: string, despesa: Omit<Despesa, 'id'>): Promise<void> => {
    // TODO: Implementar com Supabase
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade será implementada em breve.'
    });
  };

  const editarDespesa = async (eventoId: string, despesaId: string, data: Partial<Despesa>): Promise<void> => {
    // TODO: Implementar com Supabase
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade será implementada em breve.'
    });
  };

  const removerDespesa = async (eventoId: string, despesaId: string): Promise<void> => {
    // TODO: Implementar com Supabase
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade será implementada em breve.'
    });
  };

  const adicionarMembroEquipe = async (eventoId: string, membro: Omit<MembroEquipe, 'id'>): Promise<void> => {
    // TODO: Implementar com Supabase
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade será implementada em breve.'
    });
  };

  const removerMembroEquipe = async (eventoId: string, membroId: string): Promise<void> => {
    // TODO: Implementar com Supabase
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade será implementada em breve.'
    });
  };

  const adicionarObservacaoOperacional = async (eventoId: string, observacao: string): Promise<void> => {
    // TODO: Implementar com Supabase
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade será implementada em breve.'
    });
  };

  const uploadArquivo = async (eventoId: string, tipo: 'plantaBaixa' | 'documentos' | 'fotosEvento', arquivo: File): Promise<string> => {
    // TODO: Implementar com Supabase Storage
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade será implementada em breve.'
    });
    return '';
  };

  const vincularReembolsoADespesa = async (eventoId: string, demandaId: string, descricao: string, valor: number, membroNome: string): Promise<void> => {
    // TODO: Implementar com Supabase
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade será implementada em breve.'
    });
  };

  const criarEventoDeProposta = (contratoId: string, dadosEvento: any): string => {
    // TODO: Implementar com Supabase
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade será implementada em breve.'
    });
    return '';
  };

  const adicionarReceitasDeItens = (eventoId: string, itens: any[]) => {
    // TODO: Implementar com Supabase
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade será implementada em breve.'
    });
  };

  return (
    <EventosContext.Provider value={{
      eventos,
      criarEvento,
      editarEvento,
      deletarEvento,
      alterarStatus,
      adicionarMaterialChecklist,
      removerMaterialChecklist,
      alocarMaterial,
      removerMaterialAlocado,
      adicionarReceita,
      removerReceita,
      adicionarDespesa,
      editarDespesa,
      removerDespesa,
      adicionarMembroEquipe,
      removerMembroEquipe,
      adicionarObservacaoOperacional,
      uploadArquivo,
      vincularReembolsoADespesa,
      criarEventoDeProposta,
      adicionarReceitasDeItens
    }}>
      {children}
    </EventosContext.Provider>
  );
}

export function useEventos() {
  const context = useContext(EventosContext);
  if (!context) {
    throw new Error('useEventos must be used within EventosProvider');
  }
  return context;
}
