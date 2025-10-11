import { Contrato, ContratoTemplate } from '@/types/contratos';

export function transformTemplate(data: any): ContratoTemplate {
  return {
    id: data.id,
    nome: data.nome,
    tipo: data.tipo,
    descricao: data.descricao,
    conteudo: data.conteudo,
    variaveis: data.variaveis || [],
    status: data.status,
    versao: data.versao,
    papelTimbrado: data.papel_timbrado,
    margens: data.margens,
    criadoEm: data.created_at,
    atualizadoEm: data.updated_at,
  };
}

export function transformContrato(data: any): Contrato {
  return {
    id: data.id,
    templateId: data.template_id,
    numero: data.numero,
    titulo: data.titulo,
    tipo: data.tipo,
    status: data.status,
    clienteId: data.cliente_id,
    eventoId: data.evento_id,
    valor: data.valor ? parseFloat(data.valor) : undefined,
    conteudo: data.conteudo,
    dataInicio: data.data_inicio,
    dataFim: data.data_fim,
    validade: data.validade,
    itens: data.itens || [],
    condicoesPagamento: data.condicoes_pagamento,
    prazoExecucao: data.prazo_execucao,
    garantia: data.garantia,
    observacoes: data.observacoes,
    observacoesComerciais: data.observacoes_comerciais,
    assinaturas: data.assinaturas || [],
    anexos: data.anexos || [],
    dadosEvento: data.dados_evento,
    aprovacoesHistorico: data.aprovacoes_historico || [],
    criadoEm: data.created_at,
    atualizadoEm: data.updated_at,
  };
}
