import { PostgrestError } from '@supabase/supabase-js';
import { Json } from '@/integrations/supabase/types';

// ============================================
// Tipos de Erro
// ============================================

/** Tipo unificado para erros de database/Supabase */
export type DatabaseError = Error | PostgrestError;

/** Extrai mensagem de erro de forma segura */
export function getErrorMessage(error: DatabaseError): string {
  if ('message' in error) {
    return error.message;
  }
  return 'Erro desconhecido';
}

// ============================================
// Tipos de Query Cache
// ============================================

/** Estrutura de cache para queries de eventos */
export interface EventosQueryCache {
  eventos: Array<{
    id: string;
    nome: string;
    status: string;
    [key: string]: unknown;
  }>;
  total?: number;
}

/** Estrutura de cache para configurações de categorias */
export interface CategoriasConfigCache {
  id: string;
  tipo: string;
  categorias: Array<{
    value: string;
    label: string;
    ativa?: boolean;
  }>;
  updated_at?: string;
}

// ============================================
// Tipos para Dados Brutos do Supabase (snake_case)
// ============================================

/** Dados brutos de demanda vindos do banco (snake_case) */
export interface RawDemandaFromDB {
  id: string;
  numero_id: number | null;
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: string;
  status: string;
  solicitante: string;
  solicitante_id: string | null;
  responsavel: string | null;
  responsavel_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  data_conclusao: string | null;
  prazo: string | null;
  evento_id: string | null;
  evento_nome: string | null;
  resolvida: boolean | null;
  tags: string[] | null;
  arquivada: boolean | null;
  comentarios?: RawComentarioFromDB[] | null;
  anexos?: RawAnexoFromDB[] | null;
  dados_reembolso?: RawDadosReembolsoFromDB | null;
}

export interface RawComentarioFromDB {
  id: string;
  autor: string;
  autor_id: string | null;
  conteudo: string;
  created_at: string | null;
  tipo: string;
}

export interface RawAnexoFromDB {
  id: string;
  nome: string;
  tipo: string;
  tamanho: number;
  url: string;
  upload_por: string;
  created_at: string | null;
}

export interface RawItemReembolsoFromDB {
  descricao: string;
  valor: number;
  anexos?: Array<{
    id: string;
    nome: string;
    url: string;
    tipo: string;
    tamanho: number;
  }>;
}

export interface RawDadosReembolsoFromDB {
  itens?: RawItemReembolsoFromDB[];
  valorTotal?: number;
  membroEquipeId?: string;
  membroEquipeNome?: string;
  statusPagamento?: string;
  formaPagamento?: string;
  dataPagamento?: string;
  comprovantePagamento?: string;
  observacoesPagamento?: string;
}

// ============================================
// Tipos para Update de Eventos
// ============================================

/** Dados de update para evento no banco (snake_case) */
export interface EventoUpdateData {
  nome?: string;
  tipo_evento?: string;
  data_inicio?: string;
  data_fim?: string;
  hora_inicio?: string;
  hora_fim?: string;
  local?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  status?: string;
  descricao?: string;
  observacoes?: string;
  tags?: string[];
  documentos?: string[];
  fotos_evento?: string[];
  redes_sociais?: string;
  contatos_adicionais?: string;
  observacoes_operacionais?: string[];
  planta_baixa?: string;
  configuracao_bar?: Json;
  configuracao_ingresso?: Json;
  cliente_id?: string;
  comercial_id?: string;
}

// ============================================
// Helpers de Serialização JSON
// ============================================

/** 
 * Converte dados para formato Json compatível com Supabase
 * Útil para campos JSONB que requerem cast explícito
 */
export function toJson<T>(data: T): Json {
  return JSON.parse(JSON.stringify(data)) as Json;
}
