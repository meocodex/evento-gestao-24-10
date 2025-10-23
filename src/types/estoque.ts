export interface SerialEstoque {
  numero: string;
  status: 'disponivel' | 'em-uso' | 'manutencao';
  localizacao: string;
  eventoId?: string;
  eventoNome?: string;
  ultimaManutencao?: string;
  dataAquisicao?: string;
  observacoes?: string;
}

export interface MaterialEstoque {
  id: string;
  nome: string;
  categoria: string;
  seriais: SerialEstoque[];
  quantidadeDisponivel: number;
  quantidadeTotal: number;
  unidade: string;
  descricao?: string;
  foto?: string;
  valorUnitario?: number;
}

export interface FiltrosEstoque {
  busca: string;
  categoria: string;
  status: 'todos' | 'disponivel' | 'em-uso' | 'manutencao';
  localizacao: string;
}
