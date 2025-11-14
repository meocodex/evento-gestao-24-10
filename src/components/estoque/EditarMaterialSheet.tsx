import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormSheet } from '@/components/shared/sheets';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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

  const form = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      nome: material.nome,
      categoria: material.categoria,
    },
  });

  const { handleSubmit, reset, control } = form;

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
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Material *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Moving Head LED 200W" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                  </FormControl>
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </FormSheet>
  );
}
