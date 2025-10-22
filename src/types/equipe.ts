export type TipoVinculo = 'clt' | 'freelancer' | 'pj';
export type StatusOperacional = 'ativo' | 'inativo' | 'bloqueado';

export interface OperacionalEquipe {
  id: string;
  nome: string;
  cpf: string | null;
  telefone: string;
  whatsapp: string | null;
  email: string | null;
  funcao_principal: string;
  funcoes_secundarias: string[] | null;
  tipo_vinculo: TipoVinculo;
  foto: string | null;
  documentos: string[] | null;
  status: StatusOperacional;
  avaliacao: number;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MembroEquipeEvento {
  id: string;
  evento_id: string;
  operacional_id: string | null;
  nome: string;
  funcao: string;
  telefone: string;
  whatsapp: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MembroEquipeUnificado {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  cpf: string | null;
  avatar_url: string | null;
  tipo_membro: 'sistema' | 'operacional' | 'ambos';
  funcao_principal: string;
  tipo_vinculo?: string;
  status?: string;
  avaliacao?: number;
  permissions?: string[];
  whatsapp?: string;
  created_at: string;
  updated_at: string;
}

export interface ConflitoDatas {
  eventoId: string;
  eventoNome: string;
  dataInicio: string;
  dataFim: string;
}
