export type TipoControle = 'serial' | 'quantidade';

export type StatusDevolucao = 
  | 'pendente' 
  | 'devolvido_ok' 
  | 'devolvido_danificado' 
  | 'perdido' 
  | 'consumido';

export interface SerialEstoque {
  numero: string;
  status: 'disponivel' | 'em-uso' | 'manutencao' | 'perdido' | 'consumido';
  localizacao: string;
  tags?: string[];
  eventoId?: string;
  eventoNome?: string;
  tipoEnvio?: 'antecipado' | 'com_tecnicos';
  ultimaManutencao?: string;
  dataAquisicao?: string;
  observacoes?: string;
  perdidoEm?: string; // evento_id onde foi perdido
  dataPerda?: string;
  motivoPerda?: string;
  fotosPerda?: string[];
}

export interface MaterialEstoque {
  id: string;
  nome: string;
  categoria: string;
  tipoControle: TipoControle;
  seriais?: SerialEstoque[];
  quantidadeDisponivel: number;
  quantidadeTotal: number;
  unidade?: string;
  descricao?: string;
  foto?: string;
  valorUnitario?: number;
}

export interface FiltrosEstoque {
  busca?: string;
  categoria?: string;
  status?: 'todos' | 'disponivel' | 'em-uso' | 'manutencao' | 'perdido';
  localizacao?: string;
}

export interface DevolucaoInput {
  alocacaoId: string;
  statusDevolucao: StatusDevolucao;
  observacoes: string;
  fotos?: string[];
}

export interface HistoricoMovimentacao {
  id: string;
  materialId: string;
  serialNumero?: string;
  eventoId?: string;
  eventoNome?: string;
  tipoOperacao: 'alocacao' | 'devolucao_ok' | 'devolucao_danificado' | 'perda' | 'consumo' | 'entrada_estoque' | 'ajuste_inventario' | 'manutencao_iniciada' | 'manutencao_concluida';
  quantidade?: number;
  tipoEnvio?: 'antecipado' | 'com_tecnicos';
  transportadora?: string;
  responsavel?: string;
  dataMovimentacao: string;
  observacoes?: string;
  fotosComprovantes?: string[];
}

export interface DadosRetirada {
  retiradoPorNome: string;
  retiradoPorDocumento: string;
  retiradoPorTelefone: string;
  materiais: {
    serial: string;
    nome: string;
    localizacao: string;
    valorDeclarado?: number;
  }[];
  eventoNome: string;
  eventoLocal: string;
  eventoData: string;
  eventoHora: string;
  dadosEmpresa: {
    nome: string;
    cnpj: string;
    telefone: string;
    endereco: string;
  };
}

export interface DadosDeclaracaoTransporte {
  remetenteTipo: 'empresa' | 'membro_equipe';
  remetenteNome: string;
  remetenteDocumento: string;
  remetenteTelefone: string;
  remetenteEndereco?: string;
  remetenteVinculo?: string;
  
  destinatarioNome: string;
  destinatarioDocumento: string;
  destinatarioTelefone: string;
  destinatarioEndereco: string;
  
  transportadoraNome?: string;
  transportadoraCNPJ?: string;
  transportadoraTelefone?: string;
  
  materiais: {
    serial: string;
    nome: string;
    valorDeclarado: number;
  }[];
  
  eventoNome: string;
  eventoLocal: string;
  eventoData: string;
  eventoHora: string;
  observacoes?: string;
}

// Interface para dados do remetente em alocações
export interface DadosRemetente {
  nome: string;
  documento: string;
  telefone: string;
  endereco?: string;
  vinculo?: string;
}

// Interface para dados do destinatário em alocações
export interface DadosDestinatario {
  nome: string;
  documento: string;
  telefone: string;
  endereco: string;
}

// Interface para dados da transportadora em alocações
export interface DadosTransportadoraEnvio {
  nome?: string;
  cnpj?: string;
  telefone?: string;
}

export interface MaterialAlocado {
  id: string;
  eventoId: string;
  itemId: string;
  nome: string;
  serial?: string;
  tipoEnvio: 'antecipado' | 'com_tecnicos';
  transportadora?: string;
  responsavel?: string;
  quantidadeAlocada: number;
  quantidadeDevolvida: number;
  statusDevolucao: StatusDevolucao;
  dataDevolucao?: string;
  observacoesDevolucao?: string;
  fotosDevolucao?: string[];
  
  // Novos campos para documentos de transporte
  retiradoPorNome?: string;
  retiradoPorDocumento?: string;
  retiradoPorTelefone?: string;
  termoRetiradaUrl?: string;
  dataRetirada?: string;
  
  declaracaoTransporteUrl?: string;
  valorDeclarado?: number;
  remetenteTipo?: 'empresa' | 'membro_equipe';
  remetenteMembroId?: string;
  remetenteDados?: DadosRemetente;
  dadosDestinatario?: DadosDestinatario;
  dadosTransportadora?: DadosTransportadoraEnvio;
  observacoesTransporte?: string;
  
  envioId?: string;
}
