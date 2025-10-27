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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEstoque } from '@/hooks/estoque';
import { TagInput } from './TagInput';

const serialSchema = z.object({
  numero: z.string()
    .min(1, 'Número de serial é obrigatório')
    .max(50, 'Número de serial muito longo')
    .regex(/^[A-Z0-9\-_]+$/i, 'Use apenas letras, números, hífens e underscores'),
  localizacao: z.string().min(1, 'Localização é obrigatória'),
  status: z.enum(['disponivel', 'em-uso', 'manutencao'] as const),
  tags: z.array(z.string()).optional().default([]),
});

type SerialFormData = z.infer<typeof serialSchema>;

interface NovoSerialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialId: string;
  materialNome: string;
}

export function NovoSerialDialog({ 
  open, 
  onOpenChange, 
  materialId,
  materialNome 
}: NovoSerialDialogProps) {
  const { adicionarSerial } = useEstoque();
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
      status: 'disponivel',
      localizacao: 'Depósito Principal',
      tags: [],
    },
  });

  const status = watch('status');
  const tags = watch('tags');

  const onSubmit = async (data: SerialFormData) => {
    setLoading(true);
    try {
      await adicionarSerial.mutateAsync({ 
        materialId, 
        dados: {
          numero: data.numero.toUpperCase(),
          status: data.status as 'disponivel' | 'em-uso' | 'manutencao',
          localizacao: data.localizacao,
          tags: data.tags || [],
        }
      });
      reset();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Unidade - {materialNome}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="numero">Número de Serial / Patrimônio *</Label>
            <Input
              id="numero"
              placeholder="Ex: SN123456789 ou PATRIMONIO-2024-001"
              {...register('numero')}
              className="uppercase"
            />
            <p className="text-xs text-muted-foreground">
              Digite o número de série do equipamento ou código de patrimônio
            </p>
            {errors.numero && (
              <p className="text-sm text-destructive">{errors.numero.message}</p>
            )}
          </div>

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
              {loading ? 'Adicionando...' : 'Adicionar Unidade'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
