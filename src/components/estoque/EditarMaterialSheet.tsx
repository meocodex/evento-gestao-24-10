import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormSheet } from '@/components/shared/sheets';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEstoque, MaterialEstoque } from '@/hooks/estoque';
import { useCategorias } from '@/hooks/categorias';

const materialSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
});

type MaterialFormData = z.infer<typeof materialSchema>;

interface EditarMaterialSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: MaterialEstoque;
}

export function EditarMaterialSheet({ open, onOpenChange, material }: EditarMaterialSheetProps) {
  const { editarMaterial } = useEstoque();
  const { categoriasEstoque, isLoading: isLoadingCategorias } = useCategorias();

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
    await editarMaterial.mutateAsync({ 
      id: material.id, 
      dados: {
        nome: data.nome,
        categoria: data.categoria,
      }
    });
    reset();
    onOpenChange(false);
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Material"
      onSubmit={handleSubmit(onSubmit)}
      onCancel={handleCancel}
      isLoading={editarMaterial.isPending}
      submitText="Salvar Alterações"
      size="lg"
    >
      <div className="space-y-4">
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
              {isLoadingCategorias ? (
                <SelectItem value="loading" disabled>Carregando...</SelectItem>
              ) : categoriasEstoque.length === 0 ? (
                <SelectItem value="empty" disabled>Nenhuma categoria configurada</SelectItem>
              ) : (
                categoriasEstoque.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.categoria && (
            <p className="text-sm text-destructive">{errors.categoria.message}</p>
          )}
        </div>
      </div>
    </FormSheet>
  );
}
