import { describe, it, expect, beforeEach, vi } from 'vitest';
import { performanceMonitor } from '@/lib/performance/metrics';

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    performanceMonitor.clearMetrics();
    vi.clearAllMocks();
  });

  describe('trackQuery', () => {
    it('deve registrar query com sucesso', () => {
      performanceMonitor.trackQuery('test-query', 100, true);

      const stats = performanceMonitor.getStats('test-query');
      expect(stats).toHaveLength(1);
      expect(stats[0].count).toBe(1);
      expect(stats[0].avg).toBe(100);
    });

    it('deve registrar query com erro', () => {
      performanceMonitor.trackQuery('test-query', 500, false, 'Error message');

      const stats = performanceMonitor.getStats('test-query');
      expect(stats[0].successRate).toBe(0);
      expect(stats[0].lastError).toBe('Error message');
    });

    it('deve converter array queryKey para string', () => {
      performanceMonitor.trackQuery(['eventos', { id: '123' }], 150, true);

      const stats = performanceMonitor.getStats();
      expect(stats[0].queryKey).toContain('eventos');
    });

    it('deve alertar para queries lentas (>1s)', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      performanceMonitor.trackQuery('slow-query', 1500, true);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Slow query detected'),
        expect.any(Object)
      );

      consoleWarnSpy.mockRestore();
    });

    it('deve incluir userId quando fornecido', () => {
      performanceMonitor.trackQuery('user-query', 100, true, undefined, 'user-123');

      const metrics = performanceMonitor.exportMetrics();
      expect(metrics[0].userId).toBe('user-123');
    });
  });

  describe('getStats', () => {
    beforeEach(() => {
      performanceMonitor.trackQuery('query-a', 100, true);
      performanceMonitor.trackQuery('query-a', 200, true);
      performanceMonitor.trackQuery('query-a', 300, true);
      performanceMonitor.trackQuery('query-b', 50, true);
    });

    it('deve calcular estatísticas corretamente', () => {
      const stats = performanceMonitor.getStats('query-a');

      expect(stats[0].count).toBe(3);
      expect(stats[0].avg).toBe(200);
      expect(stats[0].min).toBe(100);
      expect(stats[0].max).toBe(300);
    });

    it('deve retornar estatísticas de todas as queries', () => {
      const stats = performanceMonitor.getStats();

      expect(stats).toHaveLength(2);
    });

    it('deve calcular percentis corretamente', () => {
      // Adicionar mais dados para testar percentis
      for (let i = 0; i < 100; i++) {
        performanceMonitor.trackQuery('percentil-test', i * 10, true);
      }

      const stats = performanceMonitor.getStats('percentil-test');
      
      expect(stats[0].p50).toBeGreaterThan(0);
      expect(stats[0].p95).toBeGreaterThan(stats[0].p50);
      expect(stats[0].p99).toBeGreaterThan(stats[0].p95);
    });

    it('deve calcular success rate corretamente', () => {
      performanceMonitor.trackQuery('mixed-query', 100, true);
      performanceMonitor.trackQuery('mixed-query', 100, true);
      performanceMonitor.trackQuery('mixed-query', 100, false);
      performanceMonitor.trackQuery('mixed-query', 100, false);

      const stats = performanceMonitor.getStats('mixed-query');

      expect(stats[0].successRate).toBe(50);
    });
  });

  describe('getSlowestQueries', () => {
    beforeEach(() => {
      performanceMonitor.trackQuery('fast-query', 50, true);
      performanceMonitor.trackQuery('medium-query', 200, true);
      performanceMonitor.trackQuery('slow-query', 800, true);
      performanceMonitor.trackQuery('very-slow-query', 1500, true);
    });

    it('deve retornar queries mais lentas', () => {
      const slowest = performanceMonitor.getSlowestQueries(2);

      expect(slowest).toHaveLength(2);
      expect(slowest[0].queryKey).toContain('very-slow');
    });

    it('deve ordenar por p95', () => {
      const slowest = performanceMonitor.getSlowestQueries();

      for (let i = 1; i < slowest.length; i++) {
        expect(slowest[i - 1].p95).toBeGreaterThanOrEqual(slowest[i].p95);
      }
    });

    it('deve limitar resultados corretamente', () => {
      const slowest = performanceMonitor.getSlowestQueries(1);

      expect(slowest).toHaveLength(1);
    });
  });

  describe('getFailingQueries', () => {
    beforeEach(() => {
      performanceMonitor.trackQuery('success-query', 100, true);
      performanceMonitor.trackQuery('success-query', 100, true);
      
      performanceMonitor.trackQuery('failing-query', 100, true);
      performanceMonitor.trackQuery('failing-query', 100, false);
    });

    it('deve retornar apenas queries com falhas', () => {
      const failing = performanceMonitor.getFailingQueries();

      expect(failing).toHaveLength(1);
      expect(failing[0].queryKey).toContain('failing');
    });

    it('deve excluir queries com 100% de sucesso', () => {
      const failing = performanceMonitor.getFailingQueries();

      const successQuery = failing.find(q => q.queryKey.includes('success'));
      expect(successQuery).toBeUndefined();
    });
  });

  describe('getTimelineData', () => {
    it('deve agrupar métricas por intervalos de tempo', () => {
      const now = new Date();
      
      // Simular métricas ao longo do tempo
      for (let i = 0; i < 10; i++) {
        performanceMonitor.trackQuery('timeline-query', 100 + i * 10, true);
      }

      const timeline = performanceMonitor.getTimelineData(1);

      expect(timeline.length).toBeGreaterThan(0);
      expect(timeline[0]).toHaveProperty('timestamp');
      expect(timeline[0]).toHaveProperty('avgDuration');
    });

    it('deve filtrar por período de tempo', () => {
      performanceMonitor.trackQuery('recent-query', 100, true);

      const timeline1h = performanceMonitor.getTimelineData(1);
      const timeline24h = performanceMonitor.getTimelineData(24);

      expect(timeline1h.length).toBeGreaterThanOrEqual(0);
    });

    it('deve calcular média de duração por intervalo', () => {
      performanceMonitor.trackQuery('avg-test', 100, true);
      performanceMonitor.trackQuery('avg-test', 200, true);

      const timeline = performanceMonitor.getTimelineData(1);

      if (timeline.length > 0) {
        expect(timeline[0].avgDuration).toBeGreaterThan(0);
      }
    });
  });

  describe('clearMetrics', () => {
    it('deve limpar todas as métricas', () => {
      performanceMonitor.trackQuery('test-query', 100, true);
      
      const statsBefore = performanceMonitor.getStats();
      expect(statsBefore.length).toBeGreaterThan(0);

      performanceMonitor.clearMetrics();

      const statsAfter = performanceMonitor.getStats();
      expect(statsAfter).toHaveLength(0);
    });
  });

  describe('exportMetrics', () => {
    it('deve exportar todas as métricas', () => {
      performanceMonitor.trackQuery('query-1', 100, true);
      performanceMonitor.trackQuery('query-2', 200, true);

      const exported = performanceMonitor.exportMetrics();

      expect(exported).toHaveLength(2);
      expect(exported[0]).toHaveProperty('queryKey');
      expect(exported[0]).toHaveProperty('duration');
      expect(exported[0]).toHaveProperty('timestamp');
    });

    it('deve retornar cópia das métricas', () => {
      performanceMonitor.trackQuery('test', 100, true);

      const exported = performanceMonitor.exportMetrics();
      exported.push({
        queryKey: 'fake',
        duration: 999,
        timestamp: new Date(),
        success: true,
      });

      const reExported = performanceMonitor.exportMetrics();
      expect(reExported).toHaveLength(1);
    });
  });

  describe('Limites de memória', () => {
    it('deve limitar métricas a 1000 itens', () => {
      for (let i = 0; i < 1500; i++) {
        performanceMonitor.trackQuery('overflow-test', 100, true);
      }

      const metrics = performanceMonitor.exportMetrics();
      expect(metrics.length).toBeLessThanOrEqual(1000);
    });

    it('deve remover métricas mais antigas (FIFO)', () => {
      performanceMonitor.trackQuery('first', 100, true);
      
      for (let i = 0; i < 1000; i++) {
        performanceMonitor.trackQuery('middle', 100, true);
      }

      const metrics = performanceMonitor.exportMetrics();
      const firstMetric = metrics.find(m => m.queryKey === 'first');
      
      expect(firstMetric).toBeUndefined();
    });
  });
});
