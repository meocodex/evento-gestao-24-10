import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDemandas } from '@/hooks/demandas';
import { useEventos } from '@/hooks/eventos';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useCategorias } from '@/hooks/categorias';
import { Demanda, PrioridadeDemanda, CategoriaDemanda } from '@/types/demandas';
import { useIsMobile } from '@/hooks/use-mobile';

interface EditarDemandaSheetProps {
  demanda: Demanda | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const prioridades: { value: PrioridadeDemanda; label: string }[] = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

export function EditarDemandaSheet({ demanda, open, onOpenChange }: EditarDemandaSheetProps) {
  const isMobile = useIsMobile();
  const { editarDemanda } = useDemandas();
  const { eventos } = useEventos();
  const { usuarios } = useUsuarios();
  const { categoriasDemandas } = useCategorias();

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria: '' as CategoriaDemanda,
    prioridade: 'media' as PrioridadeDemanda,
    responsavelId: '',
    prazo: '',
    eventoRelacionado: '',
    eventoNome: '',
  });

  useEffect(() => {
    if (demanda && open) {
      setFormData({
        titulo: demanda.titulo,
        descricao: demanda.descricao,
        categoria: demanda.categoria,
        prioridade: demanda.prioridade,
        responsavelId: demanda.responsavelId || '',
        prazo: demanda.prazo || '',
        eventoRelacionado: demanda.eventoRelacionado || '',
        eventoNome: demanda.eventoNome || '',
      });
    }
  }, [demanda, open]);

  const handleEventoChange = (eventoId: string) => {
    const evento = eventos?.find(e => e.id === eventoId);
    setFormData(prev => ({
      ...prev,
      eventoRelacionado: eventoId,
      eventoNome: evento?.nome || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demanda) return;

    await editarDemanda.mutateAsync({
      id: demanda.id,
      data: {
        titulo: formData.titulo,
        descricao: formData.descricao,
        categoria: formData.categoria,
        prioridade: formData.prioridade,
        responsavelId: formData.responsavelId,
        prazo: formData.prazo,
        eventoRelacionado: formData.eventoRelacionado,
        tags: []
      }
    });

    onOpenChange(false);
  };

  if (!demanda) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"}
        className="w-full sm:w-[90%] lg:w-[600px] p-0 flex flex-col gap-0"
      >
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>Editar Demanda</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value as CategoriaDemanda })}
                >
                  <SelectTrigger>
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
                <Label htmlFor="prioridade">Prioridade *</Label>
                <Select
                  value={formData.prioridade}
                  onValueChange={(value) => setFormData({ ...formData, prioridade: value as PrioridadeDemanda })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {prioridades.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável</Label>
              <Select
                value={formData.responsavelId}
                onValueChange={(value) => setFormData({ ...formData, responsavelId: value })}
              >
                <SelectTrigger>
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
              <Label htmlFor="prazo">Prazo</Label>
              <Input
                id="prazo"
                type="datetime-local"
                value={formData.prazo}
                onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="evento">Evento Relacionado</Label>
              <Select
                value={formData.eventoRelacionado}
                onValueChange={handleEventoChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um evento" />
                </SelectTrigger>
                <SelectContent>
                  {(eventos || []).map((evento) => (
                    <SelectItem key={evento.id} value={evento.id}>
                      {evento.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={editarDemanda.isPending}
              className="flex-1"
            >
              {editarDemanda.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
