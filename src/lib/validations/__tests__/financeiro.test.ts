import { describe, it, expect } from 'vitest';
import { contaPagarSchema, contaReceberSchema } from '../financeiro';

describe('Validações de Financeiro', () => {
  describe('contaPagarSchema', () => {
    it('deve validar conta a pagar com dados corretos', () => {
      const result = contaPagarSchema.safeParse({
        descricao: 'Pagamento Fornecedor',
        categoria: 'fornecedores',
        valor_unitario: 1500,
        quantidade: 1,
        data_vencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pendente'
      });
      
      expect(result.success).toBe(true);
    });

    it('deve validar descricão obrigatória', () => {
      const result = contaPagarSchema.safeParse({
        categoria: 'fornecedores',
        valor_unitario: 1000,
        quantidade: 1,
        data_vencimento: new Date().toISOString(),
        status: 'pendente'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar valor positivo', () => {
      const result = contaPagarSchema.safeParse({
        descricao: 'Pagamento',
        categoria: 'diversos',
        valor_unitario: -500,
        quantidade: 1,
        data_vencimento: new Date().toISOString(),
        status: 'pendente'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar quantidade positiva', () => {
      const result = contaPagarSchema.safeParse({
        descricao: 'Pagamento',
        categoria: 'diversos',
        valor_unitario: 500,
        quantidade: 0,
        data_vencimento: new Date().toISOString(),
        status: 'pendente'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve exigir data de pagamento quando status é pago', () => {
      const result = contaPagarSchema.safeParse({
        descricao: 'Pagamento Realizado',
        categoria: 'fornecedores',
        valor_unitario: 2000,
        quantidade: 1,
        data_vencimento: new Date().toISOString(),
        status: 'pago'
        // Faltando data_pagamento
      });
      
      expect(result.success).toBe(false);
    });

    it('deve exigir forma de pagamento quando status é pago', () => {
      const result = contaPagarSchema.safeParse({
        descricao: 'Pagamento Realizado',
        categoria: 'fornecedores',
        valor_unitario: 2000,
        quantidade: 1,
        data_vencimento: new Date().toISOString(),
        status: 'pago',
        data_pagamento: new Date().toISOString()
        // Faltando forma_pagamento
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar conta paga com todos os dados', () => {
      const result = contaPagarSchema.safeParse({
        descricao: 'Pagamento Completo',
        categoria: 'fornecedores',
        valor_unitario: 3000,
        quantidade: 1,
        data_vencimento: new Date().toISOString(),
        status: 'pago',
        data_pagamento: new Date().toISOString(),
        forma_pagamento: 'transferencia'
      });
      
      expect(result.success).toBe(true);
    });

    it('deve aceitar evento_id opcional', () => {
      const result = contaPagarSchema.safeParse({
        descricao: 'Despesa do Evento',
        categoria: 'evento',
        valor_unitario: 1200,
        quantidade: 1,
        data_vencimento: new Date().toISOString(),
        status: 'pendente',
        evento_id: 'uuid-evento'
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe('contaReceberSchema', () => {
    it('deve validar conta a receber com dados corretos', () => {
      const result = contaReceberSchema.safeParse({
        descricao: 'Pagamento Cliente',
        tipo: 'evento',
        valor_unitario: 5000,
        quantidade: 1,
        data_vencimento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pendente'
      });
      
      expect(result.success).toBe(true);
    });

    it('deve validar tipo válido', () => {
      const result = contaReceberSchema.safeParse({
        descricao: 'Receita',
        tipo: 'tipo_invalido',
        valor_unitario: 1000,
        quantidade: 1,
        data_vencimento: new Date().toISOString(),
        status: 'pendente'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve exigir data de recebimento quando status é recebido', () => {
      const result = contaReceberSchema.safeParse({
        descricao: 'Recebimento Realizado',
        tipo: 'evento',
        valor_unitario: 4000,
        quantidade: 1,
        data_vencimento: new Date().toISOString(),
        status: 'recebido'
        // Faltando data_recebimento
      });
      
      expect(result.success).toBe(false);
    });

    it('deve exigir forma de recebimento quando status é recebido', () => {
      const result = contaReceberSchema.safeParse({
        descricao: 'Recebimento Realizado',
        tipo: 'evento',
        valor_unitario: 4000,
        quantidade: 1,
        data_vencimento: new Date().toISOString(),
        status: 'recebido',
        data_recebimento: new Date().toISOString()
        // Faltando forma_recebimento
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar conta recebida com todos os dados', () => {
      const result = contaReceberSchema.safeParse({
        descricao: 'Recebimento Completo',
        tipo: 'evento',
        valor_unitario: 6000,
        quantidade: 1,
        data_vencimento: new Date().toISOString(),
        status: 'recebido',
        data_recebimento: new Date().toISOString(),
        forma_recebimento: 'pix'
      });
      
      expect(result.success).toBe(true);
    });

    it('deve aceitar parcelas', () => {
      const result = contaReceberSchema.safeParse({
        descricao: 'Pagamento Parcelado',
        tipo: 'contrato',
        valor_unitario: 10000,
        quantidade: 1,
        data_vencimento: new Date().toISOString(),
        status: 'pendente',
        parcelas: 3,
        parcela_numero: 1
      });
      
      expect(result.success).toBe(true);
    });
  });
});
