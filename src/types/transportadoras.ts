export interface Transportadora {
  id: string;
  nome: string;
  cnpj: string;
  razaoSocial: string;
  telefone: string;
  email: string;
  responsavel: string;
  status: 'ativa' | 'inativa';
  endereco: {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  dadosBancarios?: {
    banco: string;
    agencia: string;
    conta: string;
    tipoConta: 'corrente' | 'poupanca';
  };
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Envio {
  id: string;
  transportadoraId: string;
  eventoId: string;
  tipo: 'ida' | 'volta';
  status: 'pendente' | 'em_transito' | 'entregue' | 'cancelado';
  dataColeta?: string;
  dataEntrega?: string;
  dataEntregaPrevista: string;
  origem: string;
  destino: string;
  rastreio?: string;
  valor?: number;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
}
