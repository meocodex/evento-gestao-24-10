import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTransportadoras } from '@/contexts/TransportadorasContext';
import { useEventos } from '@/contexts/EventosContext';

interface NovoEnvioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovoEnvioDialog({ open, onOpenChange }: NovoEnvioDialogProps) {
  const { criarEnvio, transportadoras } = useTransportadoras();
  const { eventos } = useEventos();
  const [formData, setFormData] = useState<{
    transportadoraId: string;
    eventoId: string;
    tipo: 'ida' | 'volta';
    status: 'pendente' | 'em_transito' | 'entregue' | 'cancelado';
    dataEntregaPrevista: string;
    origem: string;
    destino: string;
    valor: string;
    observacoes: string;
  }>({
    transportadoraId: '',
    eventoId: '',
    tipo: 'ida',
    status: 'pendente',
    dataEntregaPrevista: '',
    origem: '',
    destino: '',
    valor: '',
    observacoes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    criarEnvio({
      ...formData,
      valor: formData.valor ? parseFloat(formData.valor) : undefined,
    });
    onOpenChange(false);
    setFormData({
      transportadoraId: '',
      eventoId: '',
      tipo: 'ida',
      status: 'pendente',
      dataEntregaPrevista: '',
      origem: '',
      destino: '',
      valor: '',
      observacoes: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Envio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="transportadora">Transportadora *</Label>
              <Select
                value={formData.transportadoraId}
                onValueChange={(value) => setFormData({ ...formData, transportadoraId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {transportadoras.filter(t => t.status === 'ativa').map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="evento">Evento *</Label>
              <Select
                value={formData.eventoId}
                onValueChange={(value) => setFormData({ ...formData, eventoId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {eventos.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tipo">Tipo de Envio *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: 'ida' | 'volta') => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ida">Ida</SelectItem>
                  <SelectItem value="volta">Volta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dataEntregaPrevista">Data Prevista *</Label>
              <Input
                id="dataEntregaPrevista"
                type="date"
                value={formData.dataEntregaPrevista}
                onChange={(e) => setFormData({ ...formData, dataEntregaPrevista: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="origem">Origem *</Label>
              <Input
                id="origem"
                value={formData.origem}
                onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="destino">Destino *</Label>
              <Input
                id="destino"
                value={formData.destino}
                onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                required
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Criar Envio</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
