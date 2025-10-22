import { Evento } from '@/types/eventos';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePermissions } from '@/hooks/usePermissions';
import { useIsMobile } from '@/hooks/use-mobile';
import { DadosEvento } from './secoes/DadosEvento';
import { MateriaisEvento } from './secoes/MateriaisEvento';
import { OperacaoEvento } from './secoes/OperacaoEvento';
import { FinanceiroEvento } from './secoes/FinanceiroEvento';
import { DemandasEvento } from './secoes/DemandasEvento';
import { ContratosEvento } from './secoes/ContratosEvento';
import { StatusBadge } from '../shared/StatusBadge';

interface EventoDetailsSheetProps {
  evento: Evento | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventoDetailsSheet({ evento, open, onOpenChange }: EventoDetailsSheetProps) {
  const permissions = usePermissions(evento || undefined);
  const isMobile = useIsMobile();

  if (!evento) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"}
        className="w-full sm:w-[90%] lg:w-[85%] xl:w-[75%] p-0 flex flex-col gap-0"
      >
        <SheetHeader className="px-6 py-4 border-b space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-2xl font-semibold truncate">
                {evento.nome}
              </SheetTitle>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={evento.status} />
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="dados" className="flex-1 flex flex-col min-h-0">
          <TabsList className="px-6 pt-3 justify-start w-full overflow-x-auto flex-shrink-0 rounded-none border-b bg-transparent">
            <TabsTrigger value="dados" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent">
              Dados
            </TabsTrigger>
            <TabsTrigger value="materiais" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent">
              Materiais
            </TabsTrigger>
            <TabsTrigger value="operacao" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent">
              Operação
            </TabsTrigger>
            <TabsTrigger value="demandas" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent">
              Demandas
            </TabsTrigger>
            <TabsTrigger 
              value="financeiro" 
              disabled={!permissions.isLoading && !permissions.canViewFinancial}
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent"
            >
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="contratos" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent">
              Contratos
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 px-6">
            <div className="py-6">
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
            </div>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
