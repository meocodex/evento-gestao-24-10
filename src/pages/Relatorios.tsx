import { BarChart3, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Relatorios() {
  const relatorios = [
    { id: 1, nome: 'Eventos por Período', descricao: 'Listagem completa de eventos', icon: FileText },
    { id: 2, nome: 'Análise Financeira', descricao: 'Receitas, despesas e lucro', icon: BarChart3 },
    { id: 3, nome: 'Utilização de Estoque', descricao: 'Materiais mais utilizados', icon: BarChart3 },
    { id: 4, nome: 'Performance de Equipe', descricao: 'Reembolsos e demandas', icon: FileText },
    { id: 5, nome: 'Clientes Ativos', descricao: 'Análise de relacionamento', icon: BarChart3 },
    { id: 6, nome: 'Transportadoras', descricao: 'Performance de envios', icon: FileText },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-fade-in bg-navy-50 dark:bg-navy-950">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-navy-900 dark:text-navy-50">Relatórios</h1>
          <p className="text-sm sm:text-base text-navy-600 dark:text-navy-400 mt-1">Análises e exportações de dados</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {relatorios.map((relatorio) => (
            <Card key={relatorio.id} className="hover:shadow-md transition-shadow">
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
      </div>
    </div>
  );
}
