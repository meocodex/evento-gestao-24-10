export interface ContratoTemplate {
  id: string;
  nome: string;
  tipo: 'evento' | 'fornecedor' | 'cliente' | 'outros';
  descricao: string;
  conteudo: string;
  variaveis: string[]; // Ex: {{cliente_nome}}, {{evento_data}}
  status: 'ativo' | 'inativo';
  versao: number;
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
  status: 'rascunho' | 'em_revisao' | 'aguardando_assinatura' | 'assinado' | 'cancelado';
  conteudo: string;
  valor?: number;
  dataInicio?: string;
  dataFim?: string;
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
}
