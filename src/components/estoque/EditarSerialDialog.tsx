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
import { useEstoque, SerialEstoque } from '@/hooks/estoque';
import { TagInput } from './TagInput';

const serialSchema = z.object({
  localizacao: z.string().min(1, 'Localização é obrigatória'),
  status: z.enum(['disponivel', 'em-uso', 'manutencao', 'perdido', 'consumido'] as const),
  tags: z.array(z.string()).optional().default([]),
});

type SerialFormData = z.infer<typeof serialSchema>;

interface EditarSerialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialId: string;
  serial: SerialEstoque;
}

export function EditarSerialDialog({ 
  open, 
  onOpenChange, 
  materialId,
  serial 
}: EditarSerialDialogProps) {
  const { editarSerial } = useEstoque();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<SerialFormData>({
    resolver: zodResolver(serialSchema),
    defaultValues: {
      status: serial.status,
      localizacao: serial.localizacao,
      tags: serial.tags || [],
    },
  });

  const status = watch('status');
  const tags = watch('tags');

  useEffect(() => {
    reset({
      status: serial.status,
      localizacao: serial.localizacao,
      tags: serial.tags || [],
    });
  }, [serial, reset]);

  const onSubmit = async (data: SerialFormData) => {
    setLoading(true);
    try {
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Serial - {serial.numero}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="localizacao">Localização *</Label>
            <Input
              id="localizacao"
              placeholder="Ex: Depósito A - Prateleira 5"
              {...register('localizacao')}
            />
            {errors.localizacao && (
              <p className="text-sm text-destructive">{errors.localizacao.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select value={status} onValueChange={(value: any) => setValue('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="em-uso">Em Uso</SelectItem>
                <SelectItem value="manutencao">Em Manutenção</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive">{errors.status.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (opcional)</Label>
            <TagInput
              value={tags || []}
              onChange={(newTags) => setValue('tags', newTags)}
              placeholder="Ex: Bateria carregada, Testado..."
              suggestions={['Bateria carregada', 'Bateria descarregada', 'Testado', 'Necessita manutenção', 'Novo']}
            />
            <p className="text-xs text-muted-foreground">
              Adicione etiquetas para facilitar a identificação
            </p>
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
