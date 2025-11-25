import { z } from 'zod';

/**
 * Validação de nome de material
 */
const nomeMaterialSchema = z
  .string()
  .trim()
  .min(2, 'Nome deve ter no mínimo 2 caracteres')
  .max(200, 'Nome deve ter no máximo 200 caracteres')
  .regex(/^[a-zA-ZÀ-ÿ0-9\s\-_.,:&()]+$/, 'Nome contém caracteres inválidos');

/**
 * Validação de serial
 */
const serialSchema = z
  .string()
  .trim()
  .min(1, 'Serial é obrigatório')
  .max(100, 'Serial deve ter no máximo 100 caracteres')
  .regex(/^[a-zA-Z0-9\-_]+$/, 'Serial deve conter apenas letras, números, hífen e underscore');

/**
 * Schema para material de estoque
 */
export const estoqueSchema = z.object({
  nome: nomeMaterialSchema,
  categoria: z
    .string()
    .trim()
    .min(1, 'Categoria é obrigatória')
    .max(100, 'Categoria deve ter no máximo 100 caracteres'),
  quantidadeTotal: z
    .number()
    .int('Quantidade deve ser um número inteiro')
    .nonnegative('Quantidade não pode ser negativa')
    .max(9999, 'Quantidade máxima excedida'),
  descricao: z
    .string()
    .trim()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional()
    .or(z.literal('')),
  localizacao: z
    .string()
    .trim()
    .max(200, 'Localização deve ter no máximo 200 caracteres')
    .optional()
    .or(z.literal('')),
  valorUnitario: z
    .number()
    .nonnegative('Valor não pode ser negativo')
    .max(9999999.99, 'Valor máximo excedido')
    .optional(),
}).refine(
  (data) => data.quantidadeTotal >= 0,
  {
    message: 'Quantidade total deve ser maior ou igual a zero',
    path: ['quantidadeTotal'],
  }
);

/**
 * Schema para serial de estoque
 */
export const serialEstoqueSchema = z.object({
  materialId: z
    .string()
    .min(1, 'Material é obrigatório'),
  serial: serialSchema,
  localizacao: z
    .string()
    .trim()
    .min(1, 'Localização é obrigatória')
    .max(200, 'Localização deve ter no máximo 200 caracteres')
    .default('Estoque'),
  tags: z
    .array(z.string().trim().min(1).max(50))
    .max(10, 'Máximo de 10 tags por serial')
    .optional()
    .default([]),
  observacoes: z
    .string()
    .trim()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  status: z
    .enum(['disponivel', 'em-uso', 'manutencao', 'perdido', 'consumido'])
    .default('disponivel'),
});

export type EstoqueInput = z.infer<typeof estoqueSchema>;
export type SerialEstoqueInput = z.infer<typeof serialEstoqueSchema>;
