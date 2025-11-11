import { describe, it, expect } from 'vitest';
import { loginSchema, signupSchema } from '../auth';

describe('Validações de Autenticação', () => {
  describe('loginSchema', () => {
    it('deve validar login com dados corretos', () => {
      const result = loginSchema.safeParse({
        email: 'teste@exemplo.com',
        password: 'senha123'
      });
      
      expect(result.success).toBe(true);
    });

    it('deve rejeitar email inválido', () => {
      const result = loginSchema.safeParse({
        email: 'email-invalido',
        password: 'senha123'
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('email');
      }
    });

    it('deve rejeitar senha vazia', () => {
      const result = loginSchema.safeParse({
        email: 'teste@exemplo.com',
        password: ''
      });
      
      expect(result.success).toBe(false);
    });

    it('deve rejeitar email vazio', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: 'senha123'
      });
      
      expect(result.success).toBe(false);
    });
  });

  describe('signupSchema', () => {
    it('deve validar cadastro com dados corretos', () => {
      const result = signupSchema.safeParse({
        email: 'novo@exemplo.com',
        password: 'SenhaSegura123!',
        confirmPassword: 'SenhaSegura123!',
        nome: 'Usuário Teste',
        role: 'operacional'
      });
      
      expect(result.success).toBe(true);
    });

    it('deve rejeitar senhas que não coincidem', () => {
      const result = signupSchema.safeParse({
        email: 'novo@exemplo.com',
        password: 'senha123',
        confirmPassword: 'senha456',
        nome: 'Usuário Teste',
        role: 'operacional'
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.message.toLowerCase().includes('senha'))).toBe(true);
      }
    });

    it('deve validar tamanho mínimo da senha', () => {
      const result = signupSchema.safeParse({
        email: 'novo@exemplo.com',
        password: '123',
        confirmPassword: '123',
        nome: 'Usuário Teste',
        role: 'operacional'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar nome obrigatório', () => {
      const result = signupSchema.safeParse({
        email: 'novo@exemplo.com',
        password: 'SenhaSegura123!',
        confirmPassword: 'SenhaSegura123!',
        nome: '',
        role: 'operacional'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar role obrigatório', () => {
      const result = signupSchema.safeParse({
        email: 'novo@exemplo.com',
        password: 'SenhaSegura123!',
        confirmPassword: 'SenhaSegura123!',
        nome: 'Usuário Teste'
      });
      
      expect(result.success).toBe(false);
    });
  });
});
