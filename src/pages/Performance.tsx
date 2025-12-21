import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { performanceMonitor, QueryStats } from '@/lib/performance';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Performance() {
  const [stats, setStats] = useState<QueryStats[]>([]);
  const [timelineData, setTimelineData] = useState<{ timestamp: Date; avgDuration: number }[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadData = () => {
      setStats(performanceMonitor.getStats());
      setTimelineData(performanceMonitor.getTimelineData(1));
    };

    loadData();
    const interval = setInterval(loadData, 5000); // Atualizar a cada 5s

    return () => clearInterval(interval);
  }, [refreshKey]);

  const slowestQueries = performanceMonitor.getSlowestQueries(10);
  const failingQueries = performanceMonitor.getFailingQueries();

  const totalQueries = stats.reduce((sum, s) => sum + s.count, 0);
  const avgDuration = stats.reduce((sum, s) => sum + s.avg * s.count, 0) / totalQueries || 0;
  const slowQueries = stats.filter((s) => s.p95 > 1000).length;

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleClear = () => {
    performanceMonitor.clearMetrics();
    setRefreshKey((prev) => prev + 1);
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getDurationColor = (ms: number) => {
    if (ms < 500) return 'text-success';
    if (ms < 1000) return 'text-warning';
    return 'text-destructive';
  };

  const chartData = timelineData.map((d) => ({
    timestamp: d.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    duration: Math.round(d.avgDuration),
  }));

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 lg:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end gap-2">
        <Button onClick={handleRefresh} variant="outline" size="sm">
          Atualizar
        </Button>
        <Button onClick={handleClear} variant="destructive" size="sm">
          Limpar Dados
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQueries.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.length} queries únicas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getDurationColor(avgDuration)}`}>
              {formatDuration(avgDuration)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tempo médio de resposta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queries Lentas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{slowQueries}</div>
            <p className="text-xs text-muted-foreground">
              P95 {'>'} 1s
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {failingQueries.length === 0 ? '100%' : 
                ((stats.length - failingQueries.length) / stats.length * 100).toFixed(1) + '%'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {failingQueries.length} com erros
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
          <CardDescription>Duração média das queries na última hora</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="duration" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slowest Queries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Queries Mais Lentas (Top 10)
          </CardTitle>
          <CardDescription>Ordenadas por P95 (95º percentil)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Query</TableHead>
                  <TableHead className="text-right">Execuções</TableHead>
                  <TableHead className="text-right">Média</TableHead>
                  <TableHead className="text-right">P95</TableHead>
                  <TableHead className="text-right">Max</TableHead>
                  <TableHead className="text-right">Taxa Sucesso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slowestQueries.length > 0 ? (
                  slowestQueries.map((query, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-xs max-w-[300px] truncate">
                        {query.queryKey}
                      </TableCell>
                      <TableCell className="text-right">{query.count}</TableCell>
                      <TableCell className={`text-right ${getDurationColor(query.avg)}`}>
                        {formatDuration(query.avg)}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${getDurationColor(query.p95)}`}>
                        {formatDuration(query.p95)}
                      </TableCell>
                      <TableCell className={`text-right ${getDurationColor(query.max)}`}>
                        {formatDuration(query.max)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={query.successRate === 100 ? 'default' : 'destructive'}>
                          {query.successRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhuma query registrada ainda
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Failing Queries */}
      {failingQueries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Queries com Erros
            </CardTitle>
            <CardDescription>Queries que falharam em alguma execução</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Query</TableHead>
                    <TableHead className="text-right">Taxa Sucesso</TableHead>
                    <TableHead>Último Erro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {failingQueries.map((query, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-xs max-w-[300px] truncate">
                        {query.queryKey}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="destructive">
                          {query.successRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[400px] truncate">
                        {query.lastError || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {totalQueries > 0 && slowQueries === 0 && failingQueries.length === 0 && (
        <Card className="border-success bg-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-success" />
              <div>
                <p className="font-semibold text-success">Sistema Performance Ótima!</p>
                <p className="text-sm text-muted-foreground">
                  Todas as queries estão rodando dentro dos parâmetros esperados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
