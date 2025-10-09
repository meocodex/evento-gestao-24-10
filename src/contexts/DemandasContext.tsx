import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Demanda, DemandaFormData, FiltroDemandas, Comentario, Anexo, StatusDemanda, ItemReembolso } from '@/types/demandas';
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
  marcarComoResolvida: (id: string) => void;
  reabrirDemanda: (id: string) => void;
  getDemandasPorEvento: (eventoId: string) => Demanda[];
  adicionarDemandaReembolso: (data: {
    eventoId: string;
    descricao?: string;
    itens: ItemReembolso[];
    membroEquipeId: string;
    membroEquipeNome: string;
  }) => Promise<void>;
  aprovarReembolso: (demandaId: string, formaPagamento: string, observacoes?: string) => void;
  marcarReembolsoPago: (demandaId: string, dataPagamento: string, comprovante?: string, observacoes?: string) => void;
  recusarReembolso: (demandaId: string, motivo: string) => void;
  getDemandasReembolsoPorEvento: (eventoId: string) => Demanda[];
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
      resolvida: false,
      podeResponder: true,
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
        // Se tentar marcar como concluída, precisa estar resolvida
        if (novoStatus === 'concluida' && !demanda.resolvida) {
          toast({
            title: 'Ação bloqueada',
            description: 'A demanda precisa ser marcada como resolvida antes de ser concluída.',
            variant: 'destructive',
          });
          return demanda;
        }

        // Atualizar podeResponder baseado no novo status
        const podeResponder = novoStatus !== 'concluida' && novoStatus !== 'cancelada';

        const updated: Demanda = {
          ...demanda,
          status: novoStatus,
          podeResponder,
          dataAtualizacao: new Date().toISOString(),
        };
        
        if (novoStatus === 'concluida' || novoStatus === 'cancelada') {
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
        // Verificar se pode responder
        if (!demanda.podeResponder && comentario.tipo !== 'sistema') {
          toast({
            title: 'Ação bloqueada',
            description: 'Não é possível adicionar comentários em uma demanda finalizada.',
            variant: 'destructive',
          });
          return demanda;
        }

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

    if (comentario.tipo !== 'sistema') {
      toast({
        title: comentario.tipo === 'resposta' ? 'Resposta enviada' : 'Comentário adicionado',
        description: comentario.tipo === 'resposta' ? 'Sua resposta foi enviada com sucesso.' : 'Seu comentário foi publicado.',
      });
    }
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
      description: 'A demanda foi reaberta para novas respostas.',
    });
  };

  const getDemandasPorEvento = (eventoId: string): Demanda[] => {
    return demandas.filter(d => d.eventoRelacionado === eventoId);
  };

  const adicionarDemandaReembolso = async (data: {
    eventoId: string;
    descricao?: string;
    itens: ItemReembolso[];
    membroEquipeId: string;
    membroEquipeNome: string;
  }) => {
    const eventoNome = data.eventoId; // Idealmente buscar do contexto de eventos
    
    const valorTotal = data.itens.reduce((sum, item) => sum + item.valor, 0);
    
    const novaDemanda: Demanda = {
      id: `demanda-${Date.now()}`,
      titulo: `Reembolso - ${data.membroEquipeNome} - ${new Date().toLocaleDateString('pt-BR')}`,
      descricao: data.descricao || `Solicitação de reembolso com ${data.itens.length} item(ns)`,
      categoria: 'reembolso',
      prioridade: 'media',
      status: 'aberta',
      solicitante: data.membroEquipeNome,
      solicitanteId: data.membroEquipeId,
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
      comentarios: [],
      anexos: [],
      eventoRelacionado: data.eventoId,
      eventoNome: eventoNome,
      resolvida: false,
      podeResponder: true,
      tags: ['reembolso'],
      dadosReembolso: {
        itens: data.itens,
        valorTotal,
        membroEquipeId: data.membroEquipeId,
        membroEquipeNome: data.membroEquipeNome,
        statusPagamento: 'pendente'
      }
    };

    setDemandas([...demandas, novaDemanda]);
    
    toast({
      title: 'Reembolso criado!',
      description: `Solicitação de reembolso no valor de R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} foi criada.`
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
          dataAtualizacao: new Date().toISOString()
        };
      }
      return demanda;
    }));

    toast({
      title: 'Reembolso aprovado!',
      description: 'A solicitação foi aprovada e está aguardando pagamento.'
    });
  };

  const marcarReembolsoPago = (demandaId: string, dataPagamento: string, comprovante?: string, observacoes?: string) => {
    setDemandas(demandas.map(demanda => {
      if (demanda.id === demandaId && demanda.dadosReembolso) {
        const comprovanteAnexo = comprovante ? {
          id: `anexo-pag-${Date.now()}`,
          nome: comprovante,
          url: `/uploads/${comprovante}`,
          tipo: 'application/pdf',
          tamanho: 1024,
          uploadPor: 'Admin',
          uploadEm: new Date().toISOString()
        } : undefined;

        return {
          ...demanda,
          dadosReembolso: {
            ...demanda.dadosReembolso,
            statusPagamento: 'pago',
            dataPagamento,
            comprovantePagamento: comprovanteAnexo,
            observacoesPagamento: observacoes || demanda.dadosReembolso.observacoesPagamento
          },
          resolvida: true,
          status: 'concluida',
          dataConclusao: new Date().toISOString(),
          dataAtualizacao: new Date().toISOString()
        };
      }
      return demanda;
    }));

    toast({
      title: 'Reembolso marcado como pago!',
      description: 'A demanda foi finalizada e o pagamento foi registrado.'
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
      description: 'A solicitação foi recusada e o solicitante foi notificado.',
      variant: 'destructive'
    });
  };

  const getDemandasReembolsoPorEvento = (eventoId: string): Demanda[] => {
    return demandas.filter(d => d.eventoRelacionado === eventoId && d.categoria === 'reembolso');
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
        adicionarDemandaReembolso,
        aprovarReembolso,
        marcarReembolsoPago,
        recusarReembolso,
        getDemandasReembolsoPorEvento,
        marcarComoResolvida,
        reabrirDemanda,
        getDemandasPorEvento,
        getEstatisticas,
        demandasFiltradas,
      }}
    >
      {children}
    </DemandasContext.Provider>
  );
};
