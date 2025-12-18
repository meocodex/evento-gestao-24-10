import { Demanda, CategoriaDemanda, PrioridadeDemanda, StatusDemanda, Comentario, Anexo, ItemReembolso, TipoReembolso } from '@/types/demandas';
import { 
  RawDemandaFromDB, 
  RawComentarioFromDB, 
  RawAnexoFromDB
} from '@/types/utils';

export function transformDemanda(data: RawDemandaFromDB): Demanda {
  return {
    id: data.id,
    numeroId: data.numero_id ?? 0,
    titulo: data.titulo,
    descricao: data.descricao,
    categoria: data.categoria as CategoriaDemanda,
    prioridade: data.prioridade as PrioridadeDemanda,
    status: data.status as StatusDemanda,
    solicitante: data.solicitante,
    solicitanteId: data.solicitante_id ?? '',
    responsavel: data.responsavel ?? undefined,
    responsavelId: data.responsavel_id ?? undefined,
    dataCriacao: data.created_at ?? '',
    dataAtualizacao: data.updated_at ?? '',
    dataConclusao: data.data_conclusao ?? undefined,
    prazo: data.prazo ?? undefined,
    eventoRelacionado: data.evento_id ?? undefined,
    eventoNome: data.evento_nome ?? undefined,
    resolvida: data.resolvida || false,
    podeResponder: data.status !== 'concluida' && data.status !== 'cancelada',
    tags: data.tags || [],
    arquivada: data.arquivada || false,
    comentarios: (data?.comentarios === null || data?.comentarios === undefined || !Array.isArray(data?.comentarios))
      ? []
      : data.comentarios.map((c: RawComentarioFromDB): Comentario => ({
          id: c.id,
          autor: c.autor,
          autorId: c.autor_id ?? '',
          conteudo: c.conteudo,
          dataHora: c.created_at ?? '',
          tipo: c.tipo as 'comentario' | 'resposta' | 'sistema',
        })),
    anexos: (data?.anexos === null || data?.anexos === undefined || !Array.isArray(data?.anexos))
      ? []
      : data.anexos.map((a: RawAnexoFromDB): Anexo => ({
          id: a.id,
          nome: a.nome,
          tipo: a.tipo,
          tamanho: a.tamanho,
          url: a.url,
          uploadPor: a.upload_por,
          uploadEm: a.created_at ?? '',
        })),
    dadosReembolso: data.dados_reembolso ? {
      itens: Array.isArray(data.dados_reembolso.itens)
        ? data.dados_reembolso.itens.map((item): ItemReembolso => ({
            id: (item as { id?: string }).id ?? crypto.randomUUID(),
            descricao: item.descricao,
            tipo: ((item as { tipo?: string }).tipo as TipoReembolso) ?? 'outros',
            valor: item.valor,
            anexos: Array.isArray(item.anexos)
              ? item.anexos.map((a): Anexo => ({
                  id: a.id,
                  nome: a.nome,
                  url: a.url,
                  tipo: a.tipo,
                  tamanho: a.tamanho,
                  uploadPor: '',
                  uploadEm: '',
                }))
              : [],
            observacoes: (item as { observacoes?: string }).observacoes,
          }))
        : [],
      valorTotal: data.dados_reembolso.valorTotal || 0,
      membroEquipeId: data.dados_reembolso.membroEquipeId ?? '',
      membroEquipeNome: data.dados_reembolso.membroEquipeNome ?? '',
      statusPagamento: (data.dados_reembolso.statusPagamento as 'pendente' | 'aprovado' | 'pago' | 'recusado') || 'pendente',
      formaPagamento: data.dados_reembolso.formaPagamento,
      dataPagamento: data.dados_reembolso.dataPagamento,
      comprovantePagamento: data.dados_reembolso.comprovantePagamento ? {
        id: crypto.randomUUID(),
        nome: 'Comprovante',
        url: data.dados_reembolso.comprovantePagamento,
        tipo: 'application/pdf',
        tamanho: 0,
        uploadPor: '',
        uploadEm: '',
      } : undefined,
      observacoesPagamento: data.dados_reembolso.observacoesPagamento,
    } : undefined,
  };
}
