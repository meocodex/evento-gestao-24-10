import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface NovoEventoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventoCreated: () => void;
}

export function NovoEventoDialog({ open, onOpenChange, onEventoCreated }: NovoEventoDialogProps) {
  const { toast } = useToast();
  const [nome, setNome] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [local, setLocal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Evento criado!',
      description: 'O evento foi criado com sucesso.',
    });
    onOpenChange(false);
    onEventoCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Evento *</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
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
            <Input id="local" value={local} onChange={(e) => setLocal(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Criar Evento</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
