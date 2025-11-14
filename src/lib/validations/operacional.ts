import { z } from 'zod';
import { validarCPF } from './cliente';

/**
 * Schema de validação para operacional
 */
export const operacionalSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  cpf: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || validarCPF(val), {
      message: 'CPF inválido',
    }),
  telefone: z
    .string()
    .trim()
    .min(10, 'Telefone deve ter no mínimo 10 dígitos')
    .max(15, 'Telefone deve ter no máximo 15 dígitos'),
  whatsapp: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .optional()
    .or(z.literal('')),
  funcao_principal: z
    .string()
    .min(1, 'Função principal é obrigatória'),
  tipo_vinculo: z.enum(['clt', 'freelancer', 'pj'], {
    required_error: 'Tipo de vínculo é obrigatório',
  }),
  cnpj_pj: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  observacoes: z
    .string()
    .trim()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => data.tipo_vinculo !== 'pj' || data.cnpj_pj,
  {
    message: 'CNPJ é obrigatório para vínculos PJ',
    path: ['cnpj_pj'],
  }
);

export type OperacionalInput = z.infer<typeof operacionalSchema>;
