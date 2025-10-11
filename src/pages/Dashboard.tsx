import { useAuth } from '@/contexts/AuthContext';
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
    <div className="space-y-12 animate-fade-in">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden rounded-3xl p-12 lg:p-16 bg-gradient-to-br from-primary/8 via-accent/4 to-transparent border border-primary/10">
        {/* Subtle animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-accent/3 opacity-50" />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />
        </div>
        
        <div className="relative z-10">
          <p className="text-sm font-medium text-primary mb-3 tracking-wide uppercase">
            {getGreeting()}, {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
          <h1 className="text-5xl lg:text-6xl font-display font-bold text-foreground mb-4 tracking-tight">
            {user?.name}
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
            Visão geral do sistema e métricas principais
          </p>
        </div>
      </div>

      {/* Stats Grid com stagger animation */}
      <div className="grid gap-6 lg:gap-8 md:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
        <Card className="hover:shadow-xl transition-all duration-500 border border-border/50 rounded-2xl hover:border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-2xl">Financeiro</CardTitle>
            <CardDescription>Resumo mensal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-success/10 to-emerald-500/10 rounded-xl border border-success/20 hover:shadow-md transition-shadow">
              <span className="text-sm font-semibold">Receitas</span>
              <span className="text-xl font-display font-bold text-success">{formatCurrency(stats?.receitaTotal || 0)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-destructive/10 to-rose-500/10 rounded-xl border border-destructive/20 hover:shadow-md transition-shadow">
              <span className="text-sm font-semibold">Despesas</span>
              <span className="text-xl font-display font-bold text-destructive">{formatCurrency(stats?.despesaTotal || 0)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20 hover:shadow-md transition-shadow">
              <span className="text-sm font-semibold">Lucro</span>
              <span className="text-xl font-display font-bold text-primary">{formatCurrency(stats?.lucroLiquido || 0)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-500 border border-border/50 rounded-2xl hover:border-accent/20">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-2xl">Estoque</CardTitle>
            <CardDescription>Status atual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-success/5 transition-colors">
              <span className="text-sm font-medium">Disponível</span>
              <Badge variant="success" className="shadow-sm">{stats?.estoqueDisponivel || 0} itens</Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-primary/5 transition-colors">
              <span className="text-sm font-medium">Em uso</span>
              <Badge className="shadow-sm">{stats?.estoqueEmUso || 0} itens</Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-warning/5 transition-colors">
              <span className="text-sm font-medium">Manutenção</span>
              <Badge variant="warning" className="shadow-sm">{stats?.estoqueManutencao || 0} itens</Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-destructive/5 transition-colors">
              <span className="text-sm font-medium">Perdidos</span>
              <Badge variant="destructive" className="shadow-sm">{stats?.estoquePerdido || 0} itens</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border/50 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-2xl">Alertas do Sistema</CardTitle>
          <CardDescription>Notificações importantes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats?.alertas && stats.alertas.length > 0 ? (
            stats.alertas.map((alerta, index) => {
              const Icon = alerta.tipo === 'error' ? AlertCircle : alerta.tipo === 'warning' ? Clock : Package;
              const bgClass = alerta.tipo === 'error' ? 'bg-destructive/5 border-destructive/20' : 
                             alerta.tipo === 'warning' ? 'bg-warning/5 border-warning/20' : 
                             'bg-primary/5 border-primary/20';
              const textClass = alerta.tipo === 'error' ? 'text-destructive' : 
                               alerta.tipo === 'warning' ? 'text-warning' : 
                               'text-primary';
              
              return (
                <div 
                  key={index} 
                  className={`flex items-start gap-4 p-4 rounded-xl border ${bgClass} animate-fade-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`p-2 rounded-lg ${alerta.tipo === 'error' ? 'bg-destructive/10' : alerta.tipo === 'warning' ? 'bg-warning/10' : 'bg-primary/10'}`}>
                    <Icon className={`h-5 w-5 ${textClass}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-1">{alerta.mensagem}</p>
                    {alerta.detalhes && (
                      <p className="text-xs text-muted-foreground">{alerta.detalhes}</p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center gap-4 p-6 bg-success/5 rounded-xl border border-success/20">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-semibold">Tudo certo!</p>
                <p className="text-xs text-muted-foreground mt-1">Nenhum alerta no momento</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderComercialDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Bem-vindo, {user?.name}</h2>
        <p className="text-muted-foreground mt-1">Seus números e eventos</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Meus Eventos"
          value={comercialStats?.meusEventos.toString() || '0'}
          subtitle="Mês atual"
          icon={Calendar}
          variant="primary"
        />
        <StatCard
          title="Orçamentos"
          value={comercialStats?.orcamentosEmAnalise.toString() || '0'}
          subtitle="Em análise"
          icon={Users}
          variant="default"
        />
        <StatCard
          title="Contratos"
          value={comercialStats?.contratosFechados.toString() || '0'}
          subtitle="Fechados"
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          title="Receita Gerada"
          value={formatCurrency(comercialStats?.receitaGerada || 0)}
          subtitle="Mês atual"
          icon={DollarSign}
          variant="default"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximos Eventos</CardTitle>
          <CardDescription>Nos próximos 7 dias</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {comercialStats?.eventosProximos && comercialStats.eventosProximos.length > 0 ? (
            comercialStats.eventosProximos.slice(0, 3).map((evento: any) => {
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
                <div key={evento.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Evento #{evento.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
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
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum evento próximo</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ações Necessárias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-warning/5 rounded-lg border border-warning/20">
              <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <p className="text-sm font-medium">2 orçamentos aguardando resposta</p>
                <p className="text-xs text-muted-foreground mt-1">Há mais de 3 dias</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">1 evento precisa criar demanda</p>
                <p className="text-xs text-muted-foreground mt-1">Solicitar alocação de materiais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Minhas Demandas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Criadas aguardando</span>
              <Badge variant="outline" className="bg-warning/10 text-warning">
                {comercialStats?.demandasCriadas || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Concluídas hoje</span>
              <Badge variant="outline" className="bg-success/10 text-success">
                {comercialStats?.demandasConcluidas || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSuporteDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Bem-vindo, {user?.name}</h2>
        <p className="text-muted-foreground mt-1">Operações e demandas</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Demandas Pendentes"
          value={suporteStats?.demandasPendentes.toString() || '0'}
          icon={AlertCircle}
          variant="warning"
        />
        <StatCard
          title="Operações Hoje"
          value={suporteStats?.operacoesHoje.toString() || '0'}
          icon={Calendar}
          variant="primary"
        />
        <StatCard
          title="Rastreamentos Ativos"
          value={suporteStats?.rastreamentosAtivos.toString() || '0'}
          icon={Package}
          variant="default"
        />
        <StatCard
          title="Retornos Atrasados"
          value={suporteStats?.retornosAtrasados.toString() || '0'}
          icon={Clock}
          variant="danger"
        />
      </div>

      {suporteStats && suporteStats.demandasUrgentes > 0 && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Demandas Urgentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div>
                <p className="font-medium">{suporteStats.demandasUrgentes} demanda{suporteStats.demandasUrgentes > 1 ? 's' : ''} urgente{suporteStats.demandasUrgentes > 1 ? 's' : ''}</p>
                <p className="text-sm text-muted-foreground">Requer atenção imediata</p>
              </div>
              <Badge variant="destructive">URGENTE</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Operações Hoje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">14:00 - Enviar materiais</p>
                <p className="text-xs text-muted-foreground">Transportadora TransLog</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">16:00 - Saída técnicos</p>
                <p className="text-xs text-muted-foreground">Festa João Silva</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">18:00 - Receber retorno</p>
                <p className="text-xs text-muted-foreground">Evento anterior</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rastreamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium text-sm">BR123456</p>
                <p className="text-xs text-muted-foreground">Em trânsito</p>
              </div>
              <Badge className="bg-primary">Entrega amanhã</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium text-sm">BR789012</p>
                <p className="text-xs text-muted-foreground">Chegou ao destino</p>
              </div>
              <Badge className="bg-success">Entregue</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alertas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-warning/5 rounded-lg border border-warning/20">
            <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <p className="text-sm font-medium">3 materiais com retorno atrasado</p>
              <p className="text-xs text-muted-foreground mt-1">Entrar em contato com produtores</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-warning/5 rounded-lg border border-warning/20">
            <Package className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <p className="text-sm font-medium">2 itens em manutenção há 10+ dias</p>
              <p className="text-xs text-muted-foreground mt-1">Verificar status</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6">
      {user?.role === 'admin' && renderAdminDashboard()}
      {user?.role === 'comercial' && renderComercialDashboard()}
      {user?.role === 'suporte' && renderSuporteDashboard()}
    </div>
  );
};

export default Dashboard;
