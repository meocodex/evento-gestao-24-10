/**
 * Helpers temporários para facilitar migração
 * TODO: Remover após migração completa
 */
import * as React from 'react';
import { 
  useDemandasQueries, 
  useDemandasMutations, 
  useDemandasComentarios, 
  useDemandasAnexos, 
  useDemandasReembolsos 
} from './index';

export function useDemandasContext() {
  const [page] = React.useState(1);
  const [filtros, setFiltros] = React.useState<any>({});
  const { demandas = [], totalCount = 0 } = useDemandasQueries(page, 20);
  const mutations = useDemandasMutations();
  const comentarios = useDemandasComentarios();
  const anexos = useDemandasAnexos();
  const reembolsos = useDemandasReembolsos();

  return {
    demandas,
    totalCount,
    page: 1,
    pageSize: 20,
    setPage: () => {},
    filtros,
    setFiltros,
    getDemandasFiltradas: () => demandas,
    getDemandasPorEvento: (eventoId: string) => demandas.filter((d: any) => d.eventoId === eventoId),
    getDemandasPorResponsavel: (responsavelId: string) => demandas.filter((d: any) => d.responsavelId === responsavelId),
    getDemandasPorSolicitante: (solicitanteId: string) => demandas.filter((d: any) => d.solicitanteId === solicitanteId),
    getDemandasReembolsoPorEvento: (eventoId: string) => demandas.filter((d: any) => d.eventoId === eventoId && d.tipo === 'reembolso'),
    getEstatisticas: () => ({
      total: demandas.length,
      abertas: demandas.filter((d: any) => d.status === 'aberta').length,
      emAndamento: demandas.filter((d: any) => d.status === 'em-andamento').length,
      concluidas: demandas.filter((d: any) => d.status === 'concluida').length,
      canceladas: demandas.filter((d: any) => d.status === 'cancelada').length,
      urgentes: demandas.filter((d: any) => d.prioridade === 'urgente').length,
      arquivadas: demandas.filter((d: any) => d.arquivada).length,
      prazosVencidos: demandas.filter((d: any) => d.prazo && new Date(d.prazo) < new Date() && d.status !== 'concluida').length,
    }),
    adicionarDemanda: (data: any) => mutations.adicionarDemanda.mutateAsync(data),
    criarDemanda: (data: any) => mutations.adicionarDemanda.mutateAsync(data),
    editarDemanda: (id: string, data: any) => mutations.editarDemanda.mutateAsync({ id, data }),
    excluirDemanda: (id: string) => mutations.excluirDemanda.mutateAsync(id),
    alterarStatus: (id: string, novoStatus: any) => mutations.alterarStatus.mutateAsync({ id, novoStatus }),
    atribuirResponsavel: (demandaId: string, responsavelId: string, responsavelNome: string) => 
      mutations.atribuirResponsavel.mutateAsync({ demandaId, responsavelId, responsavelNome }),
    marcarComoResolvida: (id: string) => mutations.marcarComoResolvida.mutateAsync(id),
    reabrirDemanda: (id: string) => mutations.reabrirDemanda.mutateAsync(id),
    arquivarDemanda: (id: string) => mutations.arquivarDemanda.mutateAsync(id),
    desarquivarDemanda: (id: string) => mutations.desarquivarDemanda.mutateAsync(id),
    adicionarComentario: comentarios.adicionarComentario,
    adicionarAnexo: anexos.adicionarAnexo,
    removerAnexo: (demandaId: string, anexoId: string, url: string) => anexos.removerAnexo.mutateAsync({ demandaId, anexoId, url }),
    excluirAnexo: (demandaId: string, anexoId: string, url: string) => anexos.removerAnexo.mutateAsync({ demandaId, anexoId, url }),
    adicionarDemandaReembolso: (data: any) => reembolsos.adicionarDemandaReembolso.mutateAsync(data),
    criarReembolso: (data: any) => reembolsos.adicionarDemandaReembolso.mutateAsync(data),
    aprovarReembolso: (demandaId: string, formaPagamento: string, observacoes?: string) => 
      reembolsos.aprovarReembolso.mutateAsync({ demandaId, formaPagamento, observacoes }),
    recusarReembolso: (demandaId: string, motivo: string) => 
      reembolsos.recusarReembolso.mutateAsync({ demandaId, motivo }),
    marcarPago: (demandaId: string, dataPagamento: string, comprovante?: string, observacoes?: string) => 
      reembolsos.marcarReembolsoPago.mutateAsync({ demandaId, dataPagamento, comprovante, observacoes }),
    marcarReembolsoPago: (demandaId: string, dataPagamento: string, comprovante?: string, observacoes?: string) => 
      reembolsos.marcarReembolsoPago.mutateAsync({ demandaId, dataPagamento, comprovante, observacoes }),
  };
}
