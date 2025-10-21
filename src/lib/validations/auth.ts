import { z } from 'zod';

/**
 * Validação robusta de senha seguindo OWASP guidelines
 * - Mínimo 8 caracteres
 * - Pelo menos uma letra maiúscula
 * - Pelo menos uma letra minúscula
 * - Pelo menos um número
 * - Pelo menos um caractere especial
 */
export const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter no mínimo 8 caracteres')
  .max(128, 'A senha deve ter no máximo 128 caracteres')
  .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
  .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
  .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
  .regex(/[^a-zA-Z0-9]/, 'A senha deve conter pelo menos um caractere especial (!@#$%^&*)')
  .refine(
    (password) => {
      // Prevenir senhas comuns
      const commonPasswords = [
        'Password1!',
        'Admin123!',
        'Welcome1!',
        '12345678!',
        'Qwerty123!',
      ];
      return !commonPasswords.includes(password);
    },
    { message: 'Senha muito comum. Escolha uma senha mais segura.' }
  );

/**
 * Validação de email com sanitização
 */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Email inválido')
  .max(255, 'Email deve ter no máximo 255 caracteres')
  .refine(
    (email) => {
      // Validar domínio básico
      const parts = email.split('@');
      if (parts.length !== 2) return false;
      const domain = parts[1];
      return domain.includes('.') && domain.length > 3;
    },
    { message: 'Email inválido' }
  );

/**
 * Validação de nome com sanitização
 */
export const nomeSchema = z
  .string()
  .trim()
  .min(2, 'Nome deve ter no mínimo 2 caracteres')
  .max(100, 'Nome deve ter no máximo 100 caracteres')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nome contém caracteres inválidos');

/**
 * Schema de Login
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
});

/**
 * Schema de Signup
 */
export const signupSchema = z.object({
  nome: nomeSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
