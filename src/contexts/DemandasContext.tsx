import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Demanda, DemandaFormData, FiltroDemandas, Comentario, Anexo, StatusDemanda } from '@/types/demandas';
import { mockDemandas } from '@/lib/mock-data/demandas';
import { useToast } from '@/hooks/use-toast';

interface DemandasContextData {
  demandas: Demanda[];
  filtros: FiltroDemandas;
  setFiltros: (filtros: FiltroDemandas) => void;
  adicionarDemanda: (data: DemandaFormData, solicitante: string, solicitanteId: string) => void;
  editarDemanda: (id: string, data: Partial<DemandaFormData>) => void;
  excluirDemanda: (id: string) => void;
  alterarStatus: (id: string, novoStatus: StatusDemanda) => void;
  atribuirResponsavel: (id: string, responsavelId: string, responsavel: string) => void;
  adicionarComentario: (demandaId: string, comentario: Omit<Comentario, 'id' | 'dataHora'>) => void;
  adicionarAnexo: (demandaId: string, anexo: Omit<Anexo, 'id' | 'uploadEm'>) => void;
  removerAnexo: (demandaId: string, anexoId: string) => void;
  getEstatisticas: () => {
    total: number;
    abertas: number;
    emAndamento: number;
    concluidas: number;
    urgentes: number;
  };
  demandasFiltradas: Demanda[];
}

const DemandasContext = createContext<DemandasContextData>({} as DemandasContextData);

export const useDemandasContext = () => {
  const context = useContext(DemandasContext);
  if (!context) {
    throw new Error('useDemandasContext deve ser usado dentro de DemandasProvider');
  }
  return context;
};

export const DemandasProvider = ({ children }: { children: ReactNode }) => {
  const [demandas, setDemandas] = useState<Demanda[]>(mockDemandas);
  const [filtros, setFiltros] = useState<FiltroDemandas>({});
  const { toast } = useToast();

  const adicionarDemanda = (data: DemandaFormData, solicitante: string, solicitanteId: string) => {
    const novaDemanda: Demanda = {
      id: Date.now().toString(),
      ...data,
      status: 'aberta',
      solicitante,
      solicitanteId,
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
      comentarios: [],
      anexos: [],
    };

    setDemandas([novaDemanda, ...demandas]);
    toast({
      title: 'Demanda criada',
      description: 'A demanda foi criada com sucesso.',
    });
  };

  const editarDemanda = (id: string, data: Partial<DemandaFormData>) => {
    setDemandas(demandas.map(demanda => {
      if (demanda.id === id) {
        return {
          ...demanda,
          ...data,
          dataAtualizacao: new Date().toISOString(),
        };
      }
      return demanda;
    }));

    toast({
      title: 'Demanda atualizada',
      description: 'As alterações foram salvas com sucesso.',
    });
  };

  const excluirDemanda = (id: string) => {
    setDemandas(demandas.filter(d => d.id !== id));
    toast({
      title: 'Demanda excluída',
      description: 'A demanda foi removida com sucesso.',
    });
  };

  const alterarStatus = (id: string, novoStatus: StatusDemanda) => {
    setDemandas(demandas.map(demanda => {
      if (demanda.id === id) {
        const updated: Demanda = {
          ...demanda,
          status: novoStatus,
          dataAtualizacao: new Date().toISOString(),
        };
        
        if (novoStatus === 'concluida') {
          updated.dataConclusao = new Date().toISOString();
        }
        
        return updated;
      }
      return demanda;
    }));

    toast({
      title: 'Status atualizado',
      description: `A demanda foi marcada como "${novoStatus}".`,
    });
  };

  const atribuirResponsavel = (id: string, responsavelId: string, responsavel: string) => {
    setDemandas(demandas.map(demanda => {
      if (demanda.id === id) {
        return {
          ...demanda,
          responsavelId,
          responsavel,
          status: demanda.status === 'aberta' ? 'em-andamento' : demanda.status,
          dataAtualizacao: new Date().toISOString(),
        };
      }
      return demanda;
    }));

    toast({
      title: 'Responsável atribuído',
      description: `${responsavel} foi atribuído à demanda.`,
    });
  };

  const adicionarComentario = (demandaId: string, comentario: Omit<Comentario, 'id' | 'dataHora'>) => {
    setDemandas(demandas.map(demanda => {
      if (demanda.id === demandaId) {
        return {
          ...demanda,
          comentarios: [
            ...demanda.comentarios,
            {
              ...comentario,
              id: Date.now().toString(),
              dataHora: new Date().toISOString(),
            },
          ],
          dataAtualizacao: new Date().toISOString(),
        };
      }
      return demanda;
    }));

    toast({
      title: 'Comentário adicionado',
      description: 'Seu comentário foi publicado.',
    });
  };

  const adicionarAnexo = (demandaId: string, anexo: Omit<Anexo, 'id' | 'uploadEm'>) => {
    setDemandas(demandas.map(demanda => {
      if (demanda.id === demandaId) {
        return {
          ...demanda,
          anexos: [
            ...demanda.anexos,
            {
              ...anexo,
              id: Date.now().toString(),
              uploadEm: new Date().toISOString(),
            },
          ],
          dataAtualizacao: new Date().toISOString(),
        };
      }
      return demanda;
    }));

    toast({
      title: 'Anexo adicionado',
      description: 'O arquivo foi anexado com sucesso.',
    });
  };

  const removerAnexo = (demandaId: string, anexoId: string) => {
    setDemandas(demandas.map(demanda => {
      if (demanda.id === demandaId) {
        return {
          ...demanda,
          anexos: demanda.anexos.filter(a => a.id !== anexoId),
          dataAtualizacao: new Date().toISOString(),
        };
      }
      return demanda;
    }));

    toast({
      title: 'Anexo removido',
      description: 'O arquivo foi removido da demanda.',
    });
  };

  const getEstatisticas = () => {
    return {
      total: demandas.length,
      abertas: demandas.filter(d => d.status === 'aberta').length,
      emAndamento: demandas.filter(d => d.status === 'em-andamento').length,
      concluidas: demandas.filter(d => d.status === 'concluida').length,
      urgentes: demandas.filter(d => d.prioridade === 'urgente' && d.status !== 'concluida' && d.status !== 'cancelada').length,
    };
  };

  const demandasFiltradas = demandas.filter(demanda => {
    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase();
      if (!demanda.titulo.toLowerCase().includes(busca) &&
          !demanda.descricao.toLowerCase().includes(busca) &&
          !demanda.id.includes(busca)) {
        return false;
      }
    }

    if (filtros.status && filtros.status.length > 0) {
      if (!filtros.status.includes(demanda.status)) {
        return false;
      }
    }

    if (filtros.prioridade && filtros.prioridade.length > 0) {
      if (!filtros.prioridade.includes(demanda.prioridade)) {
        return false;
      }
    }

    if (filtros.categoria && filtros.categoria.length > 0) {
      if (!filtros.categoria.includes(demanda.categoria)) {
        return false;
      }
    }

    if (filtros.responsavel) {
      if (demanda.responsavelId !== filtros.responsavel) {
        return false;
      }
    }

    if (filtros.solicitante) {
      if (demanda.solicitanteId !== filtros.solicitante) {
        return false;
      }
    }

    return true;
  });

  return (
    <DemandasContext.Provider
      value={{
        demandas,
        filtros,
        setFiltros,
        adicionarDemanda,
        editarDemanda,
        excluirDemanda,
        alterarStatus,
        atribuirResponsavel,
        adicionarComentario,
        adicionarAnexo,
        removerAnexo,
        getEstatisticas,
        demandasFiltradas,
      }}
    >
      {children}
    </DemandasContext.Provider>
  );
};
