import { describe, it, expect } from 'vitest';
import { uiToDbStatus, dbToUiStatus, statusConfig } from '../estoqueStatus';
import type { StatusUI, StatusDB } from '../estoqueStatus';

describe('Conversão de Status de Estoque', () => {
  describe('uiToDbStatus', () => {
    it('deve converter "em-uso" para "em_uso"', () => {
      const result = uiToDbStatus('em-uso');
      expect(result).toBe('em_uso');
    });

    it('deve manter status "disponivel"', () => {
      const result = uiToDbStatus('disponivel');
      expect(result).toBe('disponivel');
    });

    it('deve manter status "manutencao"', () => {
      const result = uiToDbStatus('manutencao');
      expect(result).toBe('manutencao');
    });

    it('deve manter status "perdido"', () => {
      const result = uiToDbStatus('perdido');
      expect(result).toBe('perdido');
    });

    it('deve manter status "consumido"', () => {
      const result = uiToDbStatus('consumido');
      expect(result).toBe('consumido');
    });
  });

  describe('dbToUiStatus', () => {
    it('deve converter "em_uso" para "em-uso"', () => {
      const result = dbToUiStatus('em_uso');
      expect(result).toBe('em-uso');
    });

    it('deve manter status "disponivel"', () => {
      const result = dbToUiStatus('disponivel');
      expect(result).toBe('disponivel');
    });

    it('deve manter status "manutencao"', () => {
      const result = dbToUiStatus('manutencao');
      expect(result).toBe('manutencao');
    });

    it('deve manter status "perdido"', () => {
      const result = dbToUiStatus('perdido');
      expect(result).toBe('perdido');
    });

    it('deve manter status "consumido"', () => {
      const result = dbToUiStatus('consumido');
      expect(result).toBe('consumido');
    });
  });

  describe('Conversão bidirecional', () => {
    it('deve converter UI -> DB -> UI corretamente', () => {
      const original: StatusUI = 'em-uso';
      const dbStatus = uiToDbStatus(original);
      const backToUi = dbToUiStatus(dbStatus);
      expect(backToUi).toBe(original);
    });

    it('deve converter DB -> UI -> DB corretamente', () => {
      const original: StatusDB = 'em_uso';
      const uiStatus = dbToUiStatus(original);
      const backToDb = uiToDbStatus(uiStatus);
      expect(backToDb).toBe(original);
    });
  });

  describe('statusConfig', () => {
    it('deve ter configuração para todos os status', () => {
      expect(statusConfig.disponivel).toBeDefined();
      expect(statusConfig['em-uso']).toBeDefined();
      expect(statusConfig.manutencao).toBeDefined();
      expect(statusConfig.perdido).toBeDefined();
      expect(statusConfig.consumido).toBeDefined();
    });

    it('deve ter label e color para cada status', () => {
      Object.values(statusConfig).forEach(config => {
        expect(config).toHaveProperty('label');
        expect(config).toHaveProperty('color');
        expect(typeof config.label).toBe('string');
        expect(typeof config.color).toBe('string');
      });
    });

    it('deve ter labels descritivos', () => {
      expect(statusConfig.disponivel.label).toBe('Disponível');
      expect(statusConfig['em-uso'].label).toBe('Em Uso');
      expect(statusConfig.manutencao.label).toBe('Manutenção');
      expect(statusConfig.perdido.label).toBe('Perdido');
      expect(statusConfig.consumido.label).toBe('Consumido');
    });

    it('deve ter cores apropriadas', () => {
      expect(statusConfig.disponivel.color).toBe('success');
      expect(statusConfig['em-uso'].color).toBe('default');
      expect(statusConfig.manutencao.color).toBe('warning');
      expect(statusConfig.perdido.color).toBe('destructive');
      expect(statusConfig.consumido.color).toBe('secondary');
    });
  });
});
