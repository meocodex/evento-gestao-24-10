import { BarChart3, FileText, Download, Package, Wrench, AlertTriangle, XCircle, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import { useRelatoriosStats } from '@/hooks/useRelatoriosStats';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { StatCard } from '@/components/dashboard/StatCard';

interface Relatorio {
  id: number;
  nome: string;
  descricao: string;
  icon: typeof FileText | typeof BarChart3;
  permissoes: string[];
}

export default function Relatorios() {
  const { hasAllPermissions } = usePermissions();
  const { data: estoqueStats, isLoading } = useRelatoriosStats();

  const todosRelatorios: Relatorio[] = [
    { 
      id: 1, 
      nome: 'Eventos por Período', 
      descricao: 'Listagem completa de eventos', 
      icon: FileText,
      permissoes: ['eventos.visualizar', 'relatorios.gerar']
    },
    { 
      id: 2, 
      nome: 'Análise Financeira', 
      descricao: 'Receitas, despesas e lucro', 
      icon: BarChart3,
      permissoes: ['financeiro.visualizar', 'relatorios.gerar']
    },
    { 
      id: 3, 
      nome: 'Utilização de Estoque', 
      descricao: 'Materiais mais utilizados', 
      icon: BarChart3,
      permissoes: ['estoque.visualizar', 'relatorios.gerar']
    },
    { 
      id: 4, 
      nome: 'Performance de Equipe', 
      descricao: 'Reembolsos e demandas', 
      icon: FileText,
      permissoes: ['equipe.visualizar', 'demandas.visualizar', 'relatorios.gerar']
    },
    { 
      id: 5, 
      nome: 'Clientes Ativos', 
      descricao: 'Análise de relacionamento', 
      icon: BarChart3,
      permissoes: ['clientes.visualizar', 'relatorios.gerar']
    },
    { 
      id: 6, 
      nome: 'Transportadoras', 
      descricao: 'Performance de envios', 
      icon: FileText,
      permissoes: ['transportadoras.visualizar', 'relatorios.gerar']
    },
  ];

  // Filtrar relatórios baseado nas permissões do usuário
  const relatoriosDisponiveis = todosRelatorios.filter(r => 
    hasAllPermissions(r.permissoes)
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-fade-in">

        {/* Seção: Visão Geral do Estoque */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">Visão Geral do Estoque</h2>
            <p className="text-sm text-muted-foreground">Status atual dos materiais</p>
          </div>

          <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-5">
            <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
              <StatCard
                title="Disponível"
                value={estoqueStats?.estoqueDisponivel.toString() || '0'}
                subtitle="Pronto para uso"
                icon={Package}
                variant="success"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
              <StatCard
                title="Em Uso"
                value={estoqueStats?.estoqueEmUso.toString() || '0'}
                subtitle="Alocado em eventos"
                icon={Activity}
                variant="primary"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <StatCard
                title="Manutenção"
                value={estoqueStats?.estoqueManutencao.toString() || '0'}
                subtitle="Em reparo"
                icon={Wrench}
                variant="warning"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
              <StatCard
                title="Perdido"
                value={estoqueStats?.estoquePerdido.toString() || '0'}
                subtitle="Extraviado"
                icon={AlertTriangle}
                variant="danger"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
              <StatCard
                title="Consumido"
                value={estoqueStats?.estoqueConsumido.toString() || '0'}
                subtitle="Baixado"
                icon={XCircle}
                variant="default"
              />
            </div>
          </div>
        </div>

        {/* Seção: Relatórios Disponíveis */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">Relatórios Disponíveis</h2>
            <p className="text-sm text-muted-foreground">Exportações e análises detalhadas</p>
          </div>

          {relatoriosDisponiveis.length === 0 ? (
            <Card className="rounded-xl">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Você não possui permissões para gerar relatórios.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {relatoriosDisponiveis.map((relatorio) => (
                <Card key={relatorio.id} className="hover:shadow-md transition-shadow rounded-xl">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <relatorio.icon className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{relatorio.nome}</CardTitle>
                        <CardDescription>{relatorio.descricao}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Gerar Relatório
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
