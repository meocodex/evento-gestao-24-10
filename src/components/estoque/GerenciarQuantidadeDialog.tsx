import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Minus, RefreshCw } from 'lucide-react';

const quantidadeSchema = z.object({
  quantidade: z.coerce.number().positive('Quantidade deve ser positiva'),
  motivo: z.string().min(3, 'Motivo deve ter no mínimo 3 caracteres'),
  observacoes: z.string().optional(),
});

type QuantidadeFormData = z.infer<typeof quantidadeSchema>;

interface GerenciarQuantidadeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialId: string;
  materialNome: string;
  quantidadeAtual: number;
}

export function GerenciarQuantidadeDialog({
  open,
  onOpenChange,
  materialId,
  materialNome,
  quantidadeAtual,
}: GerenciarQuantidadeDialogProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'entrada' | 'saida' | 'ajuste'>('entrada');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<QuantidadeFormData>({
    resolver: zodResolver(quantidadeSchema),
  });

  const quantidade = watch('quantidade');

  const onSubmit = async (data: QuantidadeFormData) => {
    setLoading(true);
    try {
      let novaQuantidadeTotal = quantidadeAtual;
      let tipoOperacao = '';

      if (activeTab === 'entrada') {
        novaQuantidadeTotal = quantidadeAtual + data.quantidade;
        tipoOperacao = 'entrada_estoque';
      } else if (activeTab === 'saida') {
        novaQuantidadeTotal = Math.max(0, quantidadeAtual - data.quantidade);
        tipoOperacao = 'consumo';
      } else if (activeTab === 'ajuste') {
        novaQuantidadeTotal = data.quantidade;
        tipoOperacao = 'ajuste_inventario';
      }

      // Atualizar quantidade no estoque
      const { error: updateError } = await supabase
        .from('materiais_estoque')
        .update({
          quantidade_total: novaQuantidadeTotal,
          quantidade_disponivel: novaQuantidadeTotal,
        })
        .eq('id', materialId);

      if (updateError) throw updateError;

      // Registrar no histórico
      const { error: historicoError } = await supabase
        .from('materiais_historico_movimentacao')
        .insert({
          material_id: materialId,
          tipo_operacao: tipoOperacao,
          quantidade: data.quantidade,
          motivo: data.motivo,
          observacoes: data.observacoes,
        });

      if (historicoError) console.error('Erro ao registrar histórico:', historicoError);

      queryClient.invalidateQueries({ queryKey: ['materiais_estoque'] });
      
      toast({
        title: 'Quantidade atualizada',
        description: `${materialNome} agora tem ${novaQuantidadeTotal} unidades em estoque.`,
      });

      reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro ao atualizar',
        description: error instanceof Error ? error.message : 'Ocorreu um erro.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Quantidade</DialogTitle>
          <p className="text-sm text-muted-foreground">{materialNome}</p>
          <p className="text-sm">
            <span className="text-muted-foreground">Quantidade atual:</span>{' '}
            <span className="font-semibold text-primary">{quantidadeAtual} unidades</span>
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="entrada">
              <Plus className="h-4 w-4 mr-2" />
              Entrada
            </TabsTrigger>
            <TabsTrigger value="saida">
              <Minus className="h-4 w-4 mr-2" />
              Saída
            </TabsTrigger>
            <TabsTrigger value="ajuste">
              <RefreshCw className="h-4 w-4 mr-2" />
              Ajuste
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <TabsContent value="entrada" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade a adicionar *</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  placeholder="Ex: 50"
                  {...register('quantidade')}
                />
                {errors.quantidade && (
                  <p className="text-sm text-destructive">{errors.quantidade.message}</p>
                )}
                {quantidade && (
                  <p className="text-sm text-muted-foreground">
                    Nova quantidade total: <strong>{quantidadeAtual + Number(quantidade)}</strong>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo *</Label>
                <Input
                  id="motivo"
                  placeholder="Ex: Compra, Devolução de evento"
                  {...register('motivo')}
                />
                {errors.motivo && (
                  <p className="text-sm text-destructive">{errors.motivo.message}</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="saida" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade a remover *</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  max={quantidadeAtual}
                  placeholder="Ex: 20"
                  {...register('quantidade')}
                />
                {errors.quantidade && (
                  <p className="text-sm text-destructive">{errors.quantidade.message}</p>
                )}
                {quantidade && (
                  <p className="text-sm text-muted-foreground">
                    Nova quantidade total: <strong>{Math.max(0, quantidadeAtual - Number(quantidade))}</strong>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo *</Label>
                <Input
                  id="motivo"
                  placeholder="Ex: Usado em evento, Perda, Descarte"
                  {...register('motivo')}
                />
                {errors.motivo && (
                  <p className="text-sm text-destructive">{errors.motivo.message}</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="ajuste" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="quantidade">Nova quantidade total *</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="0"
                  placeholder="Ex: 100"
                  {...register('quantidade')}
                />
                {errors.quantidade && (
                  <p className="text-sm text-destructive">{errors.quantidade.message}</p>
                )}
                {quantidade !== undefined && (
                  <p className="text-sm text-muted-foreground">
                    Diferença: <strong>{Number(quantidade) - quantidadeAtual > 0 ? '+' : ''}{Number(quantidade) - quantidadeAtual}</strong>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo *</Label>
                <Input
                  id="motivo"
                  placeholder="Ex: Inventário físico, Correção de estoque"
                  {...register('motivo')}
                />
                {errors.motivo && (
                  <p className="text-sm text-destructive">{errors.motivo.message}</p>
                )}
              </div>
            </TabsContent>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Informações adicionais (opcional)"
                {...register('observacoes')}
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Processando...' : 'Confirmar'}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
