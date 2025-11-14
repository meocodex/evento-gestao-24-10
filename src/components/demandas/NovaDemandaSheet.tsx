import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDemandas } from '@/hooks/demandas';
import { TipoCategoria } from '@/types/categorias';
import { useCategorias } from '@/hooks/categorias';
import { useEventos } from '@/hooks/eventos';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useAuth } from '@/hooks/useAuth';
import { demandaSchema } from '@/lib/validations/demanda';
import { useToast } from '@/hooks/use-toast';
import { PrioridadeDemanda, CategoriaDemanda } from '@/types/demandas';
import { Plus } from 'lucide-react';

const prioridades: { value: PrioridadeDemanda; label: string }[] = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

export function NovaDemandaSheet() {
  const [open, setOpen] = useState(false);
  const { criarDemanda } = useDemandas();
  const { eventos } = useEventos();
  const { categoriasDemandas, isLoading: loadingCategorias } = useCategorias();
  const { usuarios } = useUsuarios();
  const { user } = useAuth();
  const { toast } = useToast();

  const eventosAtivos = eventos.filter(e => 
    ['em_negociacao', 'confirmado', 'em_preparacao', 'em_execucao'].includes(e.status)
  );

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria: 'tecnica' as CategoriaDemanda,
    prioridade: 'media' as PrioridadeDemanda,
    responsavelId: '',
    prazo: '',
    eventoRelacionado: '',
    eventoNome: '',
    tags: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      // Validar dados com Zod
      const validatedData = demandaSchema.parse({
        titulo: formData.titulo,
        descricao: formData.descricao,
        categoria: formData.categoria,
        prioridade: formData.prioridade,
        responsavelId: formData.responsavelId || '',
        prazo: formData.prazo || '',
        eventoRelacionado: formData.eventoRelacionado || '',
        tags: formData.tags,
      });

      const usuarioAtual = (usuarios || []).find(u => u.id === user.id);
      criarDemanda.mutateAsync({
        data: {
          titulo: validatedData.titulo,
          descricao: validatedData.descricao,
          categoria: validatedData.categoria,
          prioridade: validatedData.prioridade,
          responsavelId: validatedData.responsavelId || undefined,
          prazo: validatedData.prazo || undefined,
          eventoRelacionado: validatedData.eventoRelacionado || undefined,
          tags: validatedData.tags,
        },
        solicitante: usuarioAtual?.nome || user.email,
        solicitanteId: user.id
      });

      toast({
        title: 'Sucesso',
        description: 'Demanda criada com sucesso!',
      });

      setFormData({
        titulo: '',
        descricao: '',
        categoria: 'tecnica',
        prioridade: 'media',
        responsavelId: '',
        prazo: '',
        eventoRelacionado: '',
        eventoNome: '',
        tags: [],
      });
      setOpen(false);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        toast({
          title: 'Erro de validação',
          description: firstError.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro ao criar a demanda.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleEventoChange = (eventoId: string) => {
    const evento = eventosAtivos.find(e => e.id === eventoId);
    setFormData({
      ...formData,
      eventoRelacionado: eventoId,
      eventoNome: evento?.nome || '',
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Demanda
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[600px] lg:w-[800px] overflow-y-auto">
        <SheetHeader className="border-b border-navy-100 pb-4 mb-6">
          <SheetTitle className="text-2xl font-display text-navy-800">Nova Demanda</SheetTitle>
          <SheetDescription className="text-navy-500">
            Preencha os dados para criar uma nova demanda
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="titulo" className="text-navy-700">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
              className="border-navy-200 focus:border-navy-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-navy-700">Descrição *</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={4}
              required
              className="border-navy-200 focus:border-navy-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-navy-700">Categoria *</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value as CategoriaDemanda })}
              >
                <SelectTrigger className="border-navy-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoriasDemandas.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-navy-700">Prioridade *</Label>
              <Select
                value={formData.prioridade}
                onValueChange={(value) => setFormData({ ...formData, prioridade: value as PrioridadeDemanda })}
              >
                <SelectTrigger className="border-navy-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {prioridades.map((pri) => (
                    <SelectItem key={pri.value} value={pri.value}>
                      {pri.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-navy-700">Evento Relacionado (opcional)</Label>
            <Select
              value={formData.eventoRelacionado || 'none'}
              onValueChange={(value) => handleEventoChange(value === 'none' ? '' : value)}
            >
              <SelectTrigger className="border-navy-200">
                <SelectValue placeholder="Selecione um evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum evento</SelectItem>
                {eventosAtivos.map((evento) => (
                  <SelectItem key={evento.id} value={evento.id}>
                    {evento.nome} - {new Date(evento.dataInicio).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-navy-700">Responsável (opcional)</Label>
              <Select
                value={formData.responsavelId}
                onValueChange={(value) => setFormData({ ...formData, responsavelId: value })}
              >
                <SelectTrigger className="border-navy-200">
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  {(usuarios || []).map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.id}>
                      {usuario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prazo" className="text-navy-700">Prazo (opcional)</Label>
              <Input
                id="prazo"
                type="datetime-local"
                value={formData.prazo}
                onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
                className="border-navy-200 focus:border-navy-400"
              />
            </div>
          </div>

          <SheetFooter className="border-t border-navy-100 pt-6 mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Criar Demanda</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
