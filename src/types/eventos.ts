export type StatusEvento =
  | 'orcamento_enviado'
  | 'confirmado'
  | 'materiais_alocados'
  | 'em_preparacao'
  | 'em_andamento'
  | 'aguardando_retorno'
  | 'aguardando_fechamento'
  | 'finalizado'
  | 'cancelado'
  | 'aguardando_alocacao';

export type TipoEnvio = 'antecipado' | 'com_tecnicos';

export type TipoCliente = 'CPF' | 'CNPJ';

export type StatusMaterial = 'reservado' | 'separado' | 'em_transito' | 'entregue' | 'preparado';

export type StatusFinanceiro = 'pendente' | 'pago' | 'cancelado' | 'em_negociacao';

export type TipoReceita = 'fixo' | 'quantidade';

export type CategoriaFinanceira = 'pessoal' | 'transporte' | 'insumos' | 'alimentacao' | 'outros';

export interface Cliente {
  id: string;
  nome: string;
  tipo: TipoCliente;
  documento: string;
  telefone: string;
  whatsapp?: string;
  email: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
}

export interface Comercial {
  id: string;
  nome: string;
  email: string;
}

export interface MaterialChecklist {
  id: string;
  itemId: string;
  nome: string;
  quantidade: number;
  alocado: number;
}

export interface MaterialAlocado {
  id: string;
  itemId: string;
  nome: string;
  serial: string;
  status: StatusMaterial;
}

export interface MaterialAntecipado extends MaterialAlocado {
  transportadora: string;
  dataEnvio: string;
  rastreamento?: string;
}

export interface MaterialComTecnicos extends MaterialAlocado {
  responsavel: string;
}

export interface Receita {
  id: string;
  descricao: string;
  tipo: TipoReceita;
  quantidade: number;
  valorUnitario: number;
  valor: number;
  status: StatusFinanceiro;
  data: string;
  comprovante?: string;
}

export interface Despesa {
  id: string;
  descricao: string;
  categoria: CategoriaFinanceira;
  quantidade: number;
  valorUnitario: number;
  valor: number;
  data: string;
  comprovante?: string;
  selecionadaRelatorio?: boolean;
}

export interface Cobranca {
  id: string;
  item: string;
  serial: string;
  valor: number;
  status: StatusFinanceiro;
  motivo: 'perdido' | 'danificado' | 'atraso';
  observacao?: string;
  dataCriacao: string;
}

export interface TimelineItem {
  id: string;
  data: string;
  tipo: 'criacao' | 'edicao' | 'confirmacao' | 'alocacao' | 'envio' | 'entrega' | 'execucao' | 'retorno' | 'fechamento' | 'cancelamento';
  usuario: string;
  descricao: string;
}

export interface MembroEquipe {
  id: string;
  nome: string;
  funcao: string;
  telefone: string;
}

export interface Evento {
  id: string;
  nome: string;
  dataInicio: string;
  dataFim: string;
  horaInicio: string;
  horaFim: string;
  local: string;
  cidade: string;
  estado: string;
  endereco: string;
  cliente: Cliente;
  comercial: Comercial;
  status: StatusEvento;
  tags: string[];
  plantaBaixa?: string;
  descricao?: string;
  observacoes?: string;
  contatosAdicionais?: string;
  redesSociais?: string;
  documentos?: string[];
  checklist: MaterialChecklist[];
  materiaisAlocados: {
    antecipado: MaterialAntecipado[];
    comTecnicos: MaterialComTecnicos[];
  };
  financeiro: {
    receitas: Receita[];
    despesas: Despesa[];
    cobrancas: Cobranca[];
  };
  timeline: TimelineItem[];
  equipe: MembroEquipe[];
  observacoesOperacionais: string[];
  fotosEvento?: string[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface EventoFormData {
  nome: string;
  dataInicio: string;
  dataFim: string;
  horaInicio: string;
  horaFim: string;
  local: string;
  cidade: string;
  estado: string;
  endereco: string;
  clienteId: string;
  comercialId: string;
  tags: string[];
  plantaBaixa?: File;
  descricao?: string;
  observacoes?: string;
  contatosAdicionais?: string;
  redesSociais?: string;
}

export interface ClienteFormData {
  nome: string;
  tipo: TipoCliente;
  documento: string;
  telefone: string;
  whatsapp?: string;
  email: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}
