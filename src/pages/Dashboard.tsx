import { useAuth } from '@/hooks/useAuth';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertCircle, CheckCircle, Clock, Users, Package, TrendingUp } from 'lucide-react';
import { useDashboardStats, useComercialStats, useSuporteStats } from '@/hooks/useDashboardStats';
import type { EventoProximo, OperacaoHoje, RastreamentoAtivo } from '@/types/eventos';
import { DashboardSkeleton } from '@/components/skeletons';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: stats, isLoading: loadingStats } = useDashboardStats();
  const { data: comercialStats, isLoading: loadingComercial } = useComercialStats(user?.id || '');
  const { data: suporteStats, isLoading: loadingSuporte } = useSuporteStats();

  if (loadingStats || loadingComercial || loadingSuporte) {
    return <DashboardSkeleton />;
  }

  const renderAdminDashboard = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Grid - Foco em Eventos e Demandas */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
          <StatCard
            title="Eventos Mês"
            value={stats?.totalEventos.toString() || '0'}
            subtitle="Mês atual"
            icon={Calendar}
            variant="primary"
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <StatCard
            title="Eventos Próximos"
            value={stats?.eventosProximos7Dias.toString() || '0'}
            subtitle="Próximos 7 dias"
            icon={TrendingUp}
            variant="success"
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <StatCard
            title="Demandas Abertas"
            value={stats?.demandasAbertas.toString() || '0'}
            subtitle="Aguardando resolução"
            icon={AlertCircle}
            variant="warning"
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <StatCard
            title="Demandas Urgentes"
            value={stats?.demandasUrgentes.toString() || '0'}
            subtitle="Atenção imediata"
            icon={Clock}
            variant="danger"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Próximos Eventos */}
        <Card className="border hover:border-border/80 hover:shadow-lg transition-all duration-300 rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-2xl text-card-foreground">Próximos Eventos</CardTitle>
            <CardDescription className="text-muted-foreground">Nos próximos 7 dias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats?.eventosProximos7Dias && stats.eventosProximos7Dias > 0 ? (
              <div className="space-y-3">
                {Array.from({ length: Math.min(5, stats.eventosProximos7Dias) }).map((_, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">Evento #{index + 1}</p>
                      <p className="text-xs text-muted-foreground mt-1">Detalhes disponíveis em breve</p>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      Confirmado
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Nenhum evento próximo</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Novos eventos aparecerão aqui</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demandas Recentes */}
        <Card className="border hover:border-border/80 hover:shadow-lg transition-all duration-300 rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-2xl text-card-foreground">Demandas Recentes</CardTitle>
            <CardDescription className="text-muted-foreground">Status atual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-accent transition-colors">
              <span className="text-sm font-medium text-foreground">Abertas</span>
              <Badge className="bg-warning/20 text-warning border border-warning/40 hover:bg-warning/30">
                {stats?.demandasAbertas || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-accent transition-colors">
              <span className="text-sm font-medium text-foreground">Em Andamento</span>
              <Badge className="bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30">
                {stats?.demandasEmAndamento || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-accent transition-colors">
              <span className="text-sm font-medium text-foreground">Urgentes</span>
              <Badge className="bg-destructive/20 text-destructive border border-destructive/40 hover:bg-destructive/30">
                {stats?.demandasUrgentes || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-accent transition-colors">
              <span className="text-sm font-medium text-foreground">Atrasadas</span>
              <Badge className="bg-destructive/20 text-destructive border border-destructive/40 hover:bg-destructive/30">
                {stats?.demandasAtrasadas || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Operacionais */}
      <Card className="border rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-2xl text-card-foreground">Alertas Operacionais</CardTitle>
          <CardDescription className="text-muted-foreground">Ações necessárias</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats?.alertas && stats.alertas.length > 0 ? (
            stats.alertas.map((alerta, index) => {
              const Icon = alerta.tipo === 'error' ? AlertCircle : alerta.tipo === 'warning' ? Clock : Package;
              const bgClass = alerta.tipo === 'error' ? 'bg-destructive/10 border-destructive/30' : 
                             alerta.tipo === 'warning' ? 'bg-warning/10 border-warning/30' : 
                             'bg-muted border-border';
              const iconBgClass = alerta.tipo === 'error' ? 'bg-destructive/20' : 
                                 alerta.tipo === 'warning' ? 'bg-warning/20' : 
                                 'bg-muted';
              const textClass = alerta.tipo === 'error' ? 'text-destructive' : 
                               alerta.tipo === 'warning' ? 'text-warning' : 
                               'text-foreground';
              
              return (
                <div 
                  key={index} 
                  className={`flex items-start gap-4 p-4 rounded-xl border ${bgClass} animate-fade-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`p-2 rounded-lg ${iconBgClass}`}>
                    <Icon className={`h-5 w-5 ${textClass}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-card-foreground mb-1">{alerta.mensagem}</p>
                    {alerta.detalhes && (
                      <p className="text-xs text-muted-foreground">{alerta.detalhes}</p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center gap-4 p-6 bg-success/10 rounded-xl border border-success/30">
              <div className="p-2 rounded-lg bg-success/20">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-semibold text-card-foreground">Tudo certo!</p>
                <p className="text-xs text-muted-foreground mt-1">Nenhum alerta no momento</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderComercialDashboard = () => (
    <div className="space-y-12 animate-fade-in">
      <div className="grid gap-6 lg:gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
          <StatCard
            title="Meus Eventos"
            value={comercialStats?.meusEventos.toString() || '0'}
            subtitle="Mês atual"
            icon={Calendar}
            variant="primary"
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <StatCard
            title="Orçamentos"
            value={comercialStats?.orcamentosEmAnalise.toString() || '0'}
            subtitle="Em análise"
            icon={Users}
            variant="default"
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <StatCard
            title="Contratos"
            value={comercialStats?.contratosFechados.toString() || '0'}
            subtitle="Fechados"
            icon={CheckCircle}
            variant="success"
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <StatCard
            title="Próximos Eventos"
            value={comercialStats?.eventosProximos?.length.toString() || '0'}
            subtitle="7 dias"
            icon={TrendingUp}
            variant="default"
          />
        </div>
      </div>

      <Card className="border border-border/50 rounded-xl hover:shadow-xl transition-all duration-500">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-2xl">Próximos Eventos</CardTitle>
          <CardDescription>Nos próximos 7 dias</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {comercialStats?.eventosProximos && comercialStats.eventosProximos.length > 0 ? (
            comercialStats.eventosProximos.slice(0, 3).map((evento: EventoProximo, index: number) => {
              const dataEvento = new Date(evento.data_inicio);
              const diasFaltam = differenceInDays(dataEvento, new Date());
              const statusLabels: Record<string, string> = {
                'orcamento_enviado': 'Orçamento Enviado',
                'confirmado': 'Confirmado',
                'materiais_alocados': 'Materiais Alocados',
                'em_andamento': 'Em Andamento',
                'aguardando_alocacao': 'Aguardando Alocação',
              };
              
              return (
                <div 
                  key={evento.id} 
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <div>
                    <p className="font-semibold">Evento #{evento.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(dataEvento, "dd/MM", { locale: ptBR })} - Faltam {diasFaltam} dias
                    </p>
                  </div>
                  <Badge className={evento.status === 'confirmado' ? 'bg-success' : 'bg-primary'}>
                    {statusLabels[evento.status] || evento.status}
                  </Badge>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">Nenhum evento próximo</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Novos eventos aparecerão aqui</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
        <Card className="border border-border/50 rounded-xl hover:shadow-xl transition-all duration-500">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-2xl">Ações Necessárias</CardTitle>
            <CardDescription>Itens que precisam da sua atenção</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-warning/5 rounded-xl border border-warning/20 hover:bg-warning/10 transition-colors duration-300">
              <div className="p-2 rounded-lg bg-warning/10">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1">{comercialStats?.orcamentosEmAnalise || 0} orçamentos aguardando resposta</p>
                <p className="text-xs text-muted-foreground">Validar e enviar propostas</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-xl border border-primary/20 hover:bg-primary/10 transition-colors duration-300">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1">Eventos precisam de atenção</p>
                <p className="text-xs text-muted-foreground">Verificar materiais e equipe</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 rounded-xl hover:shadow-xl transition-all duration-500">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-2xl">Minhas Demandas</CardTitle>
            <CardDescription>Status atual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
              <span className="text-sm font-medium">Criadas aguardando</span>
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                {comercialStats?.demandasCriadas || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
              <span className="text-sm font-medium">Concluídas hoje</span>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                {comercialStats?.demandasConcluidas || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSuporteDashboard = () => (
    <div className="space-y-12 animate-fade-in">
      <div className="grid gap-6 lg:gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
          <StatCard
            title="Demandas Pendentes"
            value={suporteStats?.demandasPendentes.toString() || '0'}
            icon={AlertCircle}
            variant="warning"
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <StatCard
            title="Operações Hoje"
            value={suporteStats?.operacoesHoje?.length.toString() || '0'}
            icon={Calendar}
            variant="primary"
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <StatCard
            title="Rastreamentos Ativos"
            value={suporteStats?.rastreamentosAtivos?.length.toString() || '0'}
            icon={Package}
            variant="default"
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <StatCard
            title="Retornos Atrasados"
            value={suporteStats?.retornosAtrasados.toString() || '0'}
            icon={Clock}
            variant="danger"
          />
        </div>
      </div>

      {suporteStats && suporteStats.demandasUrgentes > 0 && (
        <Card className="border-destructive/30 bg-destructive/5 rounded-xl hover:shadow-xl hover:shadow-destructive/10 transition-all duration-500 animate-fade-in">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              Demandas Urgentes
            </CardTitle>
            <CardDescription>Requer atenção imediata</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 glass-card rounded-xl">
              <div>
                <p className="font-bold text-lg">{suporteStats.demandasUrgentes} demanda{suporteStats.demandasUrgentes > 1 ? 's' : ''} urgente{suporteStats.demandasUrgentes > 1 ? 's' : ''}</p>
                <p className="text-sm text-muted-foreground mt-1">Ação necessária hoje</p>
              </div>
              <Badge variant="destructive" className="text-sm px-3 py-1">URGENTE</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
        <Card className="border border-border/50 rounded-xl hover:shadow-xl transition-all duration-500">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-2xl">Operações do Dia</CardTitle>
            <CardDescription>Eventos acontecendo hoje</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {suporteStats?.operacoesHoje && suporteStats.operacoesHoje.length > 0 ? (
              suporteStats.operacoesHoje.map((evento: OperacaoHoje, index: number) => (
                <div 
                  key={index}
                  className="flex items-start gap-4 p-4 bg-primary/5 rounded-xl border border-primary/20 hover:bg-primary/10 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{evento.nome}</p>
                    <p className="text-xs text-muted-foreground mt-1">{evento.local}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Nenhuma operação hoje</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border/50 rounded-xl hover:shadow-xl transition-all duration-500">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-2xl">Rastreamentos Ativos</CardTitle>
            <CardDescription>Envios em andamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {suporteStats?.rastreamentosAtivos && suporteStats.rastreamentosAtivos.length > 0 ? (
              suporteStats.rastreamentosAtivos.slice(0, 5).map((envio: RastreamentoAtivo, index: number) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold">{envio.tipo}</p>
                    <p className="text-xs text-muted-foreground mt-1">{envio.rastreio || 'Sem código'}</p>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {envio.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Nenhum rastreamento ativo</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Visão geral de eventos e demandas
        </p>
      </div>

      {user?.role === 'admin' && renderAdminDashboard()}
      {user?.role === 'comercial' && renderComercialDashboard()}
      {user?.role === 'suporte' && renderSuporteDashboard()}
    </div>
  );
};

export default Dashboard;
