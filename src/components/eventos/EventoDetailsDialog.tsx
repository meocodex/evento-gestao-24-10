import { Evento } from '@/types/eventos';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEventoPermissions } from '@/hooks/useEventoPermissions';
import { DadosEvento } from './secoes/DadosEvento';
import { MateriaisEvento } from './secoes/MateriaisEvento';
import { OperacaoEvento } from './secoes/OperacaoEvento';
import { FinanceiroEvento } from './secoes/FinanceiroEvento';

interface EventoDetailsDialogProps {
  evento: Evento | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventoDetailsDialog({ evento, open, onOpenChange }: EventoDetailsDialogProps) {
  const permissions = useEventoPermissions(evento || undefined);

  if (!evento) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{evento.nome}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="dados" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="materiais">Materiais</TabsTrigger>
            <TabsTrigger value="operacao">Operação</TabsTrigger>
            <TabsTrigger value="financeiro" disabled={!permissions.canViewFinancial}>
              Financeiro
            </TabsTrigger>
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

          <TabsContent value="financeiro" className="mt-6">
            <FinanceiroEvento evento={evento} permissions={permissions} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
