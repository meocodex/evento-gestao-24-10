import { Evento } from '@/types/eventos';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermissions } from '@/hooks/usePermissions';
import { DadosEvento } from './secoes/DadosEvento';
import { MateriaisEvento } from './secoes/MateriaisEvento';
import { OperacaoEvento } from './secoes/OperacaoEvento';
import { FinanceiroEvento } from './secoes/FinanceiroEvento';
import { DemandasEvento } from './secoes/DemandasEvento';
import { ContratosEvento } from './secoes/ContratosEvento';

interface EventoDetailsDialogProps {
  evento: Evento | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventoDetailsDialog({ evento, open, onOpenChange }: EventoDetailsDialogProps) {
  const permissions = usePermissions(evento || undefined);

  if (!evento) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{evento.nome}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="dados" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="materiais">Materiais</TabsTrigger>
            <TabsTrigger value="operacao">Operação</TabsTrigger>
            <TabsTrigger value="demandas">Demandas</TabsTrigger>
            <TabsTrigger value="financeiro" disabled={!permissions.isLoading && !permissions.canViewFinancial}>
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="contratos">Contratos</TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="mt-6">
            <DadosEvento evento={evento} permissions={permissions} />
          </TabsContent>

          <TabsContent value="materiais" className="mt-6">
            <MateriaisEvento evento={evento} permissions={permissions} />
          </TabsContent>

          <TabsContent value="operacao" className="mt-6">
            <OperacaoEvento evento={evento} permissions={permissions} />
          </TabsContent>

          <TabsContent value="demandas" className="mt-6">
            <DemandasEvento eventoId={evento.id} />
          </TabsContent>

          <TabsContent value="financeiro" className="mt-6">
            <FinanceiroEvento evento={evento} permissions={permissions} />
          </TabsContent>

          <TabsContent value="contratos" className="mt-6">
            <ContratosEvento evento={evento} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
