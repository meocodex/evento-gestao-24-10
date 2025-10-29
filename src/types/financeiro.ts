export type RecorrenciaFinanceiro = 'unico' | 'semanal' | 'quinzenal' | 'mensal' | 'anual';
export type StatusContaPagar = 'pendente' | 'pago' | 'vencido' | 'cancelado';
export type StatusContaReceber = 'pendente' | 'recebido' | 'vencido' | 'cancelado';
export type FormaPagamento = 'PIX' | 'Boleto' | 'Transferência' | 'Cartão' | 'Dinheiro';
export type TipoContaReceber = 'venda' | 'locacao' | 'servico' | 'outros';

export interface AnexoFinanceiro {
  nome: string;
  url: string;
  tipo: string;
  tamanho: number;
  uploadEm: string;
}

export interface ContaPagar {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  quantidade: number;
  valor_unitario: number;
  recorrencia: RecorrenciaFinanceiro;
  data_vencimento: string;
  data_pagamento?: string;
  status: StatusContaPagar;
  forma_pagamento?: FormaPagamento;
  fornecedor?: string;
  responsavel?: string;
  observacoes?: string;
  anexos: AnexoFinanceiro[];
  recorrencia_origem_id?: string;
  proxima_data_geracao?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ContaReceber {
  id: string;
  descricao: string;
  tipo: TipoContaReceber;
  valor: number;
  quantidade: number;
  valor_unitario: number;
  recorrencia: RecorrenciaFinanceiro;
  data_vencimento: string;
  data_recebimento?: string;
  status: StatusContaReceber;
  forma_recebimento?: FormaPagamento;
  cliente?: string;
  responsavel?: string;
  observacoes?: string;
  anexos: AnexoFinanceiro[];
  recorrencia_origem_id?: string;
  proxima_data_geracao?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}
