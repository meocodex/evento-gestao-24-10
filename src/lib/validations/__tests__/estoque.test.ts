import { describe, it, expect } from 'vitest';
import { estoqueSchema } from '../estoque';

describe('Validações de Estoque', () => {
  describe('estoqueSchema', () => {
    it('deve validar material com dados corretos', () => {
      const result = estoqueSchema.safeParse({
        nome: 'Mesa Redonda',
        categoria: 'mobiliario',
        quantidade_disponivel: 50,
        quantidade_minima: 10,
        unidade_medida: 'unidade',
        possui_serial: false
      });
      
      expect(result.success).toBe(true);
    });

    it('deve validar nome obrigatório', () => {
      const result = estoqueSchema.safeParse({
        categoria: 'mobiliario',
        quantidade_disponivel: 50,
        unidade_medida: 'unidade'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar quantidade não negativa', () => {
      const result = estoqueSchema.safeParse({
        nome: 'Cadeira',
        categoria: 'mobiliario',
        quantidade_disponivel: -5,
        unidade_medida: 'unidade'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar quantidade mínima não negativa', () => {
      const result = estoqueSchema.safeParse({
        nome: 'Toalha',
        categoria: 'decoracao',
        quantidade_disponivel: 100,
        quantidade_minima: -10,
        unidade_medida: 'unidade'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar categoria válida', () => {
      const result = estoqueSchema.safeParse({
        nome: 'Item Teste',
        categoria: 'categoria_invalida',
        quantidade_disponivel: 10,
        unidade_medida: 'unidade'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar unidade de medida válida', () => {
      const result = estoqueSchema.safeParse({
        nome: 'Item Teste',
        categoria: 'mobiliario',
        quantidade_disponivel: 10,
        unidade_medida: 'unidade_invalida'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve aceitar material com serial', () => {
      const result = estoqueSchema.safeParse({
        nome: 'Equipamento de Som',
        categoria: 'equipamento',
        quantidade_disponivel: 5,
        unidade_medida: 'unidade',
        possui_serial: true
      });
      
      expect(result.success).toBe(true);
    });

    it('deve aceitar tags opcionais', () => {
      const result = estoqueSchema.safeParse({
        nome: 'Mesa Premium',
        categoria: 'mobiliario',
        quantidade_disponivel: 20,
        unidade_medida: 'unidade',
        tags: ['premium', 'evento-corporativo']
      });
      
      expect(result.success).toBe(true);
    });
  });

});
