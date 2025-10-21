import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StatusEvento } from '@/types/eventos';
import { useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

interface AlterarStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statusAtual: StatusEvento;
  onAlterar: (novoStatus: StatusEvento, observacao?: string) => void;
}

const statusOptions: { value: StatusEvento; label: string }[] = [
  { value: 'orcamento', label: 'Orçamento' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'em_preparacao', label: 'Em Preparação' },
  { value: 'em_execucao', label: 'Em Execução' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' }
];

export function AlterarStatusDialog({ open, onOpenChange, statusAtual, onAlterar }: AlterarStatusDialogProps) {
  const [novoStatus, setNovoStatus] = useState<StatusEvento>(statusAtual);
  const [observacao, setObservacao] = useState('');

  const handleSubmit = () => {
    if (novoStatus === statusAtual) {
      return;
    }

    onAlterar(novoStatus, observacao.trim() || undefined);
    setObservacao('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Status do Evento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Status Atual</Label>
            <div className="p-3 bg-muted rounded-md">
              {statusOptions.find(s => s.value === statusAtual)?.label}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="novo-status">Novo Status</Label>
            <Select value={novoStatus} onValueChange={(value) => setNovoStatus(value as StatusEvento)}>
              <SelectTrigger id="novo-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    disabled={option.value === statusAtual}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao">Observação (opcional)</Label>
            <Textarea
              id="observacao"
              placeholder="Adicione uma observação sobre esta mudança de status..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={novoStatus === statusAtual}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Alterar Status
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
