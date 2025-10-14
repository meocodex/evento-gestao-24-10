import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';

interface MotivoAlteracaoDialogProps {
  open: boolean;
  campo: string;
  valorAnterior: number;
  valorNovo: number;
  onConfirm: (motivo: string) => void;
  onCancel: () => void;
}

export function MotivoAlteracaoDialog({
  open,
  campo,
  valorAnterior,
  valorNovo,
  onConfirm,
  onCancel,
}: MotivoAlteracaoDialogProps) {
  const [motivo, setMotivo] = useState('');

  const handleConfirm = () => {
    if (!motivo.trim()) {
      return;
    }
    onConfirm(motivo);
    setMotivo('');
  };

  const handleCancel = () => {
    setMotivo('');
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alteração de Configuração
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-3 rounded-lg space-y-1">
            <p className="text-sm font-medium">{campo}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-destructive font-medium">{valorAnterior}</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-primary font-medium">{valorNovo}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">
              Motivo da Alteração *
            </Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Descreva o motivo da alteração (ex: Cliente solicitou aumento, Redução de escopo, etc.)"
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              Este registro ficará salvo no histórico do evento
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!motivo.trim()}
          >
            Confirmar Alteração
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
