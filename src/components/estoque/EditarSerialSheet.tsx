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
import { useEstoque, SerialEstoque } from '@/hooks/estoque';
import { TagInput } from './TagInput';

const serialSchema = z.object({
  localizacao: z.string().min(1, 'Localização é obrigatória'),
  status: z.enum(['disponivel', 'em-uso', 'manutencao', 'perdido', 'consumido'] as const),
  tags: z.array(z.string()).optional().default([]),
});

type SerialFormData = z.infer<typeof serialSchema>;

interface EditarSerialSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialId: string;
  serial: SerialEstoque;
}

export function EditarSerialSheet({ 
  open, 
  onOpenChange, 
  materialId,
  serial 
}: EditarSerialSheetProps) {
  const { editarSerial } = useEstoque();

  const form = useForm<SerialFormData>({
    resolver: zodResolver(serialSchema),
    defaultValues: {
      status: serial.status,
      localizacao: serial.localizacao,
      tags: serial.tags || [],
    },
  });

  const { handleSubmit, reset, control, setValue, watch } = form;
  const tags = watch('tags');

  useEffect(() => {
    reset({
      status: serial.status,
      localizacao: serial.localizacao,
      tags: serial.tags || [],
    });
  }, [serial, reset]);

  const onSubmit = async (data: SerialFormData) => {
    await editarSerial.mutateAsync({ 
      materialId, 
      numeroSerial: serial.numero,
      dados: {
        status: data.status,
        localizacao: data.localizacao,
        tags: data.tags || [],
      }
    });
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
      title={`Editar Serial - ${serial.numero}`}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={handleCancel}
      isLoading={editarSerial.isPending}
      submitText="Salvar Alterações"
      size="lg"
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={control}
            name="localizacao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Localização *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Depósito A - Prateleira 5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="em-uso">Em Uso</SelectItem>
                    <SelectItem value="manutencao">Em Manutenção</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <TagInput
                    value={tags || []}
                    onChange={(newTags) => setValue('tags', newTags)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </FormSheet>
  );
}
