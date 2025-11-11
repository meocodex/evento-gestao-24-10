import { describe, it, expect } from 'vitest';
import { contaPagarSchema, contaReceberSchema } from '../financeiro';

describe('Validações de Financeiro', () => {
  describe('contaPagarSchema', () => {
  it('deve validar conta a pagar com dados corretos', () => {
    const data = {
      descricao: 'Pagamento de fornecedor',
      categoria: 'fornecedores',
      valor_unitario: 1500.00,
      quantidade: 1,
      recorrencia: 'unico' as const,
      data_vencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pendente' as const
    };
    
    const result = contaPagarSchema.safeParse(data);
    
    if (!result.success) {
      console.log('Validation errors:', JSON.stringify(result.error.format(), null, 2));
    }

    expect(result.success).toBe(true);
  });

    it('deve validar descrição obrigatória', () => {
      const result = contaPagarSchema.safeParse({
        categoria: 'fornecedores',
        valor_unitario: 1000,
        quantidade: 1,
        recorrencia: 'unico',
        data_vencimento: new Date().toISOString(),
        status: 'pendente'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar valor positivo', () => {
      const result = contaPagarSchema.safeParse({
        descricao: 'Teste',
        categoria: 'fornecedores',
        valor_unitario: -100,
        quantidade: 1,
        recorrencia: 'unico',
        data_vencimento: new Date().toISOString(),
        status: 'pendente'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar quantidade positiva', () => {
      const result = contaPagarSchema.safeParse({
        descricao: 'Teste',
        categoria: 'fornecedores',
        valor_unitario: 100,
        quantidade: 0,
        recorrencia: 'unico',
        data_vencimento: new Date().toISOString(),
        status: 'pendente'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar conta paga com todos os dados', () => {
      const result = contaPagarSchema.safeParse({
        descricao: 'Pagamento realizado',
        categoria: 'fornecedores',
        valor_unitario: 2000.00,
        quantidade: 1,
        recorrencia: 'unico',
        data_vencimento: new Date().toISOString(),
        status: 'pago',
        data_pagamento: new Date().toISOString(),
        forma_pagamento: 'PIX'
      });
      
      expect(result.success).toBe(true);
    });

    it('deve exigir data de pagamento quando status é pago', () => {
      const result = contaPagarSchema.safeParse({
        descricao: 'Teste',
        categoria: 'fornecedores',
        valor_unitario: 1000,
        quantidade: 1,
        recorrencia: 'unico',
        data_vencimento: new Date().toISOString(),
        status: 'pago'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve exigir forma de pagamento quando status é pago', () => {
      const result = contaPagarSchema.safeParse({
        descricao: 'Teste',
        categoria: 'fornecedores',
        valor_unitario: 1000,
        quantidade: 1,
        recorrencia: 'unico',
        data_vencimento: new Date().toISOString(),
        status: 'pago',
        data_pagamento: new Date().toISOString()
      });
      
      expect(result.success).toBe(false);
    });

    it('deve aceitar categoria válida', () => {
      const result = contaPagarSchema.safeParse({
        descricao: 'Despesa de fornecedor',
        categoria: 'fornecedores',
        valor_unitario: 500,
        quantidade: 1,
        recorrencia: 'unico',
        data_vencimento: new Date().toISOString(),
        status: 'pendente'
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe('contaReceberSchema', () => {
    it('deve validar conta a receber com dados corretos', () => {
      const result = contaReceberSchema.safeParse({
        descricao: 'Venda de produto',
        tipo: 'venda',
        valor_unitario: 3000.00,
        quantidade: 1,
        recorrencia: 'unico',
        data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pendente'
      });
      
      expect(result.success).toBe(true);
    });

    it('deve validar tipo válido', () => {
      const result = contaReceberSchema.safeParse({
        descricao: 'Recebimento',
        tipo: 'tipo_invalido',
        valor_unitario: 1000,
        quantidade: 1,
        recorrencia: 'unico',
        data_vencimento: new Date().toISOString(),
        status: 'pendente'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve exigir data de recebimento quando status é recebido', () => {
      const result = contaReceberSchema.safeParse({
        descricao: 'Recebimento',
        tipo: 'venda',
        valor_unitario: 1000,
        quantidade: 1,
        recorrencia: 'unico',
        data_vencimento: new Date().toISOString(),
        status: 'recebido'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve exigir forma de recebimento quando status é recebido', () => {
      const result = contaReceberSchema.safeParse({
        descricao: 'Recebimento',
        tipo: 'venda',
        valor_unitario: 1000,
        quantidade: 1,
        recorrencia: 'unico',
        data_vencimento: new Date().toISOString(),
        status: 'recebido',
        data_recebimento: new Date().toISOString()
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar conta recebida com todos os dados', () => {
      const result = contaReceberSchema.safeParse({
        descricao: 'Pagamento recebido',
        tipo: 'venda',
        valor_unitario: 5000.00,
        quantidade: 1,
        recorrencia: 'unico',
        data_vencimento: new Date().toISOString(),
        status: 'recebido',
        data_recebimento: new Date().toISOString(),
        forma_recebimento: 'PIX'
      });
      
      expect(result.success).toBe(true);
    });

    it('deve aceitar parcelas', () => {
      const result = contaReceberSchema.safeParse({
        descricao: 'Venda parcelada',
        tipo: 'venda',
        valor_unitario: 10000.00,
        quantidade: 1,
        recorrencia: 'unico',
        data_vencimento: new Date().toISOString(),
        status: 'pendente',
        parcelas: 12,
        parcela_numero: 1
      });
      
      expect(result.success).toBe(true);
    });
  });
});
