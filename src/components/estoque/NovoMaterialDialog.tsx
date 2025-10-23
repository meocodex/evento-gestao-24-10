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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEstoque } from '@/hooks/estoque';
import { useCategorias } from '@/contexts/CategoriasContext';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from '@/hooks/use-toast';

const materialSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  descricao: z.string().optional(),
  valorUnitario: z.coerce.number().positive('Valor deve ser positivo').optional().or(z.literal('')),
});

type MaterialFormData = z.infer<typeof materialSchema>;

interface NovoMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovoMaterialDialog({ open, onOpenChange }: NovoMaterialDialogProps) {
  const { adicionarMaterial } = useEstoque();
  const { categoriasEstoque } = useCategorias();
  const { hasPermission } = usePermissions();
  const [loading, setLoading] = useState(false);

  const podeEditar = hasPermission('estoque.editar');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
  });

  const categoria = watch('categoria');

  const onSubmit = async (data: MaterialFormData) => {
    if (!podeEditar) {
      toast({
        title: 'Sem permissão',
        description: 'Você não tem permissão para cadastrar materiais.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await adicionarMaterial.mutateAsync({
        nome: data.nome,
        categoria: data.categoria,
        descricao: data.descricao || undefined,
        valorUnitario: data.valorUnitario ? Number(data.valorUnitario) : undefined,
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro ao cadastrar material',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao cadastrar o material.',
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
          <DialogTitle>Novo Material</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Material *</Label>
            <Input
              id="nome"
              placeholder="Ex: Moving Head LED 200W"
              {...register('nome')}
            />
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria *</Label>
            <Select value={categoria} onValueChange={(value) => setValue('categoria', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categoriasEstoque.map((cat) => (
                  <SelectItem key={cat.value} value={cat.label}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoria && (
              <p className="text-sm text-destructive">{errors.categoria.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              placeholder="Descrição detalhada do material (opcional)"
              {...register('descricao')}
              rows={3}
            />
            {errors.descricao && (
              <p className="text-sm text-destructive">{errors.descricao.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="valorUnitario">Valor Unitário (R$)</Label>
            <Input
              id="valorUnitario"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register('valorUnitario')}
            />
            {errors.valorUnitario && (
              <p className="text-sm text-destructive">{errors.valorUnitario.message}</p>
            )}
          </div>

          {!podeEditar && (
            <p className="text-sm text-muted-foreground border border-border p-2 rounded-md bg-muted">
              Você não tem permissão para cadastrar materiais.
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !podeEditar}>
              {loading ? 'Cadastrando...' : 'Cadastrar Material'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
