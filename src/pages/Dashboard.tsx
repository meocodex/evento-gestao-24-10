import { useAuth } from '@/hooks/useAuth';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Package, Users, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useDashboardStats, useComercialStats, useSuporteStats } from '@/hooks/useDashboardStats';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: stats, isLoading: loadingStats } = useDashboardStats();
  const { data: comercialStats, isLoading: loadingComercial } = useComercialStats(user?.id || '');
  const { data: suporteStats, isLoading: loadingSuporte } = useSuporteStats();

  if (loadingStats || loadingComercial || loadingSuporte) {
    return (
      <div className="p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const renderAdminDashboard = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Premium Hero Section - Navy Theme */}
      <div className="relative overflow-hidden rounded-2xl p-8 lg:p-12 bg-white border-2 border-navy-100">
        <div className="relative z-10">
          <p className="text-sm font-medium text-navy-600 mb-2 tracking-wide uppercase">
            {getGreeting()}, {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-navy-800 mb-3 tracking-tight">
            {user?.name}
          </h1>
          <p className="text-lg text-navy-600 max-w-2xl">
            Visão geral do sistema e métricas principais
          </p>
        </div>
      </div>

      {/* Stats Grid Navy */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
          <StatCard
            title="Eventos Mês"
            value={stats?.totalEventos.toString() || '0'}
            icon={Calendar}
            variant="primary"
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <StatCard
            title="Receita Total"
            value={formatCurrency(stats?.receitaTotal || 0)}
            subtitle="Mês atual"
            icon={DollarSign}
            variant="success"
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <StatCard
            title="Lucro Líquido"
            value={formatCurrency(stats?.lucroLiquido || 0)}
            subtitle={`${stats?.margemLucro.toFixed(1)}% margem`}
            icon={TrendingUp}
            variant="default"
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <StatCard
            title="Cobranças Pendentes"
            value={formatCurrency(stats?.valorCobrancasPendentes || 0)}
            subtitle={`${stats?.cobrancasPendentes || 0} casos`}
            icon={AlertCircle}
            variant="warning"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-2 border-navy-100 hover:border-navy-200 hover:shadow-lg transition-all duration-300 rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-2xl text-navy-800">Financeiro</CardTitle>
            <CardDescription className="text-navy-500">Resumo mensal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200">
              <span className="text-sm font-semibold text-navy-800">Receitas</span>
              <span className="text-xl font-display font-bold text-success">{formatCurrency(stats?.receitaTotal || 0)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl border-2 border-red-200">
              <span className="text-sm font-semibold text-navy-800">Despesas</span>
              <span className="text-xl font-display font-bold text-destructive">{formatCurrency(stats?.despesaTotal || 0)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-navy-50 rounded-xl border-2 border-navy-200">
              <span className="text-sm font-semibold text-navy-800">Lucro</span>
              <span className="text-xl font-display font-bold text-navy-600">{formatCurrency(stats?.lucroLiquido || 0)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-navy-100 hover:border-navy-200 hover:shadow-lg transition-all duration-300 rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-2xl text-navy-800">Estoque</CardTitle>
            <CardDescription className="text-navy-500">Status atual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-navy-50 transition-colors">
              <span className="text-sm font-medium text-navy-700">Disponível</span>
              <Badge className="bg-emerald-100 text-emerald-800 border-2 border-emerald-300 hover:bg-emerald-200">{stats?.estoqueDisponivel || 0} itens</Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-navy-50 transition-colors">
              <span className="text-sm font-medium text-navy-700">Em uso</span>
              <Badge className="bg-navy-100 text-navy-800 border-2 border-navy-300 hover:bg-navy-200">{stats?.estoqueEmUso || 0} itens</Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-navy-50 transition-colors">
              <span className="text-sm font-medium text-navy-700">Manutenção</span>
              <Badge className="bg-amber-100 text-amber-800 border-2 border-amber-300 hover:bg-amber-200">{stats?.estoqueManutencao || 0} itens</Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-navy-50 transition-colors">
              <span className="text-sm font-medium text-navy-700">Perdidos</span>
              <Badge className="bg-red-100 text-red-800 border-2 border-red-300 hover:bg-red-200">{stats?.estoquePerdido || 0} itens</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-navy-100 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-2xl text-navy-800">Alertas do Sistema</CardTitle>
          <CardDescription className="text-navy-500">Notificações importantes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats?.alertas && stats.alertas.length > 0 ? (
            stats.alertas.map((alerta, index) => {
              const Icon = alerta.tipo === 'error' ? AlertCircle : alerta.tipo === 'warning' ? Clock : Package;
              const bgClass = alerta.tipo === 'error' ? 'bg-red-50 border-red-200' : 
                             alerta.tipo === 'warning' ? 'bg-amber-50 border-amber-200' : 
                             'bg-navy-50 border-navy-200';
              const iconBgClass = alerta.tipo === 'error' ? 'bg-red-100' : 
                                 alerta.tipo === 'warning' ? 'bg-amber-100' : 
                                 'bg-navy-100';
              const textClass = alerta.tipo === 'error' ? 'text-red-600' : 
                               alerta.tipo === 'warning' ? 'text-amber-600' : 
                               'text-navy-600';
              
              return (
                <div 
                  key={index} 
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 ${bgClass} animate-fade-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`p-2 rounded-lg ${iconBgClass}`}>
                    <Icon className={`h-5 w-5 ${textClass}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-navy-800 mb-1">{alerta.mensagem}</p>
                    {alerta.detalhes && (
                      <p className="text-xs text-navy-600">{alerta.detalhes}</p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center gap-4 p-6 bg-emerald-50 rounded-xl border-2 border-emerald-200">
              <div className="p-2 rounded-lg bg-emerald-100">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-semibold text-navy-800">Tudo certo!</p>
                <p className="text-xs text-navy-600 mt-1">Nenhum alerta no momento</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderComercialDashboard = () => (
    <div className="space-y-12 animate-fade-in">
      {/* Premium Hero Section - Navy Theme */}
      <div className="relative overflow-hidden rounded-2xl p-8 lg:p-12 bg-white border-2 border-navy-100">
        <div className="relative z-10">
          <p className="text-sm font-medium text-navy-600 mb-2 tracking-wide uppercase">
            {getGreeting()}, {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-navy-800 mb-3 tracking-tight">
            {user?.name}
          </h1>
          <p className="text-lg text-navy-600 max-w-2xl">
            Seus números e eventos
          </p>
        </div>
      </div>

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
            title="Receita Gerada"
            value={formatCurrency(comercialStats?.receitaGerada || 0)}
            subtitle="Mês atual"
            icon={DollarSign}
            variant="default"
          />
        </div>
      </div>

      <Card className="border border-border/50 rounded-2xl hover:shadow-xl transition-all duration-500">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-2xl">Próximos Eventos</CardTitle>
          <CardDescription>Nos próximos 7 dias</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {comercialStats?.eventosProximos && comercialStats.eventosProximos.length > 0 ? (
            comercialStats.eventosProximos.slice(0, 3).map((evento: any, index: number) => {
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
        <Card className="border border-border/50 rounded-2xl hover:shadow-xl transition-all duration-500">
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
                <p className="text-sm font-semibold mb-1">2 orçamentos aguardando resposta</p>
                <p className="text-xs text-muted-foreground">Há mais de 3 dias</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-xl border border-primary/20 hover:bg-primary/10 transition-colors duration-300">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1">1 evento precisa criar demanda</p>
                <p className="text-xs text-muted-foreground">Solicitar alocação de materiais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 rounded-2xl hover:shadow-xl transition-all duration-500">
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
      {/* Premium Hero Section - Navy Theme */}
      <div className="relative overflow-hidden rounded-2xl p-8 lg:p-12 bg-white border-2 border-navy-100">
        <div className="relative z-10">
          <p className="text-sm font-medium text-navy-600 mb-2 tracking-wide uppercase">
            {getGreeting()}, {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-navy-800 mb-3 tracking-tight">
            {user?.name}
          </h1>
          <p className="text-lg text-navy-600 max-w-2xl">
            Operações e demandas
          </p>
        </div>
      </div>

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
            value={suporteStats?.operacoesHoje.toString() || '0'}
            icon={Calendar}
            variant="primary"
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <StatCard
            title="Rastreamentos Ativos"
            value={suporteStats?.rastreamentosAtivos.toString() || '0'}
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
        <Card className="border-destructive/30 bg-destructive/5 rounded-2xl hover:shadow-xl hover:shadow-destructive/10 transition-all duration-500 animate-fade-in">
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
            <div className="flex items-center justify-between p-4 bg-background/80 rounded-xl backdrop-blur-sm">
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
        <Card className="border border-border/50 rounded-2xl hover:shadow-xl transition-all duration-500">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-2xl">Operações Hoje</CardTitle>
            <CardDescription>Agenda do dia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors duration-300">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">14:00 - Enviar materiais</p>
                <p className="text-xs text-muted-foreground">Transportadora TransLog</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors duration-300">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">16:00 - Saída técnicos</p>
                <p className="text-xs text-muted-foreground">Festa João Silva</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors duration-300">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">18:00 - Receber retorno</p>
                <p className="text-xs text-muted-foreground">Evento anterior</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 rounded-2xl hover:shadow-xl transition-all duration-500">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-2xl">Rastreamentos</CardTitle>
            <CardDescription>Status das entregas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
              <div>
                <p className="font-semibold text-sm">BR123456</p>
                <p className="text-xs text-muted-foreground mt-1">Em trânsito</p>
              </div>
              <Badge className="bg-primary">Entrega amanhã</Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
              <div>
                <p className="font-semibold text-sm">BR789012</p>
                <p className="text-xs text-muted-foreground mt-1">Chegou ao destino</p>
              </div>
              <Badge className="bg-success">Entregue</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border/50 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-2xl">Alertas Operacionais</CardTitle>
          <CardDescription>Itens que requerem atenção</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-warning/5 rounded-xl border border-warning/20 hover:bg-warning/10 transition-colors duration-300 animate-fade-in">
            <div className="p-2 rounded-lg bg-warning/10">
              <AlertCircle className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1">3 materiais com retorno atrasado</p>
              <p className="text-xs text-muted-foreground">Entrar em contato com produtores</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-warning/5 rounded-xl border border-warning/20 hover:bg-warning/10 transition-colors duration-300 animate-fade-in" style={{ animationDelay: '75ms' }}>
            <div className="p-2 rounded-lg bg-warning/10">
              <Package className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1">2 itens em manutenção há 10+ dias</p>
              <p className="text-xs text-muted-foreground">Verificar status</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      {user?.role === 'admin' && renderAdminDashboard()}
      {user?.role === 'comercial' && renderComercialDashboard()}
      {user?.role === 'suporte' && renderSuporteDashboard()}
    </>
  );
};

export default Dashboard;
