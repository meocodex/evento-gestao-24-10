/**
 * Sistema de Métricas de Performance
 * Trackeia queries, duration, success/error rates
 */

export interface QueryMetric {
  queryKey: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  error?: string;
  userId?: string;
}

export interface QueryStats {
  queryKey: string;
  count: number;
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
  successRate: number;
  lastError?: string;
}

class PerformanceMonitor {
  private metrics: QueryMetric[] = [];
  private readonly maxMetrics = 1000; // Limitar memória
  private readonly slowQueryThreshold = 1000; // 1s
  
  trackQuery(
    queryKey: string | readonly unknown[],
    duration: number,
    success: boolean,
    error?: string,
    userId?: string
  ) {
    const key = Array.isArray(queryKey) ? JSON.stringify(queryKey) : String(queryKey);
    
    const metric: QueryMetric = {
      queryKey: key,
      duration,
      timestamp: new Date(),
      success,
      error,
      userId,
    };
    
    this.metrics.push(metric);
    
    // Limitar tamanho do array (FIFO)
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
    
    // Alert para queries lentas
    if (duration > this.slowQueryThreshold) {
      console.warn(
        `⚠️ Slow query detected: ${key} (${duration}ms)`,
        { success, error }
      );
    }
  }
  
  getStats(queryKey?: string): QueryStats[] {
    const metricsToAnalyze = queryKey
      ? this.metrics.filter((m) => m.queryKey === queryKey)
      : this.metrics;
    
    // Agrupar por queryKey
    const grouped = metricsToAnalyze.reduce((acc, metric) => {
      if (!acc[metric.queryKey]) {
        acc[metric.queryKey] = [];
      }
      acc[metric.queryKey].push(metric);
      return acc;
    }, {} as Record<string, QueryMetric[]>);
    
    // Calcular estatísticas para cada query
    return Object.entries(grouped).map(([key, metrics]) => {
      const durations = metrics.map((m) => m.duration).sort((a, b) => a - b);
      const successCount = metrics.filter((m) => m.success).length;
      
      return {
        queryKey: key,
        count: metrics.length,
        avg: durations.reduce((a, b) => a + b, 0) / durations.length,
        min: durations[0],
        max: durations[durations.length - 1],
        p50: this.percentile(durations, 50),
        p95: this.percentile(durations, 95),
        p99: this.percentile(durations, 99),
        successRate: (successCount / metrics.length) * 100,
        lastError: metrics.filter((m) => !m.success).pop()?.error,
      };
    });
  }
  
  getSlowestQueries(limit = 10): QueryStats[] {
    return this.getStats()
      .sort((a, b) => b.p95 - a.p95)
      .slice(0, limit);
  }
  
  getFailingQueries(): QueryStats[] {
    return this.getStats().filter((s) => s.successRate < 100);
  }
  
  getTimelineData(hours = 1): { timestamp: Date; avgDuration: number }[] {
    const now = new Date();
    const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);
    
    const recentMetrics = this.metrics.filter((m) => m.timestamp > cutoff);
    
    // Agrupar por intervalos de 5 minutos
    const intervalMs = 5 * 60 * 1000;
    const grouped = recentMetrics.reduce((acc, metric) => {
      const interval = Math.floor(metric.timestamp.getTime() / intervalMs) * intervalMs;
      if (!acc[interval]) {
        acc[interval] = [];
      }
      acc[interval].push(metric.duration);
      return acc;
    }, {} as Record<number, number[]>);
    
    return Object.entries(grouped)
      .map(([timestamp, durations]) => ({
        timestamp: new Date(Number(timestamp)),
        avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  clearMetrics() {
    this.metrics = [];
  }
  
  exportMetrics(): QueryMetric[] {
    return [...this.metrics];
  }
  
  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil((sorted.length * p) / 100) - 1;
    return sorted[Math.max(0, index)] || 0;
  }
}

// Singleton global
export const performanceMonitor = new PerformanceMonitor();
