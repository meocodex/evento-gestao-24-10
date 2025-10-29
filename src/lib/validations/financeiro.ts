import { z } from 'zod';

export const contaPagarSchema = z.object({
  descricao: z.string()
    .min(3, 'Descrição deve ter no mínimo 3 caracteres')
    .max(200, 'Descrição muito longa'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  quantidade: z.number()
    .int('Quantidade deve ser inteiro')
    .positive('Quantidade deve ser maior que zero'),
  valor_unitario: z.number()
    .positive('Valor unitário deve ser maior que zero'),
  recorrencia: z.enum(['unico', 'semanal', 'quinzenal', 'mensal', 'anual']),
  data_vencimento: z.string()
    .refine(val => !isNaN(Date.parse(val)), 'Data inválida'),
  status: z.enum(['pendente', 'pago', 'vencido', 'cancelado']),
  data_pagamento: z.string().optional(),
  forma_pagamento: z.string().optional(),
  fornecedor: z.string().max(100).optional(),
  responsavel: z.string().max(100).optional(),
  observacoes: z.string().max(500).optional(),
  anexos: z.array(z.object({
    nome: z.string(),
    url: z.string().url(),
    tipo: z.string(),
    tamanho: z.number(),
    uploadEm: z.string(),
  })).optional(),
}).refine(
  (data) => {
    if (data.status === 'pago') {
      return !!data.data_pagamento && !!data.forma_pagamento;
    }
    return true;
  },
  {
    message: 'Data de pagamento e forma de pagamento são obrigatórios quando status é "pago"',
    path: ['data_pagamento'],
  }
);

export const contaReceberSchema = z.object({
  descricao: z.string()
    .min(3, 'Descrição deve ter no mínimo 3 caracteres')
    .max(200, 'Descrição muito longa'),
  tipo: z.enum(['venda', 'locacao', 'servico', 'outros']),
  quantidade: z.number()
    .int('Quantidade deve ser inteiro')
    .positive('Quantidade deve ser maior que zero'),
  valor_unitario: z.number()
    .positive('Valor unitário deve ser maior que zero'),
  recorrencia: z.enum(['unico', 'semanal', 'quinzenal', 'mensal', 'anual']),
  data_vencimento: z.string()
    .refine(val => !isNaN(Date.parse(val)), 'Data inválida'),
  status: z.enum(['pendente', 'recebido', 'vencido', 'cancelado']),
  data_recebimento: z.string().optional(),
  forma_recebimento: z.string().optional(),
  cliente: z.string().max(100).optional(),
  responsavel: z.string().max(100).optional(),
  observacoes: z.string().max(500).optional(),
  anexos: z.array(z.object({
    nome: z.string(),
    url: z.string().url(),
    tipo: z.string(),
    tamanho: z.number(),
    uploadEm: z.string(),
  })).optional(),
}).refine(
  (data) => {
    if (data.status === 'recebido') {
      return !!data.data_recebimento && !!data.forma_recebimento;
    }
    return true;
  },
  {
    message: 'Data de recebimento e forma de recebimento são obrigatórios quando status é "recebido"',
    path: ['data_recebimento'],
  }
);
