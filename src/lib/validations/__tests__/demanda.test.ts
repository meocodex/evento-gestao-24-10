import { describe, it, expect } from 'vitest';
import { demandaSchema, reembolsoSchema } from '../demanda';

describe('Validações de Demanda', () => {
  describe('demandaSchema', () => {
    it('deve validar demanda com dados corretos', () => {
      const result = demandaSchema.safeParse({
        titulo: 'Demanda de Teste',
        descricao: 'Descrição detalhada da demanda',
        categoria: 'operacional',
        prioridade: 'alta',
        prazo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      expect(result.success).toBe(true);
    });

    it('deve validar título obrigatório', () => {
      const result = demandaSchema.safeParse({
        descricao: 'Descrição',
        categoria: 'logistica',
        prioridade: 'media'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar tamanho mínimo do título', () => {
      const result = demandaSchema.safeParse({
        titulo: 'Ab',
        descricao: 'Descrição',
        categoria: 'logistica',
        prioridade: 'media'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar tamanho máximo do título', () => {
      const result = demandaSchema.safeParse({
        titulo: 'A'.repeat(201),
        descricao: 'Descrição',
        categoria: 'logistica',
        prioridade: 'media'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar categoria válida', () => {
      const result = demandaSchema.safeParse({
        titulo: 'Demanda Teste',
        descricao: 'Descrição',
        categoria: 'categoria_invalida',
        prioridade: 'media'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar prioridade válida', () => {
      const result = demandaSchema.safeParse({
        titulo: 'Demanda Teste',
        descricao: 'Descrição',
        categoria: 'logistica',
        prioridade: 'prioridade_invalida'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve rejeitar prazo no passado', () => {
      const result = demandaSchema.safeParse({
        titulo: 'Demanda Teste',
        descricao: 'Descrição',
        categoria: 'logistica',
        prioridade: 'alta',
        prazo: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      });
      
      expect(result.success).toBe(false);
    });

    it('deve aceitar prazo futuro', () => {
      const result = demandaSchema.safeParse({
        titulo: 'Demanda Teste',
        descricao: 'Descrição',
        categoria: 'operacional',
        prioridade: 'alta',
        prazo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      expect(result.success).toBe(true);
    });

    it('deve aceitar tags opcionais', () => {
      const result = demandaSchema.safeParse({
        titulo: 'Demanda com Tags',
        descricao: 'Descrição',
        categoria: 'operacional',
        prioridade: 'baixa',
        tags: ['urgente', 'importante']
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe('reembolsoSchema', () => {
    it('deve validar reembolso com dados corretos', () => {
      const result = reembolsoSchema.safeParse({
        descricao: 'Reembolso de alimentação',
        tipo: 'alimentacao',
        valor: 150.50
      });
      
      expect(result.success).toBe(true);
    });

    it('deve validar tipo válido', () => {
      const result = reembolsoSchema.safeParse({
        descricao: 'Reembolso',
        tipo: 'tipo_invalido',
        valor: 100
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar valor positivo', () => {
      const result = reembolsoSchema.safeParse({
        descricao: 'Reembolso',
        tipo: 'transporte',
        valor: -50
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar valor zero', () => {
      const result = reembolsoSchema.safeParse({
        descricao: 'Reembolso',
        tipo: 'transporte',
        valor: 0
      });
      
      expect(result.success).toBe(false);
    });

    it('deve aceitar observações opcionais', () => {
      const result = reembolsoSchema.safeParse({
        descricao: 'Reembolso com observação',
        tipo: 'hospedagem',
        valor: 300,
        observacoes: 'Hotel próximo ao evento'
      });
      
      expect(result.success).toBe(true);
    });
  });
});
