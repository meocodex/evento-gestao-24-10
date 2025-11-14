import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormSheet } from '@/components/shared/sheets';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContratos } from '@/hooks/contratos';
import { Contrato, StatusContrato } from '@/types/contratos';

const contratoSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  status: z.string().min(1, 'Status é obrigatório'),
  conteudo: z.string().min(10, 'Conteúdo deve ter no mínimo 10 caracteres'),
  valor: z.string().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  observacoes: z.string().optional(),
});

type ContratoFormData = z.infer<typeof contratoSchema>;

interface EditarContratoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contrato: Contrato | null;
}

export function EditarContratoSheet({ open, onOpenChange, contrato }: EditarContratoSheetProps) {
  const { editarContrato } = useContratos();

  const form = useForm<ContratoFormData>({
    resolver: zodResolver(contratoSchema),
    defaultValues: {
      titulo: contrato?.titulo || '',
      status: contrato?.status || 'rascunho',
      conteudo: contrato?.conteudo || '',
      valor: contrato?.valor?.toString() || '',
      dataInicio: contrato?.dataInicio || '',
      dataFim: contrato?.dataFim || '',
      observacoes: contrato?.observacoes || '',
    },
  });

  const { handleSubmit, reset, control } = form;

  useEffect(() => {
    if (contrato) {
      reset({
        titulo: contrato.titulo,
        status: contrato.status,
        conteudo: contrato.conteudo,
        valor: contrato.valor?.toString() || '',
        dataInicio: contrato.dataInicio || '',
        dataFim: contrato.dataFim || '',
        observacoes: contrato.observacoes || '',
      });
    }
  }, [contrato, reset]);

  const onSubmit = async (data: ContratoFormData) => {
    if (!contrato) return;
    
    await editarContrato.mutateAsync({ 
      id: contrato.id, 
      data: {
        titulo: data.titulo,
        status: data.status as StatusContrato,
        conteudo: data.conteudo,
        valor: data.valor ? parseFloat(data.valor) : undefined,
        dataInicio: data.dataInicio || undefined,
        dataFim: data.dataFim || undefined,
        observacoes: data.observacoes,
      }
    });
    reset();
    onOpenChange(false);
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  if (!contrato) return null;

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Contrato"
      onSubmit={handleSubmit(onSubmit)}
      onCancel={handleCancel}
      isLoading={editarContrato.isPending}
      submitText="Salvar Alterações"
      size="xl"
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={control}
            name="titulo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título do Contrato</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="proposta">Proposta</SelectItem>
                    <SelectItem value="em_negociacao">Em Negociação</SelectItem>
                    <SelectItem value="aprovada">Aprovada</SelectItem>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="em_revisao">Em Revisão</SelectItem>
                    <SelectItem value="aguardando_assinatura">Aguardando Assinatura</SelectItem>
                    <SelectItem value="assinado">Assinado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                    <SelectItem value="expirado">Expirado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="dataInicio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Início</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="dataFim"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Fim</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="valor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Total</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="conteudo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conteúdo do Contrato</FormLabel>
                <FormControl>
                  <Textarea rows={6} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="observacoes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
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
