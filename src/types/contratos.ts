export type StatusContrato = 
  | 'proposta'
  | 'em_negociacao'
  | 'aprovada'
  | 'rascunho'
  | 'em_revisao'
  | 'aguardando_assinatura'
  | 'assinado'
  | 'cancelado'
  | 'expirado';

export interface ItemProposta {
  id: string;
  tipo: 'servico' | 'produto' | 'pacote';
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  unidade: string;
  observacoes?: string;
}

export interface ContratoTemplate {
  id: string;
  nome: string;
  tipo: 'evento' | 'fornecedor' | 'cliente' | 'outros';
  descricao: string;
  conteudo: string;
  variaveis: string[];
  status: 'ativo' | 'inativo';
  versao: number;
  papelTimbrado?: string;
  margens?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  criadoEm: string;
  atualizadoEm: string;
}

export interface Contrato {
  id: string;
  templateId: string;
  numero: string;
  clienteId?: string;
  eventoId?: string;
  titulo: string;
  tipo: 'evento' | 'fornecedor' | 'cliente' | 'outros';
  status: StatusContrato;
  conteudo: string;
  valor?: number;
  dataInicio?: string;
  dataFim?: string;
  itens?: ItemProposta[];
  validade?: string;
  condicoesPagamento?: string;
  prazoExecucao?: string;
  garantia?: string;
  observacoesComerciais?: string;
  dadosEvento?: {
    nome: string;
    dataInicio: string;
    dataFim: string;
    local: string;
    cidade: string;
    estado: string;
    descricao?: string;
  };
  assinaturas: {
    parte: string;
    nome: string;
    email: string;
    dataAssinatura?: string;
    assinado: boolean;
  }[];
  anexos: string[];
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
  aprovacoesHistorico?: {
    data: string;
    acao: 'aprovada' | 'recusada' | 'convertida';
    usuario: string;
    observacoes?: string;
  }[];
}
