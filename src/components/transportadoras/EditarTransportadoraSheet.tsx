import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormSheet } from '@/components/shared/sheets/FormSheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MaskedInput } from '@/components/ui/masked-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransportadoras } from '@/hooks/transportadoras';
import { Transportadora } from '@/types/transportadoras';

const transportadoraSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  status: z.enum(['ativa', 'inativa']),
  responsavel: z.string().min(1, 'Responsável é obrigatório'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
});

type TransportadoraFormData = z.infer<typeof transportadoraSchema>;

interface EditarTransportadoraSheetProps {
  transportadora: Transportadora;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditarTransportadoraSheet({ transportadora, open, onOpenChange }: EditarTransportadoraSheetProps) {
  const { editarTransportadora } = useTransportadoras();

  const form = useForm<TransportadoraFormData>({
    resolver: zodResolver(transportadoraSchema),
    defaultValues: {
      nome: '',
      status: 'ativa',
      responsavel: '',
      telefone: '',
      email: '',
    },
  });

  // Reset form when transportadora changes
  useEffect(() => {
    if (transportadora && open) {
      form.reset({
        nome: transportadora.nome,
        status: transportadora.status,
        responsavel: transportadora.responsavel,
        telefone: transportadora.telefone,
        email: transportadora.email || '',
      });
    }
  }, [transportadora, open, form]);

  const onSubmit = async (data: TransportadoraFormData) => {
    await editarTransportadora.mutateAsync({ 
      id: transportadora.id, 
      data 
    });
    form.reset();
    onOpenChange(false);
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Transportadora"
      description="Atualize as informações da transportadora"
      onSubmit={form.handleSubmit(onSubmit)}
      onCancel={handleCancel}
      submitText="Salvar Alterações"
      isLoading={editarTransportadora.isPending}
      size="lg"
    >
      <Form {...form}>
        <div className="space-y-4">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Fantasia *</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome da transportadora" {...field} />
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ativa">Ativa</SelectItem>
                      <SelectItem value="inativa">Inativa</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Contato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="responsavel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do responsável" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone *</FormLabel>
                <FormControl>
                  <MaskedInput
                    mask="telefone"
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@transportadora.com" {...field} />
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
