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
      size="md"
    >
      <Form {...form}>
        <div className="space-y-4">
          {/* Nome + Status */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-8">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm">Nome Fantasia *</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome" className="h-9" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm">Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Status" />
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
          </div>

          {/* Responsável + Telefone */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-7">
              <FormField
                control={form.control}
                name="responsavel"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm">Responsável *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do responsável" className="h-9" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-5">
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm">Telefone *</FormLabel>
                    <FormControl>
                      <MaskedInput
                        mask="telefone"
                        value={field.value || ''}
                        onChange={field.onChange}
                        className="h-9"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm">E-mail</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@transportadora.com" className="h-9" {...field} />
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
