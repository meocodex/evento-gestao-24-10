export interface SerialEstoque {
  serial: string;
  disponivel: boolean;
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
      { serial: 'JBL-EON615-001', disponivel: true, localizacao: 'Estoque A' },
      { serial: 'JBL-EON615-002', disponivel: true, localizacao: 'Estoque A' },
      { serial: 'JBL-EON615-003', disponivel: true, localizacao: 'Estoque A' },
      { serial: 'JBL-EON615-004', disponivel: true, localizacao: 'Estoque A' },
      { serial: 'JBL-EON615-005', disponivel: true, localizacao: 'Estoque A' },
      { serial: 'JBL-EON615-006', disponivel: true, localizacao: 'Estoque B' },
      { serial: 'JBL-EON615-007', disponivel: true, localizacao: 'Estoque B' },
      { serial: 'JBL-EON615-008', disponivel: true, localizacao: 'Estoque B' },
      { serial: 'JBL-EON615-009', disponivel: false, localizacao: 'Em uso', eventoNome: 'Evento Teste' },
      { serial: 'JBL-EON615-010', disponivel: false, localizacao: 'Em manutenção' },
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
      { serial: 'BEHX32-001', disponivel: true, localizacao: 'Estoque A' },
      { serial: 'BEHX32-002', disponivel: true, localizacao: 'Estoque A' },
      { serial: 'BEHX32-003', disponivel: false, localizacao: 'Em uso', eventoNome: 'Festival Rock' },
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
      { serial: 'SM58-001', disponivel: true, localizacao: 'Estoque A' },
      { serial: 'SM58-002', disponivel: true, localizacao: 'Estoque A' },
      { serial: 'SM58-003', disponivel: true, localizacao: 'Estoque A' },
      { serial: 'SM58-004', disponivel: true, localizacao: 'Estoque A' },
      { serial: 'SM58-005', disponivel: true, localizacao: 'Estoque B' },
      { serial: 'SM58-006', disponivel: true, localizacao: 'Estoque B' },
      { serial: 'SM58-007', disponivel: true, localizacao: 'Estoque B' },
      { serial: 'SM58-008', disponivel: true, localizacao: 'Estoque B' },
      { serial: 'SM58-009', disponivel: true, localizacao: 'Estoque B' },
      { serial: 'SM58-010', disponivel: true, localizacao: 'Estoque B' },
      { serial: 'SM58-011', disponivel: true, localizacao: 'Estoque C' },
      { serial: 'SM58-012', disponivel: true, localizacao: 'Estoque C' },
      { serial: 'SM58-013', disponivel: true, localizacao: 'Estoque C' },
      { serial: 'SM58-014', disponivel: true, localizacao: 'Estoque C' },
      { serial: 'SM58-015', disponivel: true, localizacao: 'Estoque C' },
      { serial: 'SM58-016', disponivel: false, localizacao: 'Em manutenção' },
      { serial: 'SM58-017', disponivel: false, localizacao: 'Em uso' },
      { serial: 'SM58-018', disponivel: false, localizacao: 'Em uso' },
      { serial: 'SM58-019', disponivel: false, localizacao: 'Em uso' },
      { serial: 'SM58-020', disponivel: false, localizacao: 'Em uso' },
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
      { serial: 'EPSON-5K-001', disponivel: true, localizacao: 'Estoque A' },
      { serial: 'EPSON-5K-002', disponivel: true, localizacao: 'Estoque A' },
      { serial: 'EPSON-5K-003', disponivel: true, localizacao: 'Estoque B' },
      { serial: 'EPSON-5K-004', disponivel: true, localizacao: 'Estoque B' },
      { serial: 'EPSON-5K-005', disponivel: false, localizacao: 'Em uso' },
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
      { serial: 'TELA-3X2-001', disponivel: true, localizacao: 'Estoque A' },
      { serial: 'TELA-3X2-002', disponivel: true, localizacao: 'Estoque A' },
      { serial: 'TELA-3X2-003', disponivel: true, localizacao: 'Estoque A' },
      { serial: 'TELA-3X2-004', disponivel: true, localizacao: 'Estoque B' },
      { serial: 'TELA-3X2-005', disponivel: true, localizacao: 'Estoque B' },
      { serial: 'TELA-3X2-006', disponivel: true, localizacao: 'Estoque B' },
      { serial: 'TELA-3X2-007', disponivel: false, localizacao: 'Em uso' },
      { serial: 'TELA-3X2-008', disponivel: false, localizacao: 'Em uso' },
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
      { serial: 'SN-P2000-A7X9K2', disponivel: true, localizacao: 'Estoque A' },
      { serial: 'SN-P2000-B3M5L8', disponivel: true, localizacao: 'Estoque A' },
      { serial: 'SN-P2000-C9R4T1', disponivel: true, localizacao: 'Estoque A' },
      { serial: 'SN-P2000-D2N8W6', disponivel: true, localizacao: 'Estoque B' },
      { serial: 'SN-P2000-E5K1Q3', disponivel: true, localizacao: 'Estoque B' },
      { serial: 'SN-P2000-F8H7P9', disponivel: false, localizacao: 'Em uso', eventoNome: 'Feira Tech 2024' },
      { serial: 'SN-P2000-G1J4M2', disponivel: false, localizacao: 'Em manutenção' },
      { serial: 'SN-P2000-H6V3Z5', disponivel: true, localizacao: 'Estoque C' },
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
      serial: `LED-RGBW-${String(i + 1).padStart(3, '0')}`,
      disponivel: i < 20,
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
      serial: `MH-BEAM-${String(i + 1).padStart(3, '0')}`,
      disponivel: i < 8,
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
      serial: `XLR-10M-${String(i + 1).padStart(3, '0')}`,
      disponivel: i < 45,
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
      serial: `PWR-20M-${String(i + 1).padStart(3, '0')}`,
      disponivel: i < 30,
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
      serial: `TRUSS-Q30-${String(i + 1).padStart(3, '0')}`,
      disponivel: i < 16,
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
      serial: `CADEIRA-${String(i + 1).padStart(4, '0')}`,
      disponivel: i < 150,
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
      serial: `MESA-RD-${String(i + 1).padStart(3, '0')}`,
      disponivel: i < 25,
      localizacao: i < 25 ? 'Estoque Mobiliário' : 'Em uso'
    })),
    quantidadeDisponivel: 25,
    quantidadeTotal: 30,
    unidade: 'un',
    descricao: 'Mesa tampo branco'
  },
];
