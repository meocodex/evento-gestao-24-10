import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormSheet } from '@/components/shared/sheets/FormSheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDemandas } from '@/hooks/demandas';
import { useEventos } from '@/hooks/eventos';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useCategorias } from '@/hooks/categorias';
import { Demanda, PrioridadeDemanda, CategoriaDemanda } from '@/types/demandas';

interface EditarDemandaSheetProps {
  demanda: Demanda | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const demandaSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  prioridade: z.enum(['baixa', 'media', 'alta', 'urgente']),
  responsavelId: z.string().optional(),
  prazo: z.string().optional(),
  eventoRelacionado: z.string().optional(),
});

type DemandaFormData = z.infer<typeof demandaSchema>;

const prioridades: { value: PrioridadeDemanda; label: string }[] = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

export function EditarDemandaSheet({ demanda, open, onOpenChange }: EditarDemandaSheetProps) {
  const { editarDemanda } = useDemandas();
  const { eventos } = useEventos();
  const { usuarios } = useUsuarios();
  const { categoriasDemandas } = useCategorias();

  const form = useForm<DemandaFormData>({
    resolver: zodResolver(demandaSchema),
    defaultValues: {
      titulo: '',
      descricao: '',
      categoria: 'tecnica',
      prioridade: 'media',
      responsavelId: '',
      prazo: '',
      eventoRelacionado: '',
    },
  });

  // Reset form when demanda changes
  useEffect(() => {
    if (demanda && open) {
      form.reset({
        titulo: demanda.titulo,
        descricao: demanda.descricao,
        categoria: demanda.categoria,
        prioridade: demanda.prioridade,
        responsavelId: demanda.responsavelId || '',
        prazo: demanda.prazo || '',
        eventoRelacionado: demanda.eventoRelacionado || '',
      });
    }
  }, [demanda, open, form]);

  const onSubmit = async (data: DemandaFormData) => {
    if (!demanda) return;

    await editarDemanda.mutateAsync({
      id: demanda.id,
      data: {
        titulo: data.titulo,
        descricao: data.descricao,
        categoria: data.categoria as CategoriaDemanda,
        prioridade: data.prioridade,
        responsavelId: data.responsavelId,
        prazo: data.prazo,
        eventoRelacionado: data.eventoRelacionado,
        tags: []
      }
    });

    form.reset();
    onOpenChange(false);
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  if (!demanda) return null;

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Demanda"
      description="Atualize as informações da demanda"
      onSubmit={form.handleSubmit(onSubmit)}
      onCancel={handleCancel}
      submitText="Salvar Alterações"
      isLoading={editarDemanda.isPending}
      size="lg"
    >
      <Form {...form}>
        <div className="space-y-4">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o título da demanda" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva os detalhes da demanda" 
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Classificação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoriasDemandas.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prioridade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridade *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {prioridades.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Atribuição */}
          <FormField
            control={form.control}
            name="responsavelId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsável</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um responsável" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(usuarios || []).map((usuario) => (
                      <SelectItem key={usuario.id} value={usuario.id}>
                        {usuario.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Prazo e Evento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="prazo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prazo</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventoRelacionado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evento Relacionado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um evento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(eventos || []).map((evento) => (
                        <SelectItem key={evento.id} value={evento.id}>
                          {evento.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </Form>
    </FormSheet>
  );
}
