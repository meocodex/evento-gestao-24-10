export interface RotaAtendida {
  id: string;
  cidadeDestino: string;
  estadoDestino: string;
  prazoEntrega: number; // dias
  valorBase?: number;
  ativa: boolean;
}

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
  rotasAtendidas: RotaAtendida[];
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
  formaPagamento: 'antecipado' | 'na_entrega' | 'a_combinar';
  comprovantePagamento?: string;
  despesaEventoId?: string;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
}
