export interface MaterialEstoque {
  id: string;
  nome: string;
  categoria: string;
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
    quantidadeDisponivel: 8,
    quantidadeTotal: 10,
    unidade: 'un',
    descricao: 'Caixa ativa 15" 1000W'
  },
  {
    id: '2',
    nome: 'Mesa de Som Behringer X32',
    categoria: 'Áudio',
    quantidadeDisponivel: 2,
    quantidadeTotal: 3,
    unidade: 'un',
    descricao: 'Mesa digital 32 canais'
  },
  {
    id: '3',
    nome: 'Microfone Shure SM58',
    categoria: 'Áudio',
    quantidadeDisponivel: 15,
    quantidadeTotal: 20,
    unidade: 'un',
    descricao: 'Microfone dinâmico cardióide'
  },
  {
    id: '4',
    nome: 'Projetor Epson 5000 Lumens',
    categoria: 'Vídeo',
    quantidadeDisponivel: 4,
    quantidadeTotal: 5,
    unidade: 'un',
    descricao: 'Projetor Full HD'
  },
  {
    id: '5',
    nome: 'Tela de Projeção 3x2m',
    categoria: 'Vídeo',
    quantidadeDisponivel: 6,
    quantidadeTotal: 8,
    unidade: 'un',
    descricao: 'Tela tripé retrátil'
  },
  {
    id: '6',
    nome: 'Par LED RGBW 54x3W',
    categoria: 'Iluminação',
    quantidadeDisponivel: 20,
    quantidadeTotal: 30,
    unidade: 'un',
    descricao: 'Refletor LED colorido'
  },
  {
    id: '7',
    nome: 'Moving Head Beam 230W',
    categoria: 'Iluminação',
    quantidadeDisponivel: 8,
    quantidadeTotal: 12,
    unidade: 'un',
    descricao: 'Moving head profissional'
  },
  {
    id: '8',
    nome: 'Cabo XLR 10m',
    categoria: 'Cabeamento',
    quantidadeDisponivel: 45,
    quantidadeTotal: 50,
    unidade: 'un',
    descricao: 'Cabo balanceado profissional'
  },
  {
    id: '9',
    nome: 'Cabo de Força 20m',
    categoria: 'Elétrica',
    quantidadeDisponivel: 30,
    quantidadeTotal: 40,
    unidade: 'un',
    descricao: 'Cabo PP 3x2.5mm'
  },
  {
    id: '10',
    nome: 'Truss Q30 3m',
    categoria: 'Estrutura',
    quantidadeDisponivel: 16,
    quantidadeTotal: 20,
    unidade: 'un',
    descricao: 'Treliça quadrada alumínio'
  },
  {
    id: '11',
    nome: 'Cadeira Plástica Branca',
    categoria: 'Mobiliário',
    quantidadeDisponivel: 150,
    quantidadeTotal: 200,
    unidade: 'un',
    descricao: 'Cadeira sem braço'
  },
  {
    id: '12',
    nome: 'Mesa Redonda 1.5m',
    categoria: 'Mobiliário',
    quantidadeDisponivel: 25,
    quantidadeTotal: 30,
    unidade: 'un',
    descricao: 'Mesa tampo branco'
  },
];
