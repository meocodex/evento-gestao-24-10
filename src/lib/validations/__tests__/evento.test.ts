import { describe, it, expect } from 'vitest';
import { eventoSchema } from '../evento';

describe('Validações de Evento', () => {
  describe('eventoSchema', () => {
    it('deve validar evento com dados corretos', () => {
      const result = eventoSchema.safeParse({
        nome: 'Casamento Maria e João',
        cliente_id: 'uuid-cliente',
        comercial_id: 'uuid-comercial',
        data_evento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        hora_inicio: '18:00',
        hora_fim: '23:00',
        local: 'Buffet Elegance',
        cidade: 'São Paulo',
        estado: 'SP',
        numero_convidados: 150,
        status: 'em_negociacao'
      });
      
      expect(result.success).toBe(true);
    });

    it('deve validar nome obrigatório', () => {
      const result = eventoSchema.safeParse({
        cliente_id: 'uuid-cliente',
        data_evento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'em_negociacao'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar tamanho mínimo do nome', () => {
      const result = eventoSchema.safeParse({
        nome: 'Ab',
        cliente_id: 'uuid-cliente',
        data_evento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'em_negociacao'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar data futura do evento', () => {
      const result = eventoSchema.safeParse({
        nome: 'Evento Teste',
        cliente_id: 'uuid-cliente',
        data_evento: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'em_negociacao'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar número de convidados positivo', () => {
      const result = eventoSchema.safeParse({
        nome: 'Evento Teste',
        cliente_id: 'uuid-cliente',
        data_evento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        numero_convidados: -50,
        status: 'em_negociacao'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar status válido', () => {
      const result = eventoSchema.safeParse({
        nome: 'Evento Teste',
        cliente_id: 'uuid-cliente',
        data_evento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'status_invalido'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve validar formato de hora', () => {
      const result = eventoSchema.safeParse({
        nome: 'Evento Teste',
        cliente_id: 'uuid-cliente',
        data_evento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        hora_inicio: '25:00', // Hora inválida
        status: 'em_negociacao'
      });
      
      expect(result.success).toBe(false);
    });

    it('deve aceitar endereço completo opcional', () => {
      const result = eventoSchema.safeParse({
        nome: 'Evento Completo',
        cliente_id: 'uuid-cliente',
        data_evento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        local: 'Espaço Teste',
        endereco: 'Rua Teste, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310-100',
        status: 'em_negociacao'
      });
      
      expect(result.success).toBe(true);
    });

    it('deve aceitar observações opcionais', () => {
      const result = eventoSchema.safeParse({
        nome: 'Evento com Observações',
        cliente_id: 'uuid-cliente',
        data_evento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        observacoes: 'Decoração temática azul e branco',
        status: 'em_negociacao'
      });
      
      expect(result.success).toBe(true);
    });

    it('deve aceitar tipo de evento válido', () => {
      const result = eventoSchema.safeParse({
        nome: 'Evento Corporativo',
        cliente_id: 'uuid-cliente',
        data_evento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        tipo: 'corporativo',
        status: 'em_negociacao'
      });
      
      expect(result.success).toBe(true);
    });
  });
});
