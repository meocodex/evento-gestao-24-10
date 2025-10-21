import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { Demanda, DemandaFormData, FiltroDemandas, StatusDemanda, ItemReembolso } from '@/types/demandas';
import { useDemandasQueries } from './demandas/useDemandasQueries';
import { useDemandasMutations } from './demandas/useDemandasMutations';
import { useDemandasComentarios } from './demandas/useDemandasComentarios';
import { useDemandasAnexos } from './demandas/useDemandasAnexos';
import { useDemandasReembolsos } from './demandas/useDemandasReembolsos';

interface DemandasContextData {
  demandas: Demanda[];
  totalCount: number;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  filtros: FiltroDemandas;
  setFiltros: (filtros: FiltroDemandas) => void;
  adicionarDemanda: (data: DemandaFormData, solicitante: string, solicitanteId: string) => void;
  editarDemanda: (id: string, data: Partial<Demanda>) => void;
  excluirDemanda: (id: string) => void;
  alterarStatus: (id: string, novoStatus: StatusDemanda) => void;
  atribuirResponsavel: (demandaId: string, responsavelId: string, responsavelNome: string) => void;
  adicionarComentario: (demandaId: string, conteudo: string, autor: string, autorId: string) => void;
  adicionarAnexo: (demandaId: string, arquivo: File, uploadPor: string) => void;
  removerAnexo: (demandaId: string, anexoId: string, url: string) => void;
  marcarComoResolvida: (id: string) => void;
  reabrirDemanda: (id: string) => void;
  arquivarDemanda: (id: string) => void;
  desarquivarDemanda: (id: string) => void;
  getDemandasPorEvento: (eventoId: string) => Demanda[];
  getDemandasPorResponsavel: (responsavelId: string) => Demanda[];
  getDemandasPorSolicitante: (solicitanteId: string) => Demanda[];
  getEstatisticas: () => {
    total: number;
    abertas: number;
    emAndamento: number;
    concluidas: number;
    canceladas: number;
    urgentes: number;
    arquivadas: number;
    prazosVencidos: number;
  };
  getDemandasFiltradas: () => Demanda[];
  adicionarDemandaReembolso: (
    eventoId: string,
    eventoNome: string,
    membroEquipeId: string,
    membroEquipeNome: string,
    itens: ItemReembolso[],
    observacoes?: string
  ) => void;
  aprovarReembolso: (demandaId: string, formaPagamento: string, observacoes?: string) => void;
  marcarReembolsoPago: (demandaId: string, dataPagamento: string, observacoes?: string, comprovante?: string) => void;
  recusarReembolso: (demandaId: string, motivo: string) => void;
  getDemandasReembolsoPorEvento: (eventoId: string) => Demanda[];
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
  const [filtros, setFiltros] = useState<FiltroDemandas>({});
  
  // Hooks do Supabase
  const { demandas } = useDemandasQueries();
  const mutations = useDemandasMutations();
  const comentarios = useDemandasComentarios();
  const anexos = useDemandasAnexos();
  const reembolsos = useDemandasReembolsos();

  // Wrappers para manter a mesma interface
  const adicionarDemanda = (data: DemandaFormData, solicitante: string, solicitanteId: string) => {
    mutations.adicionarDemanda.mutate({ data, solicitante, solicitanteId });
  };

  const editarDemanda = (id: string, data: Partial<Demanda>) => {
    mutations.editarDemanda.mutate({ id, data: data as Partial<DemandaFormData> });
  };

  const excluirDemanda = (id: string) => {
    mutations.excluirDemanda.mutate(id);
  };

  const alterarStatus = (id: string, novoStatus: StatusDemanda) => {
    mutations.alterarStatus.mutate({ id, novoStatus });
  };

  const atribuirResponsavel = (demandaId: string, responsavelId: string, responsavelNome: string) => {
    mutations.atribuirResponsavel.mutate({ demandaId, responsavelId, responsavelNome });
  };

  const adicionarComentario = (demandaId: string, conteudo: string, autor: string, autorId: string) => {
    comentarios.adicionarComentario.mutate({ demandaId, conteudo, autor, autorId });
  };

  const adicionarAnexo = (demandaId: string, arquivo: File, uploadPor: string) => {
    anexos.adicionarAnexo.mutate({ demandaId, arquivo, uploadPor });
  };

  const removerAnexo = (demandaId: string, anexoId: string, url: string) => {
    anexos.removerAnexo.mutate({ demandaId, anexoId, url });
  };

  const marcarComoResolvida = (id: string) => {
    mutations.marcarComoResolvida.mutate(id);
  };

  const reabrirDemanda = (id: string) => {
    mutations.reabrirDemanda.mutate(id);
  };

  const arquivarDemanda = (id: string) => {
    mutations.arquivarDemanda.mutate(id);
  };

  const desarquivarDemanda = (id: string) => {
    mutations.desarquivarDemanda.mutate(id);
  };

  const adicionarDemandaReembolso = (
    eventoId: string,
    eventoNome: string,
    membroEquipeId: string,
    membroEquipeNome: string,
    itens: ItemReembolso[],
    observacoes?: string
  ) => {
    reembolsos.adicionarDemandaReembolso.mutate({
      eventoId,
      eventoNome,
      membroEquipeId,
      membroEquipeNome,
      itens,
      observacoes
    });
  };

  const aprovarReembolso = (demandaId: string, formaPagamento: string, observacoes?: string) => {
    reembolsos.aprovarReembolso.mutate({ demandaId, formaPagamento, observacoes });
  };

  const marcarReembolsoPago = (demandaId: string, dataPagamento: string, observacoes?: string, comprovante?: string) => {
    reembolsos.marcarReembolsoPago.mutate({ demandaId, dataPagamento, observacoes, comprovante });
  };

  const recusarReembolso = (demandaId: string, motivo: string) => {
    reembolsos.recusarReembolso.mutate({ demandaId, motivo });
  };

  // Funções de filtro e estatísticas (computadas)
  const getDemandasPorEvento = (eventoId: string) => {
    return demandas.filter(d => d.eventoRelacionado === eventoId);
  };

  const getDemandasPorResponsavel = (responsavelId: string) => {
    return demandas.filter(d => d.responsavelId === responsavelId);
  };

  const getDemandasPorSolicitante = (solicitanteId: string) => {
    return demandas.filter(d => d.solicitanteId === solicitanteId);
  };

  const getDemandasReembolsoPorEvento = (eventoId: string) => {
    return demandas.filter(d => d.eventoRelacionado === eventoId && d.categoria === 'reembolso');
  };

  const getEstatisticas = () => {
    const demandasAtivas = demandas.filter(d => !d.arquivada);
    const agora = new Date();
    
    return {
      total: demandasAtivas.length,
      abertas: demandasAtivas.filter(d => d.status === 'aberta').length,
      emAndamento: demandasAtivas.filter(d => d.status === 'em-andamento').length,
      concluidas: demandasAtivas.filter(d => d.status === 'concluida').length,
      canceladas: demandasAtivas.filter(d => d.status === 'cancelada').length,
      urgentes: demandasAtivas.filter(d => d.prioridade === 'urgente').length,
      arquivadas: demandas.filter(d => d.arquivada).length,
      prazosVencidos: demandasAtivas.filter(d => d.prazo && new Date(d.prazo) < agora && d.status !== 'concluida' && d.status !== 'cancelada').length,
    };
  };

  const getDemandasFiltradas = useMemo(() => {
    return () => {
      let resultado = [...demandas];

      if (!filtros.mostrarArquivadas) {
        resultado = resultado.filter(d => !d.arquivada);
      }

      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        resultado = resultado.filter(d =>
          d.titulo.toLowerCase().includes(busca) ||
          d.descricao.toLowerCase().includes(busca) ||
          d.id.includes(busca)
        );
      }

      if (filtros.status && filtros.status.length > 0) {
        resultado = resultado.filter(d => filtros.status!.includes(d.status));
      }

      if (filtros.prioridade && filtros.prioridade.length > 0) {
        resultado = resultado.filter(d => filtros.prioridade!.includes(d.prioridade));
      }

      if (filtros.categoria && filtros.categoria.length > 0) {
        resultado = resultado.filter(d => filtros.categoria!.includes(d.categoria));
      }

      if (filtros.responsavel) {
        resultado = resultado.filter(d => d.responsavelId === filtros.responsavel);
      }

      if (filtros.solicitante) {
        resultado = resultado.filter(d => d.solicitanteId === filtros.solicitante);
      }

      if (filtros.prazoVencido) {
        const agora = new Date();
        resultado = resultado.filter(d => 
          d.prazo && 
          new Date(d.prazo) < agora && 
          d.status !== 'concluida' && 
          d.status !== 'cancelada'
        );
      }

      if (filtros.prazoProximo) {
        const agora = new Date();
        const limite = new Date(agora);
        limite.setDate(limite.getDate() + 3);
        resultado = resultado.filter(d => 
          d.prazo && 
          new Date(d.prazo) >= agora && 
          new Date(d.prazo) <= limite &&
          d.status !== 'concluida' && 
          d.status !== 'cancelada'
        );
      }

      if (filtros.statusPagamento && filtros.statusPagamento.length > 0) {
        resultado = resultado.filter(d => 
          d.dadosReembolso && 
          filtros.statusPagamento!.includes(d.dadosReembolso.statusPagamento)
        );
      }

      if (filtros.tiposReembolso && filtros.tiposReembolso.length > 0) {
        resultado = resultado.filter(d => 
          d.dadosReembolso && 
          d.dadosReembolso.itens.some(item => filtros.tiposReembolso!.includes(item.tipo))
        );
      }

      if (filtros.eventoRelacionado) {
        resultado = resultado.filter(d => d.eventoRelacionado === filtros.eventoRelacionado);
      }

      return resultado;
    };
  }, [demandas, filtros]);

  return (
    <DemandasContext.Provider
      value={{
        demandas,
        totalCount,
        page,
        pageSize,
        setPage,
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
        marcarComoResolvida,
        reabrirDemanda,
        arquivarDemanda,
        desarquivarDemanda,
        getDemandasPorEvento,
        getDemandasPorResponsavel,
        getDemandasPorSolicitante,
        getEstatisticas,
        getDemandasFiltradas,
        adicionarDemandaReembolso,
        aprovarReembolso,
        marcarReembolsoPago,
        recusarReembolso,
        getDemandasReembolsoPorEvento
      }}
    >
      {children}
    </DemandasContext.Provider>
  );
};
