/**
 * Query Keys Centralizadas
 * 
 * Todas as query keys do TanStack Query devem ser definidas aqui
 * para garantir consistência e facilitar manutenção.
 * 
 * Padrão: [domínio, operação, ...parâmetros]
 */

import type { FiltrosEstoque } from '@/types/estoque';
import type { FiltrosOperacional } from '@/types/equipe';

// Tipos para filtros de contratos
export interface FiltrosContrato {
  searchTerm?: string;
  status?: string;
}

export interface FiltrosTemplate {
  searchTerm?: string;
}

export interface FiltrosTransportadora {
  searchTerm?: string;
  status?: 'todas' | 'ativa' | 'inativa';
}

export interface FiltrosEnvio {
  status?: string;
}

export const queryKeys = {
  // ==================== EVENTOS ====================
  eventos: {
    all: ['eventos'] as const,
    list: (page: number, pageSize: number, searchTerm?: string) => 
      ['eventos', page, pageSize, searchTerm] as const,
    detail: (eventoId: string) => ['evento-detalhes', eventoId] as const,
    equipe: (eventoId: string) => ['eventos-equipe', eventoId] as const,
    checklist: (eventoId: string) => ['eventos-checklist', eventoId] as const,
    materiais: (eventoId: string) => ['eventos-materiais-alocados', eventoId] as const,
    financeiro: (eventoId: string) => ['eventos-financeiro', eventoId] as const,
    timeline: (eventoId: string) => ['eventos-timeline', eventoId] as const,
    cobrancas: (eventoId: string) => ['eventos-cobrancas', eventoId] as const,
  },

  // ==================== DEMANDAS ====================
  demandas: {
    all: ['demandas'] as const,
    list: (page: number, pageSize: number, searchTerm?: string) => 
      ['demandas', page, pageSize, searchTerm] as const,
    detail: (demandaId: string) => ['demanda-detalhes', demandaId] as const,
    comentarios: (demandaId: string) => ['demandas-comentarios', demandaId] as const,
    anexos: (demandaId: string) => ['demandas-anexos', demandaId] as const,
  },

  // ==================== CLIENTES ====================
  clientes: {
    all: ['clientes'] as const,
    list: (page: number, pageSize: number, searchTerm?: string) => 
      ['clientes', page, pageSize, searchTerm] as const,
    detail: (clienteId: string) => ['cliente', clienteId] as const,
  },

  // ==================== CONTRATOS ====================
  contratos: {
    all: ['contratos'] as const,
    list: (page: number, pageSize: number, filtros?: FiltrosContrato) => 
      ['contratos', page, pageSize, filtros] as const,
    detail: (contratoId: string) => ['contrato', contratoId] as const,
    templates: {
      all: ['contratos-templates'] as const,
      list: (page: number, pageSize: number, filtros?: FiltrosTemplate) => 
        ['contratos-templates', page, pageSize, filtros] as const,
      detail: (templateId: string) => ['contratos-template', templateId] as const,
    },
  },

  // ==================== ESTOQUE ====================
  estoque: {
    all: ['materiais_estoque'] as const,
    list: (page: number, pageSize: number, filtros?: FiltrosEstoque) => 
      ['materiais_estoque', page, pageSize, filtros] as const,
    detail: (materialId: string) => ['material-estoque', materialId] as const,
    seriais: (materialId: string) => ['materiais-seriais', materialId] as const,
    historico: (materialId: string) => ['materiais-historico', materialId] as const,
  },

  // ==================== EQUIPE ====================
  equipe: {
    profiles: ['profiles-equipe'] as const,
    operacional: {
      all: ['equipe-operacional'] as const,
      list: (page: number, pageSize: number, filtros?: FiltrosOperacional) => 
        ['equipe-operacional', page, pageSize, 
         filtros?.searchTerm, filtros?.funcao, filtros?.tipo, filtros?.status] as const,
      detail: (operacionalId: string) => ['equipe-operacional-detail', operacionalId] as const,
    },
    conflitos: (eventoId: string, dataInicio?: string, dataFim?: string) => 
      ['conflitos-equipe', eventoId, dataInicio, dataFim] as const,
  },

  // ==================== TRANSPORTADORAS ====================
  transportadoras: {
    all: ['transportadoras'] as const,
    list: (page: number, pageSize: number, filtros?: FiltrosTransportadora) => 
      ['transportadoras', page, pageSize, filtros] as const,
    detail: (transportadoraId: string) => ['transportadora', transportadoraId] as const,
    envios: {
      all: ['envios'] as const,
      list: (page: number, pageSize: number, filtros?: FiltrosEnvio) => 
        ['envios', page, pageSize, filtros] as const,
      detail: (envioId: string) => ['envio', envioId] as const,
    },
  },

  // ==================== FINANCEIRO ====================
  financeiro: {
    contasPagar: {
      all: ['contas-pagar'] as const,
      list: (page: number, pageSize: number, filtros?: Record<string, unknown>) => 
        ['contas-pagar', page, pageSize, filtros] as const,
    },
    contasReceber: {
      all: ['contas-receber'] as const,
      list: (page: number, pageSize: number, filtros?: Record<string, unknown>) => 
        ['contas-receber', page, pageSize, filtros] as const,
    },
    taxasPagamento: ['configuracoes-taxas-pagamento'] as const,
  },

  // ==================== CONFIGURAÇÕES ====================
  configuracoes: {
    all: ['configuracoes'] as const,
    usuario: (userId?: string) => ['configuracoes', userId] as const,
    categorias: ['configuracoes_categorias'] as const,
    empresa: ['configuracoes_empresa'] as const,
    fechamento: ['configuracoes_fechamento'] as const,
  },

  // ==================== CADASTROS PÚBLICOS ====================
  cadastrosPublicos: {
    all: ['cadastros-publicos'] as const,
    list: (page: number, pageSize: number, filtros?: Record<string, unknown>) => 
      ['cadastros-publicos', page, pageSize, filtros] as const,
    detail: (cadastroId: string) => ['cadastro-publico', cadastroId] as const,
    byProtocolo: (protocolo: string) => ['cadastro-publico-protocolo', protocolo] as const,
  },

  // ==================== AUTENTICAÇÃO ====================
  auth: {
    user: ['auth-user'] as const,
    session: ['auth-session'] as const,
    permissions: (userId: string) => ['auth-permissions', userId] as const,
    roles: (userId: string) => ['auth-roles', userId] as const,
  },

  // ==================== NOTIFICAÇÕES ====================
  notificacoes: {
    all: ['notificacoes'] as const,
    unread: ['notificacoes-unread'] as const,
  },

  // ==================== AUDIT ====================
  audit: {
    logs: (page: number, pageSize: number) => ['audit-logs', page, pageSize] as const,
  },
} as const;

// Tipo helper para extrair o tipo de uma query key
export type QueryKey<T extends readonly unknown[]> = T;
