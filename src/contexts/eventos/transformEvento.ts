import { 
  Evento, 
  ConfiguracaoBar, 
  ConfiguracaoIngresso, 
  StatusEvento, 
  TipoEvento,
  StatusMaterial,
  TipoReceita,
  CategoriaFinanceira,
  StatusFinanceiro,
  Cliente
} from '@/types/eventos';
import type { 
  RawEventoFromDB, 
  RawChecklistItemFromDB, 
  RawMaterialAlocadoFromDB,
  RawReceitaFromDB,
  RawDespesaFromDB,
  RawCobrancaFromDB,
  RawEquipeMembroFromDB,
  RawTimelineItemFromDB
} from '@/types/utils';

type TimelineTipo = 'criacao' | 'edicao' | 'confirmacao' | 'alocacao' | 'envio' | 'entrega' | 'execucao' | 'retorno' | 'fechamento' | 'cancelamento' | 'financeiro';

// Normalize legacy status values to current StatusEvento values
function normalizeStatus(status: string | null | undefined): StatusEvento {
  if (!status) return 'em_negociacao';
  
  const statusMap: Record<string, StatusEvento> = {
    // Legacy mappings
    orcamento: 'em_negociacao',
    orcamento_enviado: 'em_negociacao',
    materiais_alocados: 'em_preparacao',
    em_andamento: 'em_execucao',
    concluido: 'finalizado',
    // Current valid statuses (pass through)
    em_negociacao: 'em_negociacao',
    confirmado: 'confirmado',
    em_preparacao: 'em_preparacao',
    em_execucao: 'em_execucao',
    finalizado: 'finalizado',
    arquivado: 'arquivado',
    cancelado: 'cancelado',
  };

  const normalized = statusMap[status];
  if (!normalized) {
    console.warn(`[transformEvento] Unknown status "${status}", defaulting to "em_negociacao"`);
    return 'em_negociacao';
  }
  return normalized;
}

export function transformEvento(data: RawEventoFromDB): Evento {
  return {
    id: data.id,
    nome: data.nome,
    dataInicio: data.data_inicio || '',
    dataFim: data.data_fim || '',
    horaInicio: data.hora_inicio || '00:00',
    horaFim: data.hora_fim || '00:00',
    local: data.local,
    cidade: data.cidade,
    estado: data.estado,
    endereco: data.endereco,
    tipoEvento: data.tipo_evento as TipoEvento,
    status: normalizeStatus(data.status),
    descricao: data.descricao || '',
    tags: data.tags || [],
    observacoes: data.observacoes || '',
    contatosAdicionais: data.contatos_adicionais || '',
    redesSociais: data.redes_sociais || '',
    plantaBaixa: data.planta_baixa || undefined,
    documentos: data.documentos || [],
    fotosEvento: data.fotos_evento || [],
    observacoesOperacionais: data.observacoes_operacionais || [],
    configuracaoBar: data.configuracao_bar as unknown as ConfiguracaoBar | undefined,
    configuracaoIngresso: data.configuracao_ingresso as unknown as ConfiguracaoIngresso | undefined,
    arquivado: data.arquivado || false,
    utilizaPosEmpresa: data.utiliza_pos_empresa || false,
    
    cliente: data.cliente ? {
      id: data.cliente.id,
      nome: data.cliente.nome,
      tipo: (data.cliente.tipo?.toUpperCase() === 'CNPJ' ? 'CNPJ' : 'CPF') as 'CPF' | 'CNPJ',
      documento: data.cliente.documento,
      telefone: data.cliente.telefone,
      email: data.cliente.email,
      whatsapp: data.cliente.whatsapp || '',
      endereco: (data.cliente.endereco || { cep: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: '' }) as Cliente['endereco']
    } : {
      id: '',
      nome: 'Cliente não encontrado',
      tipo: 'CPF' as const,
      documento: '',
      telefone: '',
      email: '',
      whatsapp: '',
      endereco: { cep: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: '' }
    },
    
    comercial: data.comercial ? {
      id: data.comercial.id,
      nome: data.comercial.nome,
      email: data.comercial.email
    } : {
      id: '',
      nome: 'Comercial não encontrado',
      email: ''
    },
    
    checklist: (data.checklist || []).map((item: RawChecklistItemFromDB) => ({
      id: item.id,
      itemId: item.item_id,
      nome: item.nome,
      quantidade: item.quantidade,
      alocado: item.alocado
    })),
    
    materiaisAlocados: {
      antecipado: (data.materiais_alocados || [])
        .filter((m: RawMaterialAlocadoFromDB) => m.tipo_envio === 'antecipado')
        .map((m: RawMaterialAlocadoFromDB) => ({
          id: m.id,
          itemId: m.item_id,
          nome: m.nome,
          serial: m.serial || '',
          status: m.status as StatusMaterial,
          tipoEnvio: m.tipo_envio,
          transportadora: m.transportadora || '',
          rastreamento: m.rastreamento,
          dataEnvio: m.data_envio || ''
        })),
      comTecnicos: (data.materiais_alocados || [])
        .filter((m: RawMaterialAlocadoFromDB) => m.tipo_envio === 'com_tecnicos')
        .map((m: RawMaterialAlocadoFromDB) => ({
          id: m.id,
          itemId: m.item_id,
          nome: m.nome,
          serial: m.serial || '',
          status: m.status as StatusMaterial,
          tipoEnvio: m.tipo_envio,
          responsavel: m.responsavel || ''
        }))
    },
    
    financeiro: {
      receitas: (data.receitas || []).map((r: RawReceitaFromDB) => ({
        id: r.id,
        descricao: r.descricao,
        tipo: r.tipo as TipoReceita,
        quantidade: r.quantidade,
        valorUnitario: r.valor_unitario,
        valor: r.valor,
        status: r.status as StatusFinanceiro,
        data: r.data,
        comprovante: r.comprovante
      })),
      despesas: (data.despesas || []).map((d: RawDespesaFromDB) => ({
        id: d.id,
        descricao: d.descricao,
        categoria: d.categoria as CategoriaFinanceira,
        quantidade: d.quantidade,
        valorUnitario: d.valor_unitario,
        valor: d.valor,
        status: d.status as 'pendente' | 'pago' | undefined,
        data: d.data,
        dataPagamento: d.data_pagamento,
        responsavel: d.responsavel,
        observacoes: d.observacoes,
        comprovante: d.comprovante,
        selecionadaRelatorio: d.selecionada_relatorio
      })),
      cobrancas: (data.cobrancas || []).map((c: RawCobrancaFromDB) => ({
        id: c.id,
        item: c.item,
        serial: c.serial,
        valor: c.valor,
        motivo: c.motivo as 'perdido' | 'danificado' | 'atraso',
        status: c.status as StatusFinanceiro,
        observacao: c.observacao,
        dataCriacao: c.data_criacao || new Date().toISOString()
      }))
    },
    
    equipe: (data.equipe || []).map((e: RawEquipeMembroFromDB) => ({
      id: e.id,
      nome: e.nome,
      funcao: e.funcao,
      telefone: e.telefone,
      whatsapp: e.whatsapp,
      dataInicio: e.data_inicio,
      dataFim: e.data_fim,
      observacoes: e.observacoes,
      operacionalId: e.operacional_id
    })),
    
    timeline: (data.timeline || []).map((t: RawTimelineItemFromDB) => ({
      id: t.id,
      data: t.data,
      tipo: t.tipo as TimelineTipo,
      usuario: t.usuario,
      descricao: t.descricao
    })),
    
    criadoEm: data.created_at || '',
    atualizadoEm: data.updated_at || ''
  };
}
