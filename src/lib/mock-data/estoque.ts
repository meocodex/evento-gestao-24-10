export interface SerialEstoque {
  numero: string;
  status: 'disponivel' | 'em-uso' | 'manutencao';
  localizacao: string;
  eventoId?: string;
  eventoNome?: string;
  ultimaManutencao?: string;
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
}

export const materiaisEstoque: MaterialEstoque[] = [
  {
    id: '1',
    nome: 'Caixa de Som JBL EON 615',
    categoria: 'Áudio',
    seriais: [
      { numero: 'JBL-EON615-001', status: 'disponivel', localizacao: 'Estoque A' },
      { numero: 'JBL-EON615-002', status: 'disponivel', localizacao: 'Estoque A' },
      { numero: 'JBL-EON615-003', status: 'disponivel', localizacao: 'Estoque A' },
      { numero: 'JBL-EON615-004', status: 'disponivel', localizacao: 'Estoque A' },
      { numero: 'JBL-EON615-005', status: 'disponivel', localizacao: 'Estoque A' },
      { numero: 'JBL-EON615-006', status: 'disponivel', localizacao: 'Estoque B' },
      { numero: 'JBL-EON615-007', status: 'disponivel', localizacao: 'Estoque B' },
      { numero: 'JBL-EON615-008', status: 'disponivel', localizacao: 'Estoque B' },
      { numero: 'JBL-EON615-009', status: 'em-uso', localizacao: 'Em uso', eventoNome: 'Evento Teste' },
      { numero: 'JBL-EON615-010', status: 'manutencao', localizacao: 'Em manutenção' },
    ],
    quantidadeDisponivel: 8,
    quantidadeTotal: 10,
    unidade: 'un',
    descricao: 'Caixa ativa 15" 1000W'
  },
  {
    id: '2',
    nome: 'Mesa de Som Behringer X32',
    categoria: 'Áudio',
    seriais: [
      { numero: 'BEHX32-001', status: 'disponivel', localizacao: 'Estoque A' },
      { numero: 'BEHX32-002', status: 'disponivel', localizacao: 'Estoque A' },
      { numero: 'BEHX32-003', status: 'em-uso', localizacao: 'Em uso', eventoNome: 'Festival Rock' },
    ],
    quantidadeDisponivel: 2,
    quantidadeTotal: 3,
    unidade: 'un',
    descricao: 'Mesa digital 32 canais'
  },
  {
    id: '3',
    nome: 'Microfone Shure SM58',
    categoria: 'Áudio',
    seriais: [
      { numero: 'SM58-001', status: 'disponivel', localizacao: 'Estoque A' },
      { numero: 'SM58-002', status: 'disponivel', localizacao: 'Estoque A' },
      { numero: 'SM58-003', status: 'disponivel', localizacao: 'Estoque A' },
      { numero: 'SM58-004', status: 'disponivel', localizacao: 'Estoque A' },
      { numero: 'SM58-005', status: 'disponivel', localizacao: 'Estoque B' },
      { numero: 'SM58-006', status: 'disponivel', localizacao: 'Estoque B' },
      { numero: 'SM58-007', status: 'disponivel', localizacao: 'Estoque B' },
      { numero: 'SM58-008', status: 'disponivel', localizacao: 'Estoque B' },
      { numero: 'SM58-009', status: 'disponivel', localizacao: 'Estoque B' },
      { numero: 'SM58-010', status: 'disponivel', localizacao: 'Estoque B' },
      { numero: 'SM58-011', status: 'disponivel', localizacao: 'Estoque C' },
      { numero: 'SM58-012', status: 'disponivel', localizacao: 'Estoque C' },
      { numero: 'SM58-013', status: 'disponivel', localizacao: 'Estoque C' },
      { numero: 'SM58-014', status: 'disponivel', localizacao: 'Estoque C' },
      { numero: 'SM58-015', status: 'disponivel', localizacao: 'Estoque C' },
      { numero: 'SM58-016', status: 'manutencao', localizacao: 'Em manutenção' },
      { numero: 'SM58-017', status: 'em-uso', localizacao: 'Em uso' },
      { numero: 'SM58-018', status: 'em-uso', localizacao: 'Em uso' },
      { numero: 'SM58-019', status: 'em-uso', localizacao: 'Em uso' },
      { numero: 'SM58-020', status: 'em-uso', localizacao: 'Em uso' },
    ],
    quantidadeDisponivel: 15,
    quantidadeTotal: 20,
    unidade: 'un',
    descricao: 'Microfone dinâmico cardióide'
  },
  {
    id: '4',
    nome: 'Projetor Epson 5000 Lumens',
    categoria: 'Vídeo',
    seriais: [
      { numero: 'EPSON-5K-001', status: 'disponivel', localizacao: 'Estoque A' },
      { numero: 'EPSON-5K-002', status: 'disponivel', localizacao: 'Estoque A' },
      { numero: 'EPSON-5K-003', status: 'disponivel', localizacao: 'Estoque B' },
      { numero: 'EPSON-5K-004', status: 'disponivel', localizacao: 'Estoque B' },
      { numero: 'EPSON-5K-005', status: 'em-uso', localizacao: 'Em uso' },
    ],
    quantidadeDisponivel: 4,
    quantidadeTotal: 5,
    unidade: 'un',
    descricao: 'Projetor Full HD'
  },
  {
    id: '5',
    nome: 'Tela de Projeção 3x2m',
    categoria: 'Vídeo',
    seriais: [
      { numero: 'TELA-3X2-001', status: 'disponivel', localizacao: 'Estoque A' },
      { numero: 'TELA-3X2-002', status: 'disponivel', localizacao: 'Estoque A' },
      { numero: 'TELA-3X2-003', status: 'disponivel', localizacao: 'Estoque A' },
      { numero: 'TELA-3X2-004', status: 'disponivel', localizacao: 'Estoque B' },
      { numero: 'TELA-3X2-005', status: 'disponivel', localizacao: 'Estoque B' },
      { numero: 'TELA-3X2-006', status: 'disponivel', localizacao: 'Estoque B' },
      { numero: 'TELA-3X2-007', status: 'em-uso', localizacao: 'Em uso' },
      { numero: 'TELA-3X2-008', status: 'em-uso', localizacao: 'Em uso' },
    ],
    quantidadeDisponivel: 6,
    quantidadeTotal: 8,
    unidade: 'un',
    descricao: 'Tela tripé retrátil'
  },
  {
    id: '13',
    nome: 'Máquina Stone Modelo P2000',
    categoria: 'Pagamento',
    seriais: [
      { numero: 'SN-P2000-A7X9K2', status: 'disponivel', localizacao: 'Estoque A' },
      { numero: 'SN-P2000-B3M5L8', status: 'disponivel', localizacao: 'Estoque A' },
      { numero: 'SN-P2000-C9R4T1', status: 'disponivel', localizacao: 'Estoque A' },
      { numero: 'SN-P2000-D2N8W6', status: 'disponivel', localizacao: 'Estoque B' },
      { numero: 'SN-P2000-E5K1Q3', status: 'disponivel', localizacao: 'Estoque B' },
      { numero: 'SN-P2000-F8H7P9', status: 'em-uso', localizacao: 'Em uso', eventoNome: 'Feira Tech 2024' },
      { numero: 'SN-P2000-G1J4M2', status: 'manutencao', localizacao: 'Em manutenção' },
      { numero: 'SN-P2000-H6V3Z5', status: 'disponivel', localizacao: 'Estoque C' },
    ],
    quantidadeDisponivel: 6,
    quantidadeTotal: 8,
    unidade: 'un',
    descricao: 'Terminal de pagamento com chip, NFC e Wi-Fi'
  },
  {
    id: '6',
    nome: 'Par LED RGBW 54x3W',
    categoria: 'Iluminação',
    seriais: Array.from({ length: 30 }, (_, i) => ({
      numero: `LED-RGBW-${String(i + 1).padStart(3, '0')}`,
      status: (i < 20 ? 'disponivel' : 'em-uso') as 'disponivel' | 'em-uso' | 'manutencao',
      localizacao: i < 20 ? (i < 10 ? 'Estoque A' : 'Estoque B') : 'Em uso'
    })),
    quantidadeDisponivel: 20,
    quantidadeTotal: 30,
    unidade: 'un',
    descricao: 'Refletor LED colorido'
  },
  {
    id: '7',
    nome: 'Moving Head Beam 230W',
    categoria: 'Iluminação',
    seriais: Array.from({ length: 12 }, (_, i) => ({
      numero: `MH-BEAM-${String(i + 1).padStart(3, '0')}`,
      status: (i < 8 ? 'disponivel' : 'em-uso') as 'disponivel' | 'em-uso' | 'manutencao',
      localizacao: i < 8 ? 'Estoque A' : 'Em uso'
    })),
    quantidadeDisponivel: 8,
    quantidadeTotal: 12,
    unidade: 'un',
    descricao: 'Moving head profissional'
  },
  {
    id: '8',
    nome: 'Cabo XLR 10m',
    categoria: 'Cabeamento',
    seriais: Array.from({ length: 50 }, (_, i) => ({
      numero: `XLR-10M-${String(i + 1).padStart(3, '0')}`,
      status: (i < 45 ? 'disponivel' : 'em-uso') as 'disponivel' | 'em-uso' | 'manutencao',
      localizacao: i < 45 ? 'Estoque Principal' : 'Em uso'
    })),
    quantidadeDisponivel: 45,
    quantidadeTotal: 50,
    unidade: 'un',
    descricao: 'Cabo balanceado profissional'
  },
  {
    id: '9',
    nome: 'Cabo de Força 20m',
    categoria: 'Elétrica',
    seriais: Array.from({ length: 40 }, (_, i) => ({
      numero: `PWR-20M-${String(i + 1).padStart(3, '0')}`,
      status: (i < 30 ? 'disponivel' : 'em-uso') as 'disponivel' | 'em-uso' | 'manutencao',
      localizacao: i < 30 ? 'Estoque Principal' : 'Em uso'
    })),
    quantidadeDisponivel: 30,
    quantidadeTotal: 40,
    unidade: 'un',
    descricao: 'Cabo PP 3x2.5mm'
  },
  {
    id: '10',
    nome: 'Truss Q30 3m',
    categoria: 'Estrutura',
    seriais: Array.from({ length: 20 }, (_, i) => ({
      numero: `TRUSS-Q30-${String(i + 1).padStart(3, '0')}`,
      status: (i < 16 ? 'disponivel' : 'em-uso') as 'disponivel' | 'em-uso' | 'manutencao',
      localizacao: i < 16 ? 'Estoque Estruturas' : 'Em uso'
    })),
    quantidadeDisponivel: 16,
    quantidadeTotal: 20,
    unidade: 'un',
    descricao: 'Treliça quadrada alumínio'
  },
  {
    id: '11',
    nome: 'Cadeira Plástica Branca',
    categoria: 'Mobiliário',
    seriais: Array.from({ length: 200 }, (_, i) => ({
      numero: `CADEIRA-${String(i + 1).padStart(4, '0')}`,
      status: (i < 150 ? 'disponivel' : 'em-uso') as 'disponivel' | 'em-uso' | 'manutencao',
      localizacao: i < 150 ? 'Estoque Mobiliário' : 'Em uso'
    })),
    quantidadeDisponivel: 150,
    quantidadeTotal: 200,
    unidade: 'un',
    descricao: 'Cadeira sem braço'
  },
  {
    id: '12',
    nome: 'Mesa Redonda 1.5m',
    categoria: 'Mobiliário',
    seriais: Array.from({ length: 30 }, (_, i) => ({
      numero: `MESA-RD-${String(i + 1).padStart(3, '0')}`,
      status: (i < 25 ? 'disponivel' : 'em-uso') as 'disponivel' | 'em-uso' | 'manutencao',
      localizacao: i < 25 ? 'Estoque Mobiliário' : 'Em uso'
    })),
    quantidadeDisponivel: 25,
    quantidadeTotal: 30,
    unidade: 'un',
    descricao: 'Mesa tampo branco'
  },
];
