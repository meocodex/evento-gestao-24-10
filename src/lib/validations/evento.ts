import { z } from 'zod';

/**
 * Validação de CEP brasileiro
 */
const cepSchema = z
  .string()
  .trim()
  .regex(/^\d{5}-?\d{3}$/, 'CEP inválido')
  .transform(val => val.replace(/\D/g, ''));

/**
 * Validação de nome de evento
 */
const nomeEventoSchema = z
  .string()
  .trim()
  .min(3, 'Nome deve ter no mínimo 3 caracteres')
  .max(200, 'Nome deve ter no máximo 200 caracteres')
  .regex(/^[a-zA-ZÀ-ÿ0-9\s\-_.,:&()]+$/, 'Nome contém caracteres inválidos');

/**
 * Validação de endereço
 */
const enderecoSchema = z.object({
  cep: cepSchema.optional(),
  logradouro: z
    .string()
    .trim()
    .min(3, 'Logradouro deve ter no mínimo 3 caracteres')
    .max(200, 'Logradouro deve ter no máximo 200 caracteres'),
  numero: z
    .string()
    .trim()
    .min(1, 'Número é obrigatório')
    .max(10, 'Número deve ter no máximo 10 caracteres'),
  complemento: z
    .string()
    .trim()
    .max(100, 'Complemento deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),
  bairro: z
    .string()
    .trim()
    .min(2, 'Bairro deve ter no mínimo 2 caracteres')
    .max(100, 'Bairro deve ter no máximo 100 caracteres'),
  cidade: z
    .string()
    .trim()
    .min(2, 'Cidade deve ter no mínimo 2 caracteres')
    .max(100, 'Cidade deve ter no máximo 100 caracteres'),
  estado: z
    .string()
    .trim()
    .length(2, 'Estado deve ter 2 caracteres (UF)')
    .regex(/^[A-Z]{2}$/, 'Estado deve ser uma UF válida (ex: SP, RJ)'),
});

/**
 * Validação de data e hora
 */
const dataHoraSchema = z.object({
  dataInicio: z.date({
    required_error: 'Data de início é obrigatória',
    invalid_type_error: 'Data de início inválida',
  }),
  dataFim: z.date({
    required_error: 'Data de término é obrigatória',
    invalid_type_error: 'Data de término inválida',
  }),
  horaInicio: z
    .string()
    .trim()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Hora de início inválida (use formato HH:MM)'),
  horaFim: z
    .string()
    .trim()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Hora de término inválida (use formato HH:MM)'),
}).refine(
  (data) => data.dataFim >= data.dataInicio,
  {
    message: 'Data de término não pode ser anterior à data de início',
    path: ['dataFim'],
  }
);

/**
 * Schema completo para criação de evento
 */
export const eventoSchema = z.object({
  nome: nomeEventoSchema,
  tipoEvento: z.enum(['bar', 'ingresso', 'hibrido'], {
    required_error: 'Tipo de evento é obrigatório',
  }),
  dataInicio: z.date({
    required_error: 'Data de início é obrigatória',
  }),
  dataFim: z.date({
    required_error: 'Data de término é obrigatória',
  }),
  horaInicio: z
    .string()
    .trim()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Hora inválida (HH:MM)'),
  horaFim: z
    .string()
    .trim()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Hora inválida (HH:MM)'),
  local: z
    .string()
    .trim()
    .min(2, 'Local deve ter no mínimo 2 caracteres')
    .max(200, 'Local deve ter no máximo 200 caracteres'),
  cidade: z
    .string()
    .trim()
    .min(2, 'Cidade é obrigatória')
    .max(100, 'Cidade deve ter no máximo 100 caracteres'),
  estado: z
    .string()
    .trim()
    .length(2, 'Estado deve ter 2 caracteres')
    .regex(/^[A-Z]{2}$/, 'Estado inválido (ex: SP)'),
  endereco: z
    .string()
    .trim()
    .min(5, 'Endereço deve ter no mínimo 5 caracteres')
    .max(300, 'Endereço deve ter no máximo 300 caracteres'),
  clienteId: z
    .string()
    .uuid('Cliente inválido')
    .min(1, 'Cliente é obrigatório'),
  comercialId: z
    .string()
    .uuid('Comercial inválido')
    .min(1, 'Comercial é obrigatório'),
  tags: z
    .array(z.string().trim().max(50))
    .max(10, 'Máximo de 10 tags'),
  descricao: z
    .string()
    .trim()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional()
    .or(z.literal('')),
  observacoes: z
    .string()
    .trim()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional()
    .or(z.literal('')),
  contatosAdicionais: z
    .string()
    .trim()
    .max(500, 'Contatos adicionais devem ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  redesSociais: z
    .string()
    .trim()
    .max(500, 'Redes sociais devem ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => data.dataFim >= data.dataInicio,
  {
    message: 'Data de término não pode ser anterior à data de início',
    path: ['dataFim'],
  }
);

export type EventoInput = z.infer<typeof eventoSchema>;
