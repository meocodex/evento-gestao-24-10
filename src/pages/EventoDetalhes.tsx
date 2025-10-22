import { useParams, useNavigate } from 'react-router-dom';
import { useEventos } from '@/contexts/EventosContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { DadosEvento } from '@/components/eventos/secoes/DadosEvento';
import { MateriaisEvento } from '@/components/eventos/secoes/MateriaisEvento';
import { OperacaoEvento } from '@/components/eventos/secoes/OperacaoEvento';
import { FinanceiroEvento } from '@/components/eventos/secoes/FinanceiroEvento';
import { DemandasEvento } from '@/components/eventos/secoes/DemandasEvento';
import { ContratosEvento } from '@/components/eventos/secoes/ContratosEvento';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';

export default function EventoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { eventos } = useEventos();
  
  const evento = eventos.find(e => e.id === id);
  const permissions = usePermissions(evento);
  
  if (!evento) {
    return (
      <div className="min-h-screen bg-navy-50 dark:bg-navy-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-navy-900 dark:text-navy-50">Evento não encontrado</h2>
          <p className="text-muted-foreground">O evento que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => navigate('/eventos')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Eventos
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-navy-50 dark:bg-navy-950">
      {/* Header fixo */}
      <div className="bg-card border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/eventos')}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-navy-900 dark:text-navy-50 truncate">
                  {evento.nome}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={evento.status} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Conteúdo */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <Tabs defaultValue="dados" className="space-y-6">
          <TabsList className="bg-card/60 backdrop-blur-xl border border-border/40 p-1">
            <TabsTrigger value="dados" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Dados
            </TabsTrigger>
            <TabsTrigger value="materiais" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Materiais
            </TabsTrigger>
            <TabsTrigger value="operacao" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Operação
            </TabsTrigger>
            <TabsTrigger value="demandas" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Demandas
            </TabsTrigger>
            <TabsTrigger 
              value="financeiro" 
              disabled={!permissions.isLoading && !permissions.canViewFinancial}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="contratos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Contratos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dados" className="mt-0">
            <DadosEvento evento={evento} permissions={permissions} />
          </TabsContent>

          <TabsContent value="materiais" className="mt-0">
            <MateriaisEvento evento={evento} permissions={permissions} />
          </TabsContent>

          <TabsContent value="operacao" className="mt-0">
            <OperacaoEvento evento={evento} permissions={permissions} />
          </TabsContent>

          <TabsContent value="demandas" className="mt-0">
            <DemandasEvento eventoId={evento.id} />
          </TabsContent>

          <TabsContent value="financeiro" className="mt-0">
            <FinanceiroEvento evento={evento} permissions={permissions} />
          </TabsContent>

          <TabsContent value="contratos" className="mt-0">
            <ContratosEvento evento={evento} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
