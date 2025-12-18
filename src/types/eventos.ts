export type StatusEvento =
  | 'em_negociacao'
  | 'confirmado'
  | 'em_preparacao'
  | 'em_execucao'
  | 'finalizado'
  | 'arquivado'
  | 'cancelado';

export type TipoEnvio = 'antecipado' | 'com_tecnicos';

export type TipoCliente = 'CPF' | 'CNPJ';

export type StatusMaterial = 'reservado' | 'separado' | 'em_transito' | 'entregue' | 'preparado';

export interface ResponsavelLegal {
  nome: string;
  cpf: string;
  dataNascimento: string;
}

export interface PontoVenda {
  id: string;
  nome: string;
  responsavel: string;
  telefone: string;
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

export interface EstabelecimentoBar {
  id: string;
  nome: string;
  quantidadeMaquinas: number;
  cardapioUrl?: string;
  copiadoDeId?: string;
}

export type StatusFinanceiro = 'pendente' | 'pago' | 'cancelado' | 'em_negociacao';

export type TipoReceita = 'venda' | 'locacao' | 'servico' | 'outros';

export type CategoriaFinanceira = 'pessoal' | 'transporte' | 'insumos' | 'alimentacao' | 'Reembolso de Equipe' | 'outros';

export type TipoEvento = 'ingresso' | 'bar' | 'hibrido';

export interface SetorEvento {
  id: string;
  nome: string;
  capacidade: number;
  tiposIngresso: TipoIngresso[];
}

export interface TipoIngresso {
  id: string;
  nome: string;
  lotes: Lote[];
}

export interface Lote {
  numero: 1 | 2 | 3 | 4;
  quantidade: number;
  preco: number;
  dataAberturaOnline: string;
  dataAberturaPDV: string;
  dataFechamentoOnline: string;
  dataFechamentoPDV: string;
}

export interface ConfiguracaoBar {
  estabelecimentos: EstabelecimentoBar[];
  mapaLocal?: string;
}

export interface ConfiguracaoIngresso {
  setores: SetorEvento[];
  pontosVenda: PontoVenda[];
  mapaEvento?: string;
  banners?: {
    bannerPrincipal?: string;
    bannerMobile?: string;
    bannerSite?: string;
  };
}

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
  responsavelLegal?: ResponsavelLegal;
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
  termoRetiradaUrl?: string;
  declaracaoTransporteUrl?: string;
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
  data?: string;
  dataPagamento?: string;
  status?: 'pendente' | 'pago';
  responsavel?: string;
  observacoes?: string;
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
  tipo: 'criacao' | 'edicao' | 'confirmacao' | 'alocacao' | 'envio' | 'entrega' | 'execucao' | 'retorno' | 'fechamento' | 'cancelamento' | 'financeiro';
  usuario: string;
  descricao: string;
}

export interface MembroEquipe {
  id: string;
  nome: string;
  funcao: string;
  telefone: string;
  whatsapp?: string;
  dataInicio?: string;
  dataFim?: string;
  observacoes?: string;
  operacionalId?: string;
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
  tipoEvento: TipoEvento;
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
  configuracaoIngresso?: ConfiguracaoIngresso;
  configuracaoBar?: ConfiguracaoBar;
  criadoEm: string;
  atualizadoEm: string;
  arquivado?: boolean;
  utilizaPosEmpresa?: boolean;
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
  tipoEvento?: TipoEvento;
  tags: string[];
  plantaBaixa?: File;
  descricao?: string;
  observacoes?: string;
  contatosAdicionais?: string;
  redesSociais?: string;
  configuracaoIngresso?: ConfiguracaoIngresso;
  configuracaoBar?: ConfiguracaoBar;
  utilizaPosEmpresa?: boolean;
}

export interface CadastroEventoPublico {
  tipoEvento: TipoEvento;
  nome: string;
  dataInicio: string;
  dataFim: string;
  horaInicio: string;
  horaFim: string;
  local: string;
  endereco: string;
  cidade: string;
  estado: string;
  observacoes?: string;
  produtor: {
    nome: string;
    tipo: TipoCliente;
    documento: string;
    telefone: string;
    whatsapp: string;
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
    responsavelLegal?: ResponsavelLegal;
  };
  configuracaoIngresso?: ConfiguracaoIngresso;
  configuracaoBar?: ConfiguracaoBar;
}

export interface CadastroPublico extends CadastroEventoPublico {
  id: string;
  protocolo: string;
  status: 'pendente' | 'em_analise' | 'aprovado' | 'recusado';
  dataCriacao: string;
  observacoesInternas?: string;
  eventoId?: string;
}

export interface ClienteFormData {
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

// Interfaces para formulários de receita/despesa
export interface ReceitaFormData {
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor: number;
  tipo: TipoReceita;
  status: string;
  data: string;
  tipo_servico?: string;
}

export interface DespesaFormData {
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor: number;
  categoria: string;
  status: string;
  data: string;
}

export interface FormaPagamentoData {
  forma: string;
  valor: number;
  taxa_percentual: number;
}

export interface ReceitaComTaxasData {
  receita: ReceitaFormData;
  formasPagamento: FormaPagamentoData[];
}

// Interfaces para componentes de Materiais
export interface ItemChecklistUI {
  id: string;
  itemId?: string;
  item_id?: string;
  nome: string;
  quantidade: number;
  alocado: number;
}

export interface MaterialAlocadoUI {
  id: string;
  nome: string;
  serial?: string;
  item_id?: string;
  tipo_envio: 'antecipado' | 'com_tecnicos';
  status: StatusMaterial;
  status_devolucao?: string;
  statusDevolucao?: string;
  devolvido?: boolean;
  termoRetiradaUrl?: string;
  declaracaoTransporteUrl?: string;
  transportadora?: string;
  envio_id?: string;
  responsavel?: string;
  quantidade_alocada?: number;
}

export interface MaterialParaFrete {
  id: string;
  nome: string;
  serial?: string;
  transportadora?: string;
  tipo_envio?: string;
  envio_id?: string;
  status_devolucao?: string;
}

export interface EnderecoCliente {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

export interface MaterialAlocadoDB {
  id: string;
  evento_id: string;
  item_id: string;
  serial?: string;
  nome: string;
  tipo_envio: string;
  quantidade_alocada: number;
  created_at: string;
}

// Tipos para filtros de documentos
export type FiltroDocumento = 'todos' | 'sem-documento' | 'com-documento' | 'equipe-tecnica';

// Tipos para templates
export type TipoTemplate = 'evento' | 'fornecedor' | 'cliente' | 'outros';
export type StatusTemplate = 'ativo' | 'inativo';

// Tipos para formas de pagamento frete
export type FormaPagamentoFrete = 'antecipado' | 'na_entrega' | 'a_combinar';

// Tipos para formulários dinâmicos CadastroEvento
export type SetorCampo = 'nome' | 'capacidade';
export type TipoIngressoCampo = 'nome' | 'descricao';
export type LoteCampo = 'quantidade' | 'preco' | 'dataAberturaOnline' | 'dataAberturaPDV' | 'dataFechamentoOnline' | 'dataFechamentoPDV';
export type PDVCampo = 'nome' | 'responsavel' | 'telefone';
export type PDVEnderecoCampo = `endereco.${keyof EnderecoCliente}`;
export type EstabelecimentoCampo = 'nome' | 'quantidadeMaquinas' | 'cardapioUrl';

// Tipos para Dashboard stats
export interface EventoProximo {
  id: string;
  data_inicio: string;
  status: StatusEvento;
  nome?: string;
}

export interface OperacaoHoje {
  id: string;
  nome: string;
  local?: string;
  hora_inicio?: string;
  hora_fim?: string;
}

export interface RastreamentoAtivo {
  id: string;
  rastreio?: string;
  status: string;
  tipo: string;
}

export interface ChecklistItem {
  alocado: number;
  quantidade: number;
}

// Interface para endereço da empresa (configurações)
export interface EnderecoEmpresa {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

// Interface para alocação com evento (useConflitosEquipe)
export interface AlocacaoComEvento {
  id: string;
  evento_id: string;
  nome: string;
  funcao: string;
  data_inicio: string | null;
  data_fim: string | null;
  eventos: {
    id: string;
    nome: string;
    data_inicio: string;
    data_fim: string;
    status: string;
  } | null;
}
