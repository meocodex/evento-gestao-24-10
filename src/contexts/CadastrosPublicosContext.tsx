import { createContext, useContext, useState, ReactNode } from 'react';
import { CadastroEventoPublico, CadastroPublico, Evento } from '@/types/eventos';
import { useCadastrosQueries } from './cadastros/useCadastrosQueries';
import { useCadastrosMutations } from './cadastros/useCadastrosMutations';

interface CadastrosPublicosContextType {
  cadastros: CadastroPublico[];
  criarCadastro: (data: CadastroEventoPublico) => Promise<string>;
  aprovarCadastro: (cadastroId: string, criarEvento: (data: any) => Promise<Evento>) => Promise<Evento>;
  recusarCadastro: (cadastroId: string, motivo: string) => Promise<void>;
  buscarCadastroPorProtocolo: (protocolo: string) => CadastroPublico | undefined;
  atualizarStatus: (cadastroId: string, status: CadastroPublico['status']) => void;
}

const CadastrosPublicosContext = createContext<CadastrosPublicosContextType | undefined>(undefined);

export function CadastrosPublicosProvider({ children }: { children: ReactNode }) {
  // Hooks do Supabase
  const { cadastros } = useCadastrosQueries();
  const mutations = useCadastrosMutations();

  const criarCadastro = async (data: CadastroEventoPublico): Promise<string> => {
    return new Promise((resolve, reject) => {
      mutations.criarCadastro.mutate(data, {
        onSuccess: (protocolo) => resolve(protocolo),
        onError: (error) => reject(error),
      });
    });
  };

  const aprovarCadastro = async (
    cadastroId: string,
    criarEvento: (data: any) => Promise<Evento>
  ): Promise<Evento> => {
    const cadastro = cadastros.find(c => c.id === cadastroId);
    if (!cadastro) {
      throw new Error('Cadastro não encontrado');
    }

    // Criar evento a partir do cadastro
    const evento = await criarEvento({
      nome: cadastro.nome,
      dataInicio: cadastro.dataInicio,
      dataFim: cadastro.dataFim,
      horaInicio: cadastro.horaInicio,
      horaFim: cadastro.horaFim,
      local: cadastro.local,
      cidade: cadastro.cidade,
      estado: cadastro.estado,
      endereco: cadastro.endereco,
      tipoEvento: cadastro.tipoEvento,
      configuracaoIngresso: cadastro.configuracaoIngresso,
      configuracaoBar: cadastro.configuracaoBar,
    });

    // Aprovar cadastro
    mutations.aprovarCadastro.mutate({ cadastroId, eventoId: evento.id });

    return evento;
  };

  const recusarCadastro = async (cadastroId: string, motivo: string) => {
    return new Promise<void>((resolve, reject) => {
      mutations.recusarCadastro.mutate({ cadastroId, motivo }, {
        onSuccess: () => resolve(),
        onError: (error) => reject(error),
      });
    });
  };

  const buscarCadastroPorProtocolo = (protocolo: string): CadastroPublico | undefined => {
    return cadastros.find(c => c.protocolo === protocolo);
  };

  const atualizarStatus = (cadastroId: string, status: CadastroPublico['status']) => {
    // Esta função pode ser removida ou implementada se necessário
    console.log('atualizarStatus:', cadastroId, status);
  };

  return (
    <CadastrosPublicosContext.Provider
      value={{
        cadastros,
        criarCadastro,
        aprovarCadastro,
        recusarCadastro,
        buscarCadastroPorProtocolo,
        atualizarStatus,
      }}
    >
      {children}
    </CadastrosPublicosContext.Provider>
  );
}

export function useCadastrosPublicos() {
  const context = useContext(CadastrosPublicosContext);
  if (!context) {
    throw new Error('useCadastrosPublicos must be used within CadastrosPublicosProvider');
  }
  return context;
}
