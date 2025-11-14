/**
 * EXEMPLO DE USO DO FormSheetWithZod
 * 
 * Este arquivo demonstra como usar o novo componente FormSheetWithZod
 * Compare com NovoSerialSheet.tsx para ver a redução de código
 */

import { FormSheetWithZod } from '@/components/shared/sheets';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEstoque } from '@/hooks/estoque';
import { TagInput } from './TagInput';
import { useToast } from '@/hooks/use-toast';
import { serialEstoqueSchema, type SerialEstoqueInput } from '@/lib/validations/estoque';

interface NovoSerialSheetExampleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialId: string;
  materialNome: string;
}

export function NovoSerialSheetExample({ 
  open, 
  onOpenChange, 
  materialId, 
  materialNome 
}: NovoSerialSheetExampleProps) {
  const { adicionarSerial } = useEstoque();
  const { toast } = useToast();

  const handleSubmit = async (data: SerialEstoqueInput) => {
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
    <FormSheetWithZod
      open={open}
      onOpenChange={onOpenChange}
      title="Adicionar Unidade"
      description={`Adicione uma nova unidade (número de série/patrimônio) para ${materialNome}`}
      schema={serialEstoqueSchema}
      defaultValues={{
        materialId,
        serial: '',
        tags: [],
        observacoes: '',
        status: 'disponivel',
      }}
      onSubmit={handleSubmit}
      isLoading={adicionarSerial.isPending}
      submitText="Adicionar Unidade"
      size="lg"
    >
      {(form) => (
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
      )}
    </FormSheetWithZod>
  );
}

/**
 * COMPARAÇÃO COM O MÉTODO ANTIGO:
 * 
 * ANTES (usando FormSheet + useForm manual):
 * - ~90 linhas de código
 * - Gerenciamento manual do useForm
 * - Reset manual do form
 * - Wrapping manual do Form provider
 * - Mais boilerplate
 * 
 * DEPOIS (usando FormSheetWithZod):
 * - ~60 linhas de código (33% menos código!)
 * - Gerenciamento automático do form
 * - Reset automático ao fechar
 * - Form provider automático
 * - Código mais limpo e focado
 * 
 * BENEFÍCIOS:
 * ✅ Menos duplicação de código
 * ✅ Type-safety mantido
 * ✅ Validação Zod integrada
 * ✅ Mais fácil de testar
 * ✅ Padrão consistente em toda a aplicação
 */
