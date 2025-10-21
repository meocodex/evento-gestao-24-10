import { z } from 'zod';

/**
 * Validação de título de demanda
 */
const tituloDemandaSchema = z
  .string()
  .trim()
  .min(5, 'Título deve ter no mínimo 5 caracteres')
  .max(200, 'Título deve ter no máximo 200 caracteres')
  .regex(/^[a-zA-ZÀ-ÿ0-9\s\-_.,:&()!?]+$/, 'Título contém caracteres inválidos');

/**
 * Validação de descrição
 */
const descricaoDemandaSchema = z
  .string()
  .trim()
  .min(10, 'Descrição deve ter no mínimo 10 caracteres')
  .max(2000, 'Descrição deve ter no máximo 2000 caracteres');

/**
 * Schema de categoria de demanda
 */
const categoriaDemandaSchema = z.enum([
  'tecnica',
  'operacional',
  'comercial',
  'financeira',
  'administrativa',
  'reembolso',
  'outra',
], {
  required_error: 'Categoria é obrigatória',
});

/**
 * Schema de prioridade de demanda
 */
const prioridadeDemandaSchema = z.enum([
  'baixa',
  'media',
  'alta',
  'urgente',
], {
  required_error: 'Prioridade é obrigatória',
});

/**
 * Schema completo para criação de demanda
 */
export const demandaSchema = z.object({
  titulo: tituloDemandaSchema,
  descricao: descricaoDemandaSchema,
  categoria: categoriaDemandaSchema,
  prioridade: prioridadeDemandaSchema,
  responsavelId: z
    .string()
    .uuid('Responsável inválido')
    .optional()
    .or(z.literal('')),
  prazo: z
    .string()
    .datetime('Prazo inválido')
    .optional()
    .or(z.literal('')),
  eventoRelacionado: z
    .string()
    .uuid('Evento inválido')
    .optional()
    .or(z.literal('')),
  tags: z
    .array(z.string().trim().max(50))
    .max(10, 'Máximo de 10 tags')
    .default([]),
}).refine(
  (data) => {
    // Se prazo for fornecido, deve ser no futuro
    if (data.prazo && data.prazo.length > 0) {
      const prazoDate = new Date(data.prazo);
      return prazoDate > new Date();
    }
    return true;
  },
  {
    message: 'Prazo deve ser uma data futura',
    path: ['prazo'],
  }
);

/**
 * Schema para reembolso
 */
export const reembolsoSchema = z.object({
  descricao: z
    .string()
    .trim()
    .min(5, 'Descrição deve ter no mínimo 5 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  tipo: z.enum([
    'frete',
    'diaria',
    'hospedagem',
    'combustivel',
    'locacao',
    'alimentacao',
    'outros',
  ]),
  valor: z
    .number()
    .positive('Valor deve ser maior que zero')
    .max(999999.99, 'Valor máximo excedido'),
  observacoes: z
    .string()
    .trim()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional()
    .or(z.literal('')),
});

export type DemandaInput = z.infer<typeof demandaSchema>;
export type ReembolsoInput = z.infer<typeof reembolsoSchema>;
