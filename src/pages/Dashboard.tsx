import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Package, Users, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const renderAdminDashboard = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Header com glassmorphism */}
      <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="relative z-10">
          <h2 className="text-4xl font-display font-bold text-foreground mb-2">
            Bem-vindo, {user?.name}
          </h2>
          <p className="text-lg text-muted-foreground">Visão geral do sistema</p>
        </div>
      </div>

      {/* Stats Grid com stagger animation */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
          <StatCard
            title="Eventos Mês"
            value="24"
            icon={Calendar}
            variant="primary"
            trend={{ value: '+12%', isPositive: true }}
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <StatCard
            title="Receita Total"
            value="R$ 185.000"
            subtitle="Mês atual"
            icon={DollarSign}
            variant="success"
            trend={{ value: '+23%', isPositive: true }}
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <StatCard
            title="Lucro Líquido"
            value="R$ 107.000"
            subtitle="57,8% margem"
            icon={TrendingUp}
            variant="default"
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <StatCard
            title="Cobranças Pendentes"
            value="R$ 3.450"
            subtitle="5 casos"
            icon={AlertCircle}
            variant="warning"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
          <CardHeader>
            <CardTitle className="font-display">Financeiro</CardTitle>
            <CardDescription>Resumo mensal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-success/10 to-emerald-500/10 rounded-xl border border-success/20 hover:shadow-md transition-shadow">
              <span className="text-sm font-semibold">Receitas</span>
              <span className="text-xl font-display font-bold text-success">R$ 185.000</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-destructive/10 to-rose-500/10 rounded-xl border border-destructive/20 hover:shadow-md transition-shadow">
              <span className="text-sm font-semibold">Despesas</span>
              <span className="text-xl font-display font-bold text-destructive">R$ 78.000</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20 hover:shadow-md transition-shadow">
              <span className="text-sm font-semibold">Lucro</span>
              <span className="text-xl font-display font-bold text-primary">R$ 107.000</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-accent/20">
          <CardHeader>
            <CardTitle className="font-display">Estoque</CardTitle>
            <CardDescription>Status atual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-success/5 transition-colors">
              <span className="text-sm font-medium">Disponível</span>
              <Badge variant="success" className="shadow-sm">420 itens</Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-primary/5 transition-colors">
              <span className="text-sm font-medium">Em uso</span>
              <Badge className="shadow-sm">85 itens</Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-warning/5 transition-colors">
              <span className="text-sm font-medium">Manutenção</span>
              <Badge variant="warning" className="shadow-sm">12 itens</Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-destructive/5 transition-colors">
              <span className="text-sm font-medium">Perdidos (mês)</span>
              <Badge variant="destructive" className="shadow-sm">8 itens</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alertas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="text-sm font-medium">2 cobranças atrasadas há 15+ dias</p>
              <p className="text-xs text-muted-foreground mt-1">Requer ação imediata</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-warning/5 rounded-lg border border-warning/20">
            <Clock className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <p className="text-sm font-medium">1 evento acima de R$ 50k (revisar)</p>
              <p className="text-xs text-muted-foreground mt-1">Validação necessária</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <Package className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Estoque de cabos XLR baixo</p>
              <p className="text-xs text-muted-foreground mt-1">Reabastecer em breve</p>
            </div>
          </div>
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
          value="12"
          subtitle="Mês atual"
          icon={Calendar}
          variant="primary"
        />
        <StatCard
          title="Orçamentos"
          value="18"
          subtitle="Em análise"
          icon={Users}
          variant="default"
        />
        <StatCard
          title="Contratos"
          value="10"
          subtitle="Fechados"
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          title="Receita Gerada"
          value="R$ 85.000"
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
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Festa de Aniversário</p>
              <p className="text-sm text-muted-foreground">15/10 - Faltam 5 dias</p>
            </div>
            <Badge className="bg-success">Confirmado</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Show Musical</p>
              <p className="text-sm text-muted-foreground">18/10 - Faltam 8 dias</p>
            </div>
            <Badge className="bg-primary">Materiais Alocados</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Evento Corporativo</p>
              <p className="text-sm text-muted-foreground">22/10 - Faltam 12 dias</p>
            </div>
            <Badge variant="outline" className="bg-warning/10 text-warning">Aguardando Alocação</Badge>
          </div>
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
              <Badge variant="outline" className="bg-warning/10 text-warning">1</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Concluídas hoje</span>
              <Badge variant="outline" className="bg-success/10 text-success">2</Badge>
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
          value="5"
          icon={AlertCircle}
          variant="warning"
        />
        <StatCard
          title="Operações Hoje"
          value="3"
          icon={Calendar}
          variant="primary"
        />
        <StatCard
          title="Rastreamentos Ativos"
          value="2"
          icon={Package}
          variant="default"
        />
        <StatCard
          title="Retornos Atrasados"
          value="3"
          icon={Clock}
          variant="danger"
        />
      </div>

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
              <p className="font-medium">Alocar materiais - Festa</p>
              <p className="text-sm text-muted-foreground">Evento em 15/10</p>
            </div>
            <Badge variant="destructive">URGENTE</Badge>
          </div>
        </CardContent>
      </Card>

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
