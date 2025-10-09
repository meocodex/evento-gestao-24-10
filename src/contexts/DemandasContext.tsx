import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Demanda, DemandaFormData, FiltroDemandas, Comentario, Anexo, StatusDemanda, ItemReembolso, TipoReembolso } from '@/types/demandas';
import { mockDemandas } from '@/lib/mock-data/demandas';
import { useToast } from '@/hooks/use-toast';

interface DemandasContextData {
  demandas: Demanda[];
  filtros: FiltroDemandas;
  setFiltros: (filtros: FiltroDemandas) => void;
  adicionarDemanda: (data: DemandaFormData, solicitante: string, solicitanteId: string) => void;
  editarDemanda: (id: string, data: Partial<Demanda>) => void;
  excluirDemanda: (id: string) => void;
  alterarStatus: (id: string, novoStatus: StatusDemanda) => void;
  atribuirResponsavel: (demandaId: string, responsavelId: string, responsavelNome: string) => void;
  adicionarComentario: (demandaId: string, conteudo: string, autor: string, autorId: string) => void;
  adicionarAnexo: (demandaId: string, anexo: Omit<Anexo, 'id' | 'uploadPor' | 'uploadEm'>) => void;
  removerAnexo: (demandaId: string, anexoId: string) => void;
  marcarComoResolvida: (id: string) => void;
  reabrirDemanda: (id: string) => void;
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

// Este é um wrapper que permite usar hooks do EventosContext
let vincularReembolsoCallback: ((eventoId: string, demandaId: string, descricao: string, valor: number, membroNome: string) => void) | null = null;

export function setVincularReembolsoCallback(callback: (eventoId: string, demandaId: string, descricao: string, valor: number, membroNome: string) => void) {
  vincularReembolsoCallback = callback;
}

export const DemandasProvider = ({ children }: { children: ReactNode }) => {
  const [demandas, setDemandas] = useState<Demanda[]>(mockDemandas);
  const [filtros, setFiltros] = useState<FiltroDemandas>({});
  const { toast } = useToast();

  const adicionarDemanda = (data: DemandaFormData, solicitante: string, solicitanteId: string) => {
    const novaDemanda: Demanda = {
      id: Date.now().toString(),
      ...data,
      solicitante,
      solicitanteId,
      status: 'aberta',
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
      resolvida: false,
      podeResponder: true,
      comentarios: [],
      anexos: [],
    };

    setDemandas([...demandas, novaDemanda]);

    toast({
      title: 'Demanda criada!',
      description: 'A demanda foi criada com sucesso.',
    });
  };

  const editarDemanda = (id: string, data: Partial<Demanda>) => {
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
      title: 'Demanda atualizada!',
      description: 'As alterações foram salvas.',
    });
  };

  const excluirDemanda = (id: string) => {
    setDemandas(demandas.filter(demanda => demanda.id !== id));

    toast({
      title: 'Demanda excluída!',
      description: 'A demanda foi removida.',
    });
  };

  const alterarStatus = (id: string, novoStatus: StatusDemanda) => {
    setDemandas(demandas.map(demanda => {
      if (demanda.id === id) {
        return {
          ...demanda,
          status: novoStatus,
          dataAtualizacao: new Date().toISOString(),
          dataConclusao: novoStatus === 'concluida' || novoStatus === 'cancelada' ? new Date().toISOString() : demanda.dataConclusao,
        };
      }
      return demanda;
    }));

    toast({
      title: 'Status atualizado!',
      description: `Demanda marcada como ${novoStatus}.`,
    });
  };

  const atribuirResponsavel = (demandaId: string, responsavelId: string, responsavelNome: string) => {
    setDemandas(demandas.map(demanda => {
      if (demanda.id === demandaId) {
        return {
          ...demanda,
          responsavelId,
          responsavel: responsavelNome,
          status: 'em-andamento',
          dataAtualizacao: new Date().toISOString(),
        };
      }
      return demanda;
    }));

    toast({
      title: 'Responsável atribuído!',
      description: `${responsavelNome} foi atribuído à demanda.`,
    });
  };

  const adicionarComentario = (demandaId: string, conteudo: string, autor: string, autorId: string) => {
    const novoComentario: Comentario = {
      id: Date.now().toString(),
      autor,
      autorId,
      conteudo,
      dataHora: new Date().toISOString(),
      tipo: 'comentario',
    };

    setDemandas(demandas.map(demanda => {
      if (demanda.id === demandaId) {
        return {
          ...demanda,
          comentarios: [...demanda.comentarios, novoComentario],
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

  const adicionarAnexo = (demandaId: string, anexo: Omit<Anexo, 'id' | 'uploadPor' | 'uploadEm'>) => {
    const novoAnexo: Anexo = {
      ...anexo,
      id: Date.now().toString(),
      uploadPor: 'Usuário Atual',
      uploadEm: new Date().toISOString(),
    };

    setDemandas(demandas.map(demanda => {
      if (demanda.id === demandaId) {
        return {
          ...demanda,
          anexos: [...demanda.anexos, novoAnexo],
          dataAtualizacao: new Date().toISOString(),
        };
      }
      return demanda;
    }));

    toast({
      title: 'Anexo adicionado',
      description: 'O arquivo foi anexado à demanda.',
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

  const marcarComoResolvida = (id: string) => {
    setDemandas(demandas.map(demanda => {
      if (demanda.id === id) {
        return {
          ...demanda,
          resolvida: true,
          comentarios: [
            ...demanda.comentarios,
            {
              id: Date.now().toString(),
              autor: 'Sistema',
              autorId: 'sistema',
              conteudo: 'Demanda marcada como resolvida',
              dataHora: new Date().toISOString(),
              tipo: 'sistema' as const,
            },
          ],
          dataAtualizacao: new Date().toISOString(),
        };
      }
      return demanda;
    }));

    toast({
      title: 'Demanda resolvida',
      description: 'A demanda foi marcada como resolvida.',
    });
  };

  const reabrirDemanda = (id: string) => {
    setDemandas(demandas.map(demanda => {
      if (demanda.id === id) {
        return {
          ...demanda,
          resolvida: false,
          podeResponder: true,
          status: 'em-andamento' as const,
          comentarios: [
            ...demanda.comentarios,
            {
              id: Date.now().toString(),
              autor: 'Sistema',
              autorId: 'sistema',
              conteudo: 'Demanda reaberta',
              dataHora: new Date().toISOString(),
              tipo: 'sistema' as const,
            },
          ],
          dataAtualizacao: new Date().toISOString(),
        };
      }
      return demanda;
    }));

    toast({
      title: 'Demanda reaberta',
      description: 'A demanda foi reaberta para novas interações.',
    });
  };

  const getDemandasPorEvento = (eventoId: string) => {
    return demandas.filter(d => d.eventoRelacionado === eventoId);
  };

  const getDemandasPorResponsavel = (responsavelId: string) => {
    return demandas.filter(d => d.responsavelId === responsavelId);
  };

  const getDemandasPorSolicitante = (solicitanteId: string) => {
    return demandas.filter(d => d.solicitanteId === solicitanteId);
  };

  const getEstatisticas = () => {
    return {
      total: demandas.length,
      abertas: demandas.filter(d => d.status === 'aberta').length,
      emAndamento: demandas.filter(d => d.status === 'em-andamento').length,
      concluidas: demandas.filter(d => d.status === 'concluida').length,
      canceladas: demandas.filter(d => d.status === 'cancelada').length,
      urgentes: demandas.filter(d => d.prioridade === 'urgente').length,
    };
  };

  const getDemandasFiltradas = () => {
    let resultado = [...demandas];

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

    return resultado;
  };

  const adicionarDemandaReembolso = (
    eventoId: string,
    eventoNome: string,
    membroEquipeId: string,
    membroEquipeNome: string,
    itens: ItemReembolso[],
    observacoes?: string
  ) => {
    const valorTotal = itens.reduce((sum, item) => sum + item.valor, 0);

    const novaDemanda: Demanda = {
      id: `reembolso-${Date.now()}`,
      titulo: `Reembolso - ${membroEquipeNome} - ${new Date().toLocaleDateString('pt-BR')}`,
      descricao: observacoes || `Solicitação de reembolso de ${itens.length} item(ns)`,
      categoria: 'reembolso',
      prioridade: 'media',
      status: 'aberta',
      solicitante: membroEquipeNome,
      solicitanteId: membroEquipeId,
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
      resolvida: false,
      podeResponder: true,
      comentarios: [],
      anexos: [],
      eventoRelacionado: eventoId,
      eventoNome: eventoNome,
      tags: ['reembolso', eventoNome],
      dadosReembolso: {
        itens,
        valorTotal,
        membroEquipeId,
        membroEquipeNome,
        statusPagamento: 'pendente'
      }
    };

    setDemandas([...demandas, novaDemanda]);

    toast({
      title: 'Solicitação de reembolso criada!',
      description: `Valor total: R$ ${valorTotal.toFixed(2)}`,
    });
  };

  const aprovarReembolso = (demandaId: string, formaPagamento: string, observacoes?: string) => {
    setDemandas(demandas.map(demanda => {
      if (demanda.id === demandaId && demanda.dadosReembolso) {
        return {
          ...demanda,
          dadosReembolso: {
            ...demanda.dadosReembolso,
            statusPagamento: 'aprovado',
            formaPagamento,
            observacoesPagamento: observacoes
          },
          status: 'em-andamento',
          dataAtualizacao: new Date().toISOString()
        };
      }
      return demanda;
    }));

    toast({
      title: 'Reembolso aprovado!',
      description: 'A solicitação foi aprovada e aguarda pagamento.'
    });
  };

  const marcarReembolsoPago = (demandaId: string, dataPagamento: string, observacoes?: string, comprovante?: string) => {
    const demanda = demandas.find(d => d.id === demandaId);
    
    if (!demanda || !demanda.dadosReembolso || !demanda.eventoRelacionado) {
      toast({
        title: 'Erro',
        description: 'Demanda ou reembolso não encontrado.',
        variant: 'destructive'
      });
      return;
    }

    setDemandas(demandas.map(d => {
      if (d.id === demandaId && d.dadosReembolso) {
        const comprovanteAnexo: Anexo | undefined = comprovante ? {
          id: `anexo-pag-${Date.now()}`,
          nome: comprovante,
          url: `/uploads/${comprovante}`,
          tipo: 'application/pdf',
          tamanho: 1024,
          uploadPor: 'Admin',
          uploadEm: new Date().toISOString()
        } : undefined;

        return {
          ...d,
          dadosReembolso: {
            ...d.dadosReembolso,
            statusPagamento: 'pago',
            dataPagamento,
            comprovantePagamento: comprovanteAnexo,
            observacoesPagamento: observacoes || d.dadosReembolso.observacoesPagamento
          },
          resolvida: true,
          status: 'concluida',
          dataConclusao: new Date().toISOString(),
          dataAtualizacao: new Date().toISOString()
        };
      }
      return d;
    }));

    // Vincular ao financeiro do evento usando callback
    if (vincularReembolsoCallback) {
      vincularReembolsoCallback(
        demanda.eventoRelacionado,
        demandaId,
        demanda.titulo,
        demanda.dadosReembolso.valorTotal,
        demanda.dadosReembolso.membroEquipeNome
      );
    }

    toast({
      title: 'Reembolso marcado como pago!',
      description: 'A demanda foi finalizada e vinculada ao financeiro do evento.'
    });
  };

  const recusarReembolso = (demandaId: string, motivo: string) => {
    setDemandas(demandas.map(demanda => {
      if (demanda.id === demandaId && demanda.dadosReembolso) {
        return {
          ...demanda,
          dadosReembolso: {
            ...demanda.dadosReembolso,
            statusPagamento: 'recusado',
            observacoesPagamento: motivo
          },
          status: 'cancelada',
          resolvida: true,
          dataConclusao: new Date().toISOString(),
          dataAtualizacao: new Date().toISOString()
        };
      }
      return demanda;
    }));

    toast({
      title: 'Reembolso recusado',
      description: 'A solicitação foi recusada.'
    });
  };

  const getDemandasReembolsoPorEvento = (eventoId: string) => {
    return demandas.filter(d => d.eventoRelacionado === eventoId && d.categoria === 'reembolso');
  };

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
        marcarComoResolvida,
        reabrirDemanda,
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
