import { Evento } from '@/types/eventos';

export function transformEvento(data: any): Evento {
  return {
    id: data.id,
    nome: data.nome,
    dataInicio: data.data_inicio,
    dataFim: data.data_fim,
    horaInicio: data.hora_inicio,
    horaFim: data.hora_fim,
    local: data.local,
    cidade: data.cidade,
    estado: data.estado,
    endereco: data.endereco,
    tipoEvento: data.tipo_evento,
    status: data.status,
    descricao: data.descricao || '',
    tags: data.tags || [],
    observacoes: data.observacoes || '',
    contatosAdicionais: data.contatos_adicionais || '',
    redesSociais: data.redes_sociais || '',
    plantaBaixa: data.planta_baixa || undefined,
    documentos: data.documentos || [],
    fotosEvento: data.fotos_evento || [],
    observacoesOperacionais: data.observacoes_operacionais || [],
    configuracaoBar: data.configuracao_bar as any,
    configuracaoIngresso: data.configuracao_ingresso as any,
    
    cliente: data.cliente ? {
      id: data.cliente.id,
      nome: data.cliente.nome,
      tipo: (data.cliente.tipo?.toUpperCase() === 'CNPJ' ? 'CNPJ' : 'CPF') as 'CPF' | 'CNPJ',
      documento: data.cliente.documento,
      telefone: data.cliente.telefone,
      email: data.cliente.email,
      whatsapp: data.cliente.whatsapp,
      endereco: data.cliente.endereco as any
    } : {
      id: '',
      nome: 'Cliente não encontrado',
      tipo: 'CPF' as const,
      documento: '',
      telefone: '',
      email: '',
      whatsapp: '',
      endereco: {} as any
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
    
    checklist: (data.checklist || []).map((item: any) => ({
      id: item.id,
      itemId: item.item_id,
      nome: item.nome,
      quantidade: item.quantidade,
      alocado: item.alocado
    })),
    
    materiaisAlocados: {
      antecipado: (data.materiais_alocados || [])
        .filter((m: any) => m.tipo_envio === 'antecipado')
        .map((m: any) => ({
          id: m.id,
          itemId: m.item_id,
          nome: m.nome,
          serial: m.serial,
          status: m.status,
          tipoEnvio: m.tipo_envio,
          transportadora: m.transportadora,
          rastreamento: m.rastreamento,
          dataEnvio: m.data_envio
        })),
      comTecnicos: (data.materiais_alocados || [])
        .filter((m: any) => m.tipo_envio === 'com_tecnicos')
        .map((m: any) => ({
          id: m.id,
          itemId: m.item_id,
          nome: m.nome,
          serial: m.serial,
          status: m.status,
          tipoEnvio: m.tipo_envio,
          responsavel: m.responsavel
        }))
    },
    
    financeiro: {
      receitas: (data.receitas || []).map((r: any) => ({
        id: r.id,
        descricao: r.descricao,
        tipo: r.tipo,
        quantidade: r.quantidade,
        valorUnitario: r.valor_unitario,
        valor: r.valor,
        status: r.status,
        data: r.data,
        comprovante: r.comprovante
      })),
      despesas: (data.despesas || []).map((d: any) => ({
        id: d.id,
        descricao: d.descricao,
        categoria: d.categoria,
        quantidade: d.quantidade,
        valorUnitario: d.valor_unitario,
        valor: d.valor,
        status: d.status,
        data: d.data,
        dataPagamento: d.data_pagamento,
        responsavel: d.responsavel,
        observacoes: d.observacoes,
        comprovante: d.comprovante,
        selecionadaRelatorio: d.selecionada_relatorio
      })),
      cobrancas: (data.cobrancas || []).map((c: any) => ({
        id: c.id,
        item: c.item,
        serial: c.serial,
        valor: c.valor,
        motivo: c.motivo,
        status: c.status,
        observacao: c.observacao
      }))
    },
    
    equipe: (data.equipe || []).map((e: any) => ({
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
    
    timeline: (data.timeline || []).map((t: any) => ({
      id: t.id,
      data: t.data,
      tipo: t.tipo,
      usuario: t.usuario,
      descricao: t.descricao
    })),
    
    criadoEm: data.created_at,
    atualizadoEm: data.updated_at
  };
}
