import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSheet } from '@/components/shared/sheets';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEstoque } from '@/hooks/estoque';
import { TagInput } from './TagInput';
import { useToast } from '@/hooks/use-toast';
import { serialEstoqueSchema, type SerialEstoqueInput } from '@/lib/validations/estoque';

interface NovoSerialSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialId: string;
  materialNome: string;
}

export function NovoSerialSheet({ 
  open, 
  onOpenChange, 
  materialId, 
  materialNome 
}: NovoSerialSheetProps) {
  const { adicionarSerial } = useEstoque();
  const { toast } = useToast();

  const form = useForm<SerialEstoqueInput>({
    resolver: zodResolver(serialEstoqueSchema),
    defaultValues: {
      materialId,
      serial: '',
      tags: [],
      observacoes: '',
      status: 'disponivel',
    },
  });

  const onSubmit = async (data: SerialEstoqueInput) => {
    try {
      await adicionarSerial.mutateAsync({
        materialId: data.materialId,
        dados: {
          numero: data.serial,
          status: 'disponivel',
          localizacao: null,
          tags: data.tags && data.tags.length > 0 ? data.tags : null,
          observacoes: data.observacoes || null,
          dataAquisicao: null,
          ultimaManutencao: null,
        }
      });

      toast({
        title: 'Unidade adicionada!',
        description: `Número de série ${data.serial} adicionado ao material ${materialNome}`,
      });

      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao adicionar unidade',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Adicionar Unidade"
      description={`Adicione uma nova unidade (número de série/patrimônio) para ${materialNome}`}
      onSubmit={form.handleSubmit(onSubmit)}
      isLoading={adicionarSerial.isPending}
      submitText="Adicionar Unidade"
      size="lg"
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="serial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Série / Patrimônio *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: SN123456, PAT-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
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
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="perdido">Perdido</SelectItem>
                    <SelectItem value="consumido">Consumido</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (opcional)</FormLabel>
                <FormControl>
                  <TagInput
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Adicione tags para identificação..."
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground mt-1">
                  Pressione Enter para adicionar cada tag
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="observacoes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Input placeholder="Observações adicionais..." {...field} />
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
