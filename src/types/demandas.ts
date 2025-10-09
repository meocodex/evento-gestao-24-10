export type StatusDemanda = 'aberta' | 'em-andamento' | 'concluida' | 'cancelada';
export type PrioridadeDemanda = 'baixa' | 'media' | 'alta' | 'urgente';
export type CategoriaDemanda = 'tecnica' | 'operacional' | 'comercial' | 'financeira' | 'administrativa' | 'outra';

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

export interface Demanda {
  id: string;
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
}
