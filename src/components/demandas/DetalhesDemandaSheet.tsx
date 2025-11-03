import { Demanda } from '@/types/demandas';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { DemandaDados } from './secoes/DemandaDados';
import { DemandaComentarios } from './secoes/DemandaComentarios';
import { DemandaAnexos } from './secoes/DemandaAnexos';
import { DemandaReembolso } from './secoes/DemandaReembolso';
import { Badge } from '@/components/ui/badge';
import { PrazoIndicador } from './PrazoIndicador';
import { DollarSign, Archive, CheckCircle2 } from 'lucide-react';

interface DetalhesDemandaSheetProps {
  demanda: Demanda | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditar?: () => void;
}

const statusConfig = {
  aberta: { label: 'Aberta', variant: 'default' as const },
  'em-andamento': { label: 'Em Andamento', variant: 'secondary' as const },
  concluida: { label: 'Concluída', variant: 'outline' as const },
  cancelada: { label: 'Cancelada', variant: 'destructive' as const },
};

export function DetalhesDemandaSheet({ demanda, open, onOpenChange, onEditar }: DetalhesDemandaSheetProps) {
  const isMobile = useIsMobile();

  if (!demanda) return null;

  const isReembolso = demanda.categoria === 'reembolso' && demanda.dadosReembolso;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"}
        className="w-full sm:w-[90%] lg:w-[85%] xl:w-[75%] p-0 flex flex-col gap-0"
      >
        <SheetHeader className="px-6 py-4 border-b space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <SheetTitle className="text-2xl font-semibold truncate">
                  {demanda.titulo}
                </SheetTitle>
                <Badge variant="outline" className="font-mono text-xs">
                  #{demanda.numeroId}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {isReembolso && (
                  <Badge className="bg-purple-100 text-purple-800">
                    <DollarSign className="mr-1 h-3 w-3" />
                    Reembolso
                  </Badge>
                )}
                <Badge variant={statusConfig[demanda.status].variant}>
                  {statusConfig[demanda.status].label}
                </Badge>
                {demanda.arquivada && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    <Archive className="mr-1 h-3 w-3" />
                    Arquivada
                  </Badge>
                )}
                {demanda.resolvida && !demanda.arquivada && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Resolvida
                  </Badge>
                )}
                {demanda.prazo && !demanda.arquivada && (
                  <PrazoIndicador prazo={demanda.prazo} />
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="dados" className="flex-1 flex flex-col min-h-0">
          <TabsList className="px-6 pt-3 justify-start w-full overflow-x-auto flex-shrink-0 rounded-none border-b bg-transparent">
            <TabsTrigger value="dados" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent">
              Dados
            </TabsTrigger>
            <TabsTrigger value="comentarios" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent">
              Comentários
            </TabsTrigger>
            <TabsTrigger value="anexos" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent">
              Anexos
            </TabsTrigger>
            {isReembolso && (
              <TabsTrigger value="reembolso" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent">
                Reembolso
              </TabsTrigger>
            )}
          </TabsList>

          <ScrollArea className="flex-1 px-6">
            <div className="py-6">
              <TabsContent value="dados" className="mt-0">
                <DemandaDados demanda={demanda} onEditar={onEditar} />
              </TabsContent>

              <TabsContent value="comentarios" className="mt-0">
                <DemandaComentarios demanda={demanda} />
              </TabsContent>

              <TabsContent value="anexos" className="mt-0">
                <DemandaAnexos demanda={demanda} />
              </TabsContent>

              {isReembolso && (
                <TabsContent value="reembolso" className="mt-0">
                  <DemandaReembolso demanda={demanda} />
                </TabsContent>
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
