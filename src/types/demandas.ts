export type StatusDemanda = 'aberta' | 'em-andamento' | 'concluida' | 'cancelada';
export type PrioridadeDemanda = 'baixa' | 'media' | 'alta' | 'urgente';
export type CategoriaDemanda = 'tecnica' | 'operacional' | 'comercial' | 'financeira' | 'administrativa' | 'reembolso' | 'outra';
export type TipoReembolso = 'frete' | 'diaria' | 'hospedagem' | 'combustivel' | 'locacao' | 'alimentacao' | 'outros';

export interface Comentario {
  id: string;
  autor: string;
  autorId: string;
  conteudo: string;
  dataHora: string;
  tipo: 'resposta' | 'comentario' | 'sistema';
}

export interface Anexo {
  id: string;
  nome: string;
  url: string;
  tipo: string;
  tamanho: number;
  uploadPor: string;
  uploadEm: string;
}

export interface ItemReembolso {
  id: string;
  descricao: string;
  tipo: TipoReembolso;
  valor: number;
  anexos: Anexo[];
  observacoes?: string;
}

export interface DadosReembolso {
  itens: ItemReembolso[];
  valorTotal: number;
  membroEquipeId: string;
  membroEquipeNome: string;
  statusPagamento: 'pendente' | 'aprovado' | 'pago' | 'recusado';
  dataPagamento?: string;
  formaPagamento?: string;
  observacoesPagamento?: string;
  comprovantePagamento?: Anexo;
}

export interface Demanda {
  id: string;
  numeroId: number;
  titulo: string;
  descricao: string;
  categoria: CategoriaDemanda;
  prioridade: PrioridadeDemanda;
  status: StatusDemanda;
  solicitante: string;
  solicitanteId: string;
  responsavel?: string;
  responsavelId?: string;
  dataCriacao: string;
  dataAtualizacao: string;
  dataConclusao?: string;
  prazo?: string;
  comentarios: Comentario[];
  anexos: Anexo[];
  eventoRelacionado?: string;
  eventoNome?: string;
  resolvida: boolean;
  podeResponder: boolean;
  tags: string[];
  dadosReembolso?: DadosReembolso;
  arquivada: boolean;
}

export interface DemandaFormData {
  titulo: string;
  descricao: string;
  categoria: CategoriaDemanda;
  prioridade: PrioridadeDemanda;
  responsavelId?: string;
  prazo?: string;
  eventoRelacionado?: string;
  tags: string[];
}

export interface FiltroDemandas {
  busca?: string;
  status?: StatusDemanda[];
  prioridade?: PrioridadeDemanda[];
  categoria?: CategoriaDemanda[];
  responsavel?: string;
  solicitante?: string;
  mostrarArquivadas?: boolean;
  prazoVencido?: boolean;
  prazoProximo?: boolean;
  statusPagamento?: string[];
  tiposReembolso?: TipoReembolso[];
  eventoRelacionado?: string;
}
