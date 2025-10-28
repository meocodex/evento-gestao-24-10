import { Demanda } from '@/types/demandas';

export function transformDemanda(data: any): Demanda {
  return {
    id: data.id,
    titulo: data.titulo,
    descricao: data.descricao,
    categoria: data.categoria,
    prioridade: data.prioridade,
    status: data.status,
    solicitante: data.solicitante,
    solicitanteId: data.solicitante_id,
    responsavel: data.responsavel,
    responsavelId: data.responsavel_id,
    dataCriacao: data.created_at,
    dataAtualizacao: data.updated_at,
    dataConclusao: data.data_conclusao,
    prazo: data.prazo,
    eventoRelacionado: data.evento_id,
    eventoNome: data.evento_nome,
    resolvida: data.resolvida || false,
    podeResponder: data.status !== 'concluida' && data.status !== 'cancelada',
    tags: data.tags || [],
    arquivada: data.arquivada || false,
    comentarios: Array.isArray(data.comentarios) 
      ? data.comentarios.map((c: any) => ({
          id: c.id,
          autor: c.autor,
          autorId: c.autor_id,
          conteudo: c.conteudo,
          dataHora: c.created_at,
          tipo: c.tipo,
        }))
      : [],
    anexos: Array.isArray(data.anexos)
      ? data.anexos.map((a: any) => ({
          id: a.id,
          nome: a.nome,
          tipo: a.tipo,
          tamanho: a.tamanho,
          url: a.url,
          uploadPor: a.upload_por,
          uploadEm: a.created_at,
        }))
      : [],
    dadosReembolso: data.dados_reembolso ? {
      itens: Array.isArray(data.dados_reembolso.itens)
        ? data.dados_reembolso.itens.map((item: any) => ({
            ...item,
            anexos: Array.isArray(item.anexos)
              ? item.anexos.map((a: any) => ({
                  id: a.id,
                  nome: a.nome,
                  url: a.url,
                  tipo: a.tipo,
                  tamanho: a.tamanho,
                }))
              : [],
          }))
        : [],
      valorTotal: data.dados_reembolso.valorTotal || 0,
      membroEquipeId: data.dados_reembolso.membroEquipeId,
      membroEquipeNome: data.dados_reembolso.membroEquipeNome,
      statusPagamento: data.dados_reembolso.statusPagamento || 'pendente',
      formaPagamento: data.dados_reembolso.formaPagamento,
      dataPagamento: data.dados_reembolso.dataPagamento,
      comprovantePagamento: data.dados_reembolso.comprovantePagamento,
      observacoesPagamento: data.dados_reembolso.observacoesPagamento,
    } : undefined,
  };
}
