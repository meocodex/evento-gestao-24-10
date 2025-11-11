import { describe, it, expect } from 'vitest';
import { clienteSchema, validarCPF, validarCNPJ, formatarDocumento, formatarTelefone, formatarCEP } from '../cliente';

describe('Validações de Cliente', () => {
  describe('validarCPF', () => {
    it('deve validar CPF correto', () => {
      expect(validarCPF('12345678909')).toBe(true);
    });

    it('deve rejeitar CPF com todos dígitos iguais', () => {
      expect(validarCPF('11111111111')).toBe(false);
      expect(validarCPF('00000000000')).toBe(false);
    });

    it('deve rejeitar CPF com tamanho incorreto', () => {
      expect(validarCPF('123')).toBe(false);
      expect(validarCPF('123456789012345')).toBe(false);
    });

    it('deve validar CPF com formatação', () => {
      expect(validarCPF('123.456.789-09')).toBe(true);
    });
  });

  describe('validarCNPJ', () => {
    it('deve validar CNPJ correto', () => {
      expect(validarCNPJ('11222333000181')).toBe(true);
    });

    it('deve rejeitar CNPJ com todos dígitos iguais', () => {
      expect(validarCNPJ('11111111111111')).toBe(false);
      expect(validarCNPJ('00000000000000')).toBe(false);
    });

    it('deve rejeitar CNPJ com tamanho incorreto', () => {
      expect(validarCNPJ('123')).toBe(false);
    });

    it('deve validar CNPJ com formatação', () => {
      expect(validarCNPJ('11.222.333/0001-81')).toBe(true);
    });
  });

  describe('formatarDocumento', () => {
    it('deve formatar CPF', () => {
      expect(formatarDocumento('12345678909', 'CPF')).toBe('123.456.789-09');
    });

    it('deve formatar CNPJ', () => {
      expect(formatarDocumento('11222333000181', 'CNPJ')).toBe('11.222.333/0001-81');
    });
  });

  describe('formatarTelefone', () => {
    it('deve formatar telefone com DDD', () => {
      expect(formatarTelefone('11999999999')).toBe('(11) 99999-9999');
    });

    it('deve formatar telefone fixo', () => {
      expect(formatarTelefone('1133334444')).toBe('(11) 3333-4444');
    });
  });

  describe('formatarCEP', () => {
    it('deve formatar CEP', () => {
      expect(formatarCEP('01310100')).toBe('01310-100');
    });
  });

  describe('clienteSchema', () => {
    it('deve validar cliente PF com dados corretos', () => {
      const result = clienteSchema.safeParse({
        nome: 'João Silva',
        tipo: 'CPF',
        documento: '12345678909',
        email: 'joao@exemplo.com',
        telefone: '11999999999',
        endereco: {
          cep: '01310100',
          logradouro: 'Av. Paulista',
          numero: '1000',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          estado: 'SP'
        }
      });
      
      expect(result.success).toBe(true);
    });

    it('deve validar cliente PJ com dados corretos', () => {
      const result = clienteSchema.safeParse({
        nome: 'Empresa LTDA',
        tipo: 'CNPJ',
        documento: '11222333000181',
        email: 'contato@empresa.com',
        telefone: '1133334444',
        endereco: {
          cep: '01310100',
          logradouro: 'Av. Paulista',
          numero: '2000',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          estado: 'SP'
        }
      });
      
      expect(result.success).toBe(true);
    });

    it('deve rejeitar CPF inválido para PF', () => {
      const result = clienteSchema.safeParse({
        nome: 'João Silva',
        tipo: 'CPF',
        documento: '00000000000',
        email: 'joao@exemplo.com',
        telefone: '11999999999',
        endereco: {
          cep: '01310100',
          logradouro: 'Av. Paulista',
          numero: '1000',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          estado: 'SP'
        }
      });
      
      expect(result.success).toBe(false);
    });

    it('deve rejeitar CNPJ inválido para PJ', () => {
      const result = clienteSchema.safeParse({
        nome: 'Empresa LTDA',
        tipo: 'CNPJ',
        documento: '00000000000000',
        email: 'contato@empresa.com',
        telefone: '1133334444',
        endereco: {
          cep: '01310100',
          logradouro: 'Av. Paulista',
          numero: '2000',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          estado: 'SP'
        }
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar email obrigatório', () => {
      const result = clienteSchema.safeParse({
        nome: 'João Silva',
        tipo: 'CPF',
        documento: '12345678909',
        telefone: '11999999999',
        endereco: {
          cep: '01310100',
          logradouro: 'Av. Paulista',
          numero: '1000',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          estado: 'SP'
        }
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar estado válido', () => {
      const result = clienteSchema.safeParse({
        nome: 'João Silva',
        tipo: 'CPF',
        documento: '12345678909',
        email: 'joao@exemplo.com',
        telefone: '11999999999',
        endereco: {
          cep: '01310100',
          logradouro: 'Av. Paulista',
          numero: '1000',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          estado: 'XX' // Estado inválido
        }
      });
      
      expect(result.success).toBe(false);
    });
  });
});
