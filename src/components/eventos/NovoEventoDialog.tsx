import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ClienteSelect } from './ClienteSelect';
import { ComercialSelect } from './ComercialSelect';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useEventos } from '@/contexts/EventosContext';

interface NovoEventoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventoCreated: () => void;
}

export function NovoEventoDialog({ open, onOpenChange, onEventoCreated }: NovoEventoDialogProps) {
  const { toast } = useToast();
  const { criarEvento } = useEventos();
  const [nome, setNome] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [local, setLocal] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [endereco, setEndereco] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [comercialId, setComercialId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [contatosAdicionais, setContatosAdicionais] = useState('');
  const [redesSociais, setRedesSociais] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clienteId || !comercialId) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, selecione um cliente e um comercial.',
        variant: 'destructive',
      });
      return;
    }

    if (dataFim && dataInicio && dataFim < dataInicio) {
      toast({
        title: 'Data inválida',
        description: 'A data de fim não pode ser anterior à data de início.',
        variant: 'destructive',
      });
      return;
    }

    await criarEvento({
      nome,
      dataInicio,
      dataFim,
      horaInicio,
      horaFim,
      local,
      cidade,
      estado,
      endereco,
      tipoEvento: 'bar',
      clienteId,
      comercialId,
      tags,
      descricao,
      observacoes,
      contatosAdicionais,
      redesSociais
    });
    
    // Reset form
    setNome('');
    setDataInicio('');
    setDataFim('');
    setHoraInicio('');
    setHoraFim('');
    setLocal('');
    setCidade('');
    setEstado('');
    setEndereco('');
    setClienteId('');
    setComercialId('');
    setDescricao('');
    setObservacoes('');
    setContatosAdicionais('');
    setRedesSociais('');
    setTags([]);
    
    onOpenChange(false);
    onEventoCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome do Evento *</Label>
              <Input 
                id="nome" 
                value={nome} 
                onChange={(e) => setNome(e.target.value)} 
                placeholder="Ex: Casamento João e Maria"
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dataInicio">Data de Início *</Label>
                <Input 
                  id="dataInicio" 
                  type="date" 
                  value={dataInicio} 
                  onChange={(e) => setDataInicio(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="dataFim">Data de Término *</Label>
                <Input 
                  id="dataFim" 
                  type="date" 
                  value={dataFim} 
                  onChange={(e) => setDataFim(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="horaInicio">Hora de Início *</Label>
                <Input 
                  id="horaInicio" 
                  type="time" 
                  value={horaInicio} 
                  onChange={(e) => setHoraInicio(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="horaFim">Hora de Término *</Label>
                <Input 
                  id="horaFim" 
                  type="time" 
                  value={horaFim} 
                  onChange={(e) => setHoraFim(e.target.value)} 
                  required 
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="local">Local *</Label>
              <Input 
                id="local" 
                value={local} 
                onChange={(e) => setLocal(e.target.value)} 
                placeholder="Ex: Buffet Estrela Dourada"
                required 
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="cidade">Cidade *</Label>
                <Input 
                  id="cidade" 
                  value={cidade} 
                  onChange={(e) => setCidade(e.target.value)} 
                  placeholder="Ex: Cuiabá"
                  required 
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado *</Label>
                <Input 
                  id="estado" 
                  value={estado} 
                  onChange={(e) => setEstado(e.target.value.toUpperCase())} 
                  placeholder="Ex: MT"
                  maxLength={2}
                  required 
                />
              </div>
            </div>

            <div>
              <Label htmlFor="endereco">Endereço Completo *</Label>
              <Input 
                id="endereco" 
                value={endereco} 
                onChange={(e) => setEndereco(e.target.value)} 
                placeholder="Ex: Rua das Flores, 123 - Centro"
                required 
              />
            </div>

            <div>
              <Label>Cliente *</Label>
              <ClienteSelect value={clienteId} onChange={setClienteId} />
            </div>

            <div>
              <Label>Comercial *</Label>
              <ComercialSelect value={comercialId} onChange={setComercialId} />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea 
                id="descricao" 
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3} 
                placeholder="Detalhes sobre o evento..."
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input 
                  id="tags"
                  value={tagInput} 
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Ex: Casamento, Corporativo, Premium..."
                />
                <Button type="button" onClick={handleAddTag} variant="secondary">
                  Adicionar
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Criar Evento</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
