import type { Evento } from '@/types/eventos';
import type { ContaPagar, AnexoFinanceiro } from '@/types/financeiro';

/**
 * Cria um mock de Evento com valores padrão válidos
 */
export const createMockEvento = (overrides?: Partial<Evento>): Evento => ({
  id: 'evento-test-1',
  nome: 'Evento Teste',
  dataInicio: '2024-01-15',
  dataFim: '2024-01-15',
  horaInicio: '18:00',
  horaFim: '23:00',
  local: 'Local Teste',
  cidade: 'São Paulo',
  estado: 'SP',
  endereco: 'Rua Teste, 123',
  cliente: {
    id: 'cliente-1',
    nome: 'Cliente Teste',
    tipo: 'CNPJ',
    documento: '12345678000190',
    telefone: '11999999999',
    email: 'cliente@teste.com',
    endereco: {
      cep: '01310-100',
      logradouro: 'Av Paulista',
      numero: '1000',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
    },
  },
  comercial: {
    id: 'comercial-1',
    nome: 'Comercial Teste',
    email: 'comercial@teste.com',
  },
  status: 'orcamento',
  tipoEvento: 'bar',
  tags: [],
  checklist: [],
  materiaisAlocados: {
    antecipado: [],
    comTecnicos: [],
  },
  financeiro: {
    receitas: [],
    despesas: [],
    cobrancas: [],
  },
  timeline: [],
  equipe: [],
  observacoesOperacionais: [],
  criadoEm: '2024-01-01T00:00:00Z',
  atualizadoEm: '2024-01-01T00:00:00Z',
  arquivado: false,
  ...overrides,
});

/**
 * Cria um mock de AnexoFinanceiro
 */
export const createMockAnexo = (overrides?: Partial<AnexoFinanceiro>): AnexoFinanceiro => ({
  nome: 'documento.pdf',
  url: 'https://storage.example.com/documento.pdf',
  tipo: 'application/pdf',
  tamanho: 1024000,
  uploadEm: '2024-01-01T00:00:00Z',
  ...overrides,
});

/**
 * Cria um mock de ContaPagar com valores padrão válidos
 */
export const createMockContaPagar = (overrides?: Partial<ContaPagar>): ContaPagar => ({
  id: 'conta-1',
  descricao: 'Conta Teste',
  categoria: 'Utilidades',
  valor: 150.50,
  quantidade: 1,
  valor_unitario: 150.50,
  recorrencia: 'unico',
  data_vencimento: '2024-01-20',
  status: 'pendente',
  anexos: [],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});
