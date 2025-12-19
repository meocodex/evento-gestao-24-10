import { useState } from 'react';
import { BarChart3, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FluxoCaixaChart, DespesasPorCategoriaChart, VencimentosProximosChart } from './FinanceiroCharts';
import type { ContaPagar, ContaReceber } from '@/types/financeiro';

interface FinanceiroChartsDrawerProps {
  contasPagar: ContaPagar[];
  contasReceber: ContaReceber[];
}

export function FinanceiroChartsDrawer({ contasPagar, contasReceber }: FinanceiroChartsDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Gráficos</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-6xl">
          <DrawerHeader className="flex flex-row items-center justify-between">
            <div>
              <DrawerTitle className="text-xl">Análises Financeiras</DrawerTitle>
              <DrawerDescription>
                Visualize o fluxo de caixa, despesas por categoria e projeção de vencimentos
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <div className="px-4 pb-6 overflow-y-auto max-h-[70vh]">
            <Tabs defaultValue="fluxo" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-4">
                <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
                <TabsTrigger value="categorias">Por Categoria</TabsTrigger>
                <TabsTrigger value="vencimentos">Vencimentos</TabsTrigger>
              </TabsList>

              <TabsContent value="fluxo" className="mt-0">
                <FluxoCaixaChart 
                  contasPagar={contasPagar} 
                  contasReceber={contasReceber} 
                  meses={6} 
                />
              </TabsContent>

              <TabsContent value="categorias" className="mt-0">
                <DespesasPorCategoriaChart contasPagar={contasPagar} />
              </TabsContent>

              <TabsContent value="vencimentos" className="mt-0">
                <VencimentosProximosChart 
                  contasPagar={contasPagar} 
                  contasReceber={contasReceber} 
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
