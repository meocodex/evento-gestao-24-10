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

// ============================================
// Tipos para Materiais Alocados (snake_case do DB)
// ============================================

export interface RawMaterialAlocadoFromDB {
  id: string;
  item_id: string;
  evento_id: string;
  nome: string;
  serial?: string | null;
  status: string;
  tipo_envio: string;
  quantidade_alocada?: number | null;
  status_devolucao?: string | null;
  data_devolucao?: string | null;
  responsavel_devolucao?: string | null;
  observacoes_devolucao?: string | null;
  fotos_devolucao?: string[] | null;
  termo_retirada_url?: string | null;
  declaracao_transporte_url?: string | null;
  retirado_por_nome?: string | null;
  retirado_por_documento?: string | null;
  retirado_por_telefone?: string | null;
  data_retirada?: string | null;
  envio_id?: string | null;
  valor_declarado?: number | null;
  remetente_tipo?: string | null;
  remetente_membro_id?: string | null;
  remetente_dados?: Json | null;
  dados_destinatario?: Json | null;
  observacoes_transporte?: string | null;
  transportadora?: string | null;
  rastreamento?: string | null;
  data_envio?: string | null;
  responsavel?: string | null;
}

export interface EnderecoObject {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

export interface AlocarMaterialData {
  item_id: string;
  nome: string;
  serial?: string;
  tipo_envio: 'antecipado' | 'com_tecnicos';
  quantidade_alocada?: number;
  status?: string;
  transportadora?: string;
  responsavel?: string;
}

export interface DevolucaoUpdateData {
  status_devolucao: string;
  data_devolucao: string;
  responsavel_devolucao?: string;
  observacoes_devolucao?: string;
  fotos_devolucao?: string[];
  quantidade_devolvida?: number;
}

// ============================================
// Tipos para Evento Raw (snake_case do DB)
// ============================================

export interface RawEventoFromDB {
  id: string;
  nome: string;
  data_inicio: string;
  data_fim: string;
  hora_inicio: string;
  hora_fim: string;
  local: string;
  cidade: string;
  estado: string;
  endereco: string;
  tipo_evento: string;
  status: string;
  descricao?: string | null;
  tags?: string[] | null;
  observacoes?: string | null;
  contatos_adicionais?: string | null;
  redes_sociais?: string | null;
  planta_baixa?: string | null;
  documentos?: string[] | null;
  fotos_evento?: string[] | null;
  observacoes_operacionais?: string[] | null;
  configuracao_bar?: Json | null;
  configuracao_ingresso?: Json | null;
  arquivado?: boolean | null;
  utiliza_pos_empresa?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  cliente_id?: string | null;
  comercial_id?: string | null;
  cliente?: RawClienteFromDB | null;
  comercial?: RawComercialFromDB | null;
  checklist?: RawChecklistItemFromDB[] | null;
  materiais_alocados?: RawMaterialAlocadoFromDB[] | null;
  receitas?: RawReceitaFromDB[] | null;
  despesas?: RawDespesaFromDB[] | null;
  cobrancas?: RawCobrancaFromDB[] | null;
  equipe?: RawEquipeMembroFromDB[] | null;
  timeline?: RawTimelineItemFromDB[] | null;
}

export interface RawClienteFromDB {
  id: string;
  nome: string;
  tipo: string;
  documento: string;
  telefone: string;
  email: string;
  whatsapp?: string | null;
  endereco?: Json | null;
}

export interface RawComercialFromDB {
  id: string;
  nome: string;
  email: string;
}

export interface RawChecklistItemFromDB {
  id: string;
  item_id: string;
  nome: string;
  quantidade: number;
  alocado: number;
}

export interface RawReceitaFromDB {
  id: string;
  descricao: string;
  tipo: string;
  quantidade: number;
  valor_unitario: number;
  valor: number;
  status: string;
  data: string;
  comprovante?: string | null;
}

export interface RawDespesaFromDB {
  id: string;
  descricao: string;
  categoria: string;
  quantidade: number;
  valor_unitario: number;
  valor: number;
  status: string;
  data?: string | null;
  data_pagamento?: string | null;
  responsavel?: string | null;
  observacoes?: string | null;
  comprovante?: string | null;
  selecionada_relatorio?: boolean | null;
}

export interface RawCobrancaFromDB {
  id: string;
  item: string;
  serial: string;
  valor: number;
  motivo: string;
  status: string;
  observacao?: string | null;
  data_criacao?: string | null;
}

export interface RawEquipeMembroFromDB {
  id: string;
  nome: string;
  funcao: string;
  telefone: string;
  whatsapp?: string | null;
  data_inicio?: string | null;
  data_fim?: string | null;
  observacoes?: string | null;
  operacional_id?: string | null;
}

export interface RawTimelineItemFromDB {
  id: string;
  data: string;
  tipo: string;
  usuario: string;
  descricao: string;
}

// ============================================
// Tipos para Estoque (snake_case do DB)
// ============================================

export interface RawEstoqueMaterialFromDB {
  id: string;
  nome: string;
  categoria: string;
  descricao?: string | null;
  foto?: string | null;
  valor_unitario?: number | null;
  quantidade_total: number;
  quantidade_disponivel: number;
  tipo_controle: string;
  materiais_seriais?: RawSerialFromDB[] | null;
}

export interface RawSerialFromDB {
  numero: string;
  status: string;
  localizacao?: string | null;
  tags?: string[] | null;
  ultima_manutencao?: string | null;
  data_aquisicao?: string | null;
  observacoes?: string | null;
}

// ============================================
// Tipos para Demandas Cache
// ============================================

export interface DemandasQueryCache {
  demandas: Array<{
    id: string;
    titulo: string;
    descricao: string;
    status: string;
    prioridade: string;
    categoria: string;
    solicitante: string;
    solicitanteId?: string;
    responsavel?: string;
    responsavelId?: string;
    prazo?: string;
    eventoId?: string;
    eventoNome?: string;
    tags?: string[];
    resolvida?: boolean;
    arquivada?: boolean;
    dataCriacao: string;
    dataConclusao?: string;
    comentarios?: Array<{
      id: string;
      autor: string;
      autorId?: string;
      conteudo: string;
      dataHora: string;
      tipo: string;
    }>;
    [key: string]: unknown;
  }>;
  totalCount: number;
}

// ============================================
// Tipos para Configurações Empresa
// ============================================

export interface ConfiguracaoEmpresaData {
  nome?: string;
  razao_social?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: EnderecoObject;
  logo?: string;
}

// ============================================
// Tipos para Checklist de Eventos
// ============================================

export interface ChecklistItemData {
  itemId: string;
  nome: string;
  quantidade: number;
}

export interface ChecklistItemFromDB {
  id: string;
  item_id: string;
  nome: string;
  quantidade: number;
  alocado: number;
  evento_id: string;
  created_at?: string | null;
  updated_at?: string | null;
}

// ============================================
// Tipos para Clientes Cache
// ============================================

export interface ClientesQueryCache {
  clientes: Array<{
    id: string;
    nome: string;
    email: string;
    telefone: string;
    documento: string;
    tipo: string;
    [key: string]: unknown;
  }>;
  totalCount: number;
}

// ============================================
// Tipos para Transportadoras
// ============================================

/** Dados de criação de transportadora (formato UI - camelCase) */
export interface TransportadoraCreateData {
  nome: string;
  cnpj: string;
  razaoSocial: string;
  telefone: string;
  email: string;
  responsavel: string;
  status?: 'ativa' | 'inativa';
  endereco: {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  dadosBancarios?: {
    banco: string;
    agencia: string;
    conta: string;
    tipoConta: 'corrente' | 'poupanca';
  };
  rotasAtendidas?: RotaAtendidaUI[];
  observacoes?: string;
}

/** Dados de update de transportadora (formato UI - camelCase) */
export interface TransportadoraUpdateData {
  nome?: string;
  cnpj?: string;
  razaoSocial?: string;
  telefone?: string;
  email?: string;
  responsavel?: string;
  status?: 'ativa' | 'inativa';
  endereco?: {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  dadosBancarios?: {
    banco: string;
    agencia: string;
    conta: string;
    tipoConta: 'corrente' | 'poupanca';
  };
  rotasAtendidas?: RotaAtendidaUI[];
  observacoes?: string;
}

/** Rota formato UI (camelCase) - usado pelos componentes */
export interface RotaAtendidaUI {
  id?: string;
  cidadeDestino: string;
  estadoDestino: string;
  prazoEntrega: number;
  valorBase?: number;
  ativa: boolean;
}

/** Rota formato DB (snake_case) - usado internamente */
export interface RotaAtendidaDB {
  id: string;
  cidade_destino: string;
  estado_destino: string;
  prazo_entrega: number;
  valor_base?: number;
  ativa: boolean;
}

/** Dados de criação de envio (formato UI - camelCase) */
export interface EnvioCreateData {
  transportadoraId: string;
  eventoId: string;
  tipo: 'ida' | 'volta';
  status?: 'pendente' | 'em_transito' | 'entregue' | 'cancelado';
  dataColeta?: string;
  dataEntrega?: string;
  dataEntregaPrevista: string;
  origem: string;
  destino: string;
  rastreio?: string;
  valor?: number;
  formaPagamento: 'antecipado' | 'na_entrega' | 'a_combinar';
  comprovantePagamento?: string;
  despesaEventoId?: string;
  observacoes?: string;
}

/** Dados de update de envio (formato UI - camelCase) */
export interface EnvioUpdateData {
  transportadoraId?: string;
  eventoId?: string;
  tipo?: 'ida' | 'volta';
  status?: 'pendente' | 'em_transito' | 'entregue' | 'cancelado';
  dataColeta?: string;
  dataEntrega?: string;
  dataEntregaPrevista?: string;
  origem?: string;
  destino?: string;
  rastreio?: string;
  valor?: number;
  formaPagamento?: 'antecipado' | 'na_entrega' | 'a_combinar';
  comprovantePagamento?: string;
  despesaEventoId?: string;
  observacoes?: string;
}

// ============================================
// Tipos para Equipe de Eventos
// ============================================

export interface EquipeMembroData {
  nome: string;
  funcao: string;
  telefone: string;
  whatsapp?: string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  observacoes?: string | null;
  operacionalId?: string | null;
}

export interface EquipeMembroFromDB {
  id: string;
  evento_id: string;
  nome: string;
  funcao: string;
  telefone: string;
  whatsapp?: string | null;
  data_inicio?: string | null;
  data_fim?: string | null;
  observacoes?: string | null;
  operacional_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// ============================================
// Tipos para Upload de Arquivos
// ============================================

export interface EventoArquivosFromDB {
  planta_baixa: string | null;
  documentos: string[] | null;
  fotos_evento: string[] | null;
}

export type TipoArquivoEvento = 'plantaBaixa' | 'documentos' | 'fotosEvento';

export interface EventoArquivoUpdateData {
  planta_baixa?: string | null;
  documentos?: string[];
  fotos_evento?: string[];
}

// ============================================
// Tipos para Financeiro de Eventos (Batch 6)
// ============================================

/** Dados para criar receita de evento */
export interface ReceitaCreateData {
  tipo: 'fixo' | 'variavel';
  tipo_servico?: string;
  descricao: string;
  valor: number;
  valor_unitario?: number;
  quantidade?: number;
  data: string;
  status?: string;
  observacoes?: string;
}

/** Dados para criar despesa de evento */
export interface DespesaCreateData {
  categoria: string;
  descricao: string;
  valor: number;
  valor_unitario?: number;
  quantidade?: number;
  data?: string;
  data_pagamento?: string;
  status?: string;
  observacoes?: string;
  responsavel?: string;
  comprovante?: string;
}

// ============================================
// Tipos para Propostas e Contratos (Batch 7)
// ============================================

import type { TipoEvento } from './eventos';

/** Dados do evento vindos de uma proposta */
export interface PropostaEventoData {
  nome?: string;
  descricao?: string;
  comercialId?: string;
  dataInicio?: string;
  dataFim?: string;
  horaInicio?: string;
  horaFim?: string;
  local?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  tipoEvento?: TipoEvento;
}

/** Item de proposta para ser convertido em receita */
export interface ItemPropostaReceita {
  descricao?: string;
  nome?: string;
  valor?: number;
  valorTotal?: number;
  valorUnitario?: number;
  quantidade?: number;
}

/** Assinatura de contrato */
export interface AssinaturaContrato {
  parte: string;
  assinado: boolean;
  dataAssinatura?: string;
}

/** Ação do histórico de aprovações do contrato */
export interface AcaoHistoricoContrato {
  data: string;
  acao: string;
  usuario: string;
  observacoes?: string;
}

// ============================================
// Tipos para Transformadores (Batch 8)
// ============================================

/** Interface para dados do banco (snake_case) de cadastro público */
export interface CadastroPublicoDB {
  id: string;
  protocolo: string;
  nome: string;
  tipo_evento: string;
  data_inicio: string;
  data_fim: string;
  hora_inicio: string;
  hora_fim: string;
  local: string;
  cidade: string;
  estado: string;
  endereco: string;
  produtor?: Record<string, unknown>;
  configuracao_ingresso?: Record<string, unknown>;
  configuracao_bar?: Record<string, unknown>;
  status: string;
  created_at: string;
  evento_id?: string;
  observacoes_internas?: string;
}

/** Interface para template do banco */
export interface TemplateDB {
  id: string;
  nome: string;
  tipo: string;
  descricao?: string;
  conteudo: string;
  variaveis?: string[];
  status: string;
  versao: number;
  papel_timbrado?: string;
  margens?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/** Interface para contrato do banco */
export interface ContratoDB {
  id: string;
  template_id?: string;
  numero: string;
  titulo: string;
  tipo: string;
  status: string;
  cliente_id?: string;
  evento_id?: string;
  valor?: string | number;
  conteudo: string;
  data_inicio?: string;
  data_fim?: string;
  validade?: string;
  itens?: unknown[];
  condicoes_pagamento?: string;
  prazo_execucao?: string;
  garantia?: string;
  observacoes?: string;
  observacoes_comerciais?: string;
  assinaturas?: unknown[];
  anexos?: string[];
  dados_evento?: Record<string, unknown>;
  aprovacoes_historico?: unknown[];
  created_at: string;
  updated_at: string;
}

// ============================================
// Tipos para Validação de Estoque (Batch 9)
// ============================================

/** Interface para conflitos de eventos em estoque */
export interface EventoConflito {
  id: string;
  nome: string;
  data_inicio: string;
  data_fim: string;
  materiais_alocados?: { item_id: string; status: string }[];
}

// ============================================
// Tipos para Demandas Mutations (Batch 11)
// ============================================

/** Tipo para atualizações parciais de demanda */
export interface DemandaUpdateData {
  titulo?: string;
  descricao?: string;
  status?: string;
  prioridade?: string;
  responsavel_id?: string | null;
  responsavel?: string | null;
  prazo?: string | null;
  categoria?: string;
  evento_id?: string | null;
  evento_nome?: string | null;
  tags?: string[];
  data_conclusao?: string;
}

/** Tipo genérico para Demanda */
export interface Demanda {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  prioridade: string;
  categoria: string;
  solicitante: string;
  solicitanteId?: string;
  responsavel?: string;
  responsavelId?: string;
  prazo?: string;
  eventoId?: string;
  eventoNome?: string;
  tags?: string[];
  resolvida?: boolean;
  arquivada?: boolean;
  dataCriacao: string;
  dataConclusao?: string;
}
