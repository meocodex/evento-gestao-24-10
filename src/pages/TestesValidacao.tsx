import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useValidationTests } from '@/hooks/useValidationTests';
import { PlayCircle, RotateCcw, CheckCircle2, XCircle, AlertTriangle, Loader2, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function TestesValidacao() {
  const { suites, isRunning, runTests, resetTests, getTotalStats } = useValidationTests();
  const stats = getTotalStats();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const getSuiteStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge variant="outline" className="border-primary"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Executando</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-emerald-500 text-emerald-600"><CheckCircle2 className="h-3 w-3 mr-1" /> Concluído</Badge>;
      case 'error':
        return <Badge variant="outline" className="border-red-500 text-red-600"><XCircle className="h-3 w-3 mr-1" /> Com Erros</Badge>;
      default:
        return <Badge variant="outline">Aguardando</Badge>;
    }
  };

  const completedSuites = suites.filter(s => s.status === 'completed' || s.status === 'error').length;
  const progressPercentage = (completedSuites / suites.length) * 100;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Testes de Validação</h1>
          <p className="text-muted-foreground mt-1">
            Validação automática dos fluxos críticos após migração
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={resetTests}
            disabled={isRunning}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button
            onClick={runTests}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Executando...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Executar Testes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress */}
      {isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{completedSuites}/{suites.length} suites</span>
              </div>
              <Progress value={progressPercentage} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {stats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sucesso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{stats.success}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Erros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.error}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avisos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.warning}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Duração</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.totalDuration / 1000).toFixed(2)}s</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alert */}
      {!isRunning && stats.total === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Nenhum teste executado</AlertTitle>
          <AlertDescription>
            Clique em "Executar Testes" para iniciar a validação automática dos fluxos críticos.
          </AlertDescription>
        </Alert>
      )}

      {/* Test Suites */}
      <div className="space-y-4">
        {suites.map((suite, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>{suite.name}</CardTitle>
                  <CardDescription>{suite.description}</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  {suite.totalDuration > 0 && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {(suite.totalDuration / 1000).toFixed(2)}s
                    </div>
                  )}
                  {getSuiteStatusBadge(suite.status)}
                </div>
              </div>
            </CardHeader>
            {suite.results.length > 0 && (
              <CardContent>
                <div className="space-y-2">
                  {suite.results.map((result, resultIndex) => (
                    <div
                      key={resultIndex}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                    >
                      {getStatusIcon(result.status)}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{result.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {result.duration.toFixed(0)}ms
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{result.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
