import { Contrato, ContratoTemplate, StatusContrato } from '@/types/contratos';
import { TemplateDB, ContratoDB } from '@/types/utils';

type TipoContrato = 'evento' | 'fornecedor' | 'cliente' | 'outros';

export function transformTemplate(data: TemplateDB): ContratoTemplate {
  return {
    id: data.id,
    nome: data.nome,
    tipo: data.tipo as TipoContrato,
    descricao: data.descricao || '',
    conteudo: data.conteudo,
    variaveis: data.variaveis || [],
    status: data.status as 'ativo' | 'inativo',
    versao: data.versao,
    papelTimbrado: data.papel_timbrado,
    margens: data.margens as ContratoTemplate['margens'],
    criadoEm: data.created_at,
    atualizadoEm: data.updated_at,
  };
}

export function transformContrato(data: ContratoDB): Contrato {
  return {
    id: data.id,
    templateId: data.template_id || '',
    numero: data.numero,
    titulo: data.titulo,
    tipo: data.tipo as TipoContrato,
    status: data.status as StatusContrato,
    clienteId: data.cliente_id,
    eventoId: data.evento_id,
    valor: data.valor ? parseFloat(String(data.valor)) : undefined,
    conteudo: data.conteudo,
    dataInicio: data.data_inicio,
    dataFim: data.data_fim,
    validade: data.validade,
    itens: (data.itens || []) as Contrato['itens'],
    condicoesPagamento: data.condicoes_pagamento,
    prazoExecucao: data.prazo_execucao,
    garantia: data.garantia,
    observacoes: data.observacoes,
    observacoesComerciais: data.observacoes_comerciais,
    assinaturas: (data.assinaturas || []) as Contrato['assinaturas'],
    anexos: data.anexos || [],
    dadosEvento: data.dados_evento as Contrato['dadosEvento'],
    aprovacoesHistorico: (data.aprovacoes_historico || []) as Contrato['aprovacoesHistorico'],
    criadoEm: data.created_at,
    atualizadoEm: data.updated_at,
  };
}
