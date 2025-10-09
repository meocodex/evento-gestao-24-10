import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDemandasContext } from '@/contexts/DemandasContext';
import { CategoriaDemanda, PrioridadeDemanda } from '@/types/demandas';
import { Plus } from 'lucide-react';
import { mockUsuarios } from '@/lib/mock-data/demandas';
import { useEventos } from '@/contexts/EventosContext';

const categorias: { value: CategoriaDemanda; label: string }[] = [
  { value: 'tecnica', label: 'Técnica' },
  { value: 'operacional', label: 'Operacional' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'financeira', label: 'Financeira' },
  { value: 'administrativa', label: 'Administrativa' },
  { value: 'outra', label: 'Outra' },
];

const prioridades: { value: PrioridadeDemanda; label: string }[] = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

export function NovaDemandaDialog() {
  const [open, setOpen] = useState(false);
  const { adicionarDemanda } = useDemandasContext();
  const { eventos } = useEventos();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Usuário atual mockado
    const usuarioAtual = mockUsuarios[0];
    
    adicionarDemanda(
      {
        ...formData,
        responsavelId: formData.responsavelId || undefined,
        prazo: formData.prazo || undefined,
      },
      usuarioAtual.nome,
      usuarioAtual.id
    );

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Demanda
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Demanda</DialogTitle>
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
                  {categorias.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
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
              value={formData.eventoRelacionado}
              onValueChange={handleEventoChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum evento</SelectItem>
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
              <Label>Responsável (opcional)</Label>
              <Select
                value={formData.responsavelId}
                onValueChange={(value) => setFormData({ ...formData, responsavelId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  {mockUsuarios.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.id}>
                      {usuario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prazo">Prazo (opcional)</Label>
              <Input
                id="prazo"
                type="datetime-local"
                value={formData.prazo}
                onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Criar Demanda</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
