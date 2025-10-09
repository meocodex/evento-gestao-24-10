import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEstoque } from '@/contexts/EstoqueContext';
import { MaterialEstoque } from '@/lib/mock-data/estoque';

const materialSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
});

type MaterialFormData = z.infer<typeof materialSchema>;

interface EditarMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: MaterialEstoque;
}

const categorias = [
  'Iluminação',
  'Áudio',
  'Vídeo',
  'Estrutura',
  'Cenografia',
  'Mobiliário',
  'Cabeamento',
  'Elétrica',
  'Pagamento',
  'Outros',
];

export function EditarMaterialDialog({ open, onOpenChange, material }: EditarMaterialDialogProps) {
  const { editarMaterial } = useEstoque();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      nome: material.nome,
      categoria: material.categoria,
    },
  });

  const categoria = watch('categoria');

  useEffect(() => {
    reset({
      nome: material.nome,
      categoria: material.categoria,
    });
  }, [material, reset]);

  const onSubmit = async (data: MaterialFormData) => {
    setLoading(true);
    try {
      await editarMaterial(material.id, {
        nome: data.nome,
        categoria: data.categoria,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Material</DialogTitle>
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
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoria && (
              <p className="text-sm text-destructive">{errors.categoria.message}</p>
            )}
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
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
