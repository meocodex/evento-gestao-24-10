import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDemandasContext } from '@/hooks/demandas';
import { TipoCategoria } from '@/types/categorias';
import { useEventos } from '@/hooks/eventos';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useCategorias } from '@/contexts/CategoriasContext';

interface EditarDemandaDialogProps {
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

export function EditarDemandaDialog({ demanda, open, onOpenChange }: EditarDemandaDialogProps) {
  const { editarDemanda } = useDemandasContext();
  const { eventos } = useEventos();
  const { categoriasDemandas, isLoading } = useCategorias();
  const { usuarios } = useUsuarios();

  const eventosAtivos = eventos.filter(e => 
    ['orcamento', 'aprovado', 'em-preparacao', 'em-execucao'].includes(e.status)
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

  useEffect(() => {
    if (demanda) {
      setFormData({
        titulo: demanda.titulo,
        descricao: demanda.descricao,
        categoria: demanda.categoria,
        prioridade: demanda.prioridade,
        responsavelId: demanda.responsavelId || '',
        prazo: demanda.prazo || '',
        eventoRelacionado: demanda.eventoRelacionado || '',
        eventoNome: demanda.eventoNome || '',
        tags: demanda.tags,
      });
    }
  }, [demanda]);

  const handleEventoChange = (eventoId: string) => {
    const evento = eventosAtivos.find(e => e.id === eventoId);
    setFormData({
      ...formData,
      eventoRelacionado: eventoId === 'none' ? '' : eventoId,
      eventoNome: evento?.nome || '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demanda) return;

    editarDemanda(demanda.id, {
      ...formData,
      responsavelId: formData.responsavelId || undefined,
      prazo: formData.prazo || undefined,
    });

    onOpenChange(false);
  };

  if (!demanda) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Demanda</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value as CategoriaDemanda })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>Carregando...</SelectItem>
                  ) : categoriasDemandas.length === 0 ? (
                    <SelectItem value="empty" disabled>Nenhuma categoria configurada</SelectItem>
                  ) : (
                    categoriasDemandas.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioridade *</Label>
              <Select
                value={formData.prioridade}
                onValueChange={(value) => setFormData({ ...formData, prioridade: value as PrioridadeDemanda })}
              >
                <SelectTrigger>
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
            <Label>Evento Relacionado (opcional)</Label>
            <Select
              value={formData.eventoRelacionado || 'none'}
              onValueChange={(value) => handleEventoChange(value === 'none' ? '' : value)}
            >
              <SelectTrigger>
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
              <Label>Responsável</Label>
              <Select
                value={formData.responsavelId || 'sem-responsavel'}
                onValueChange={(value) => setFormData({ ...formData, responsavelId: value === 'sem-responsavel' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sem-responsavel">Sem responsável</SelectItem>
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
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
