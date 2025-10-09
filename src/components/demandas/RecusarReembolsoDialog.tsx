import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { XCircle } from 'lucide-react';

interface RecusarReembolsoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (motivo: string) => void;
}

export function RecusarReembolsoDialog({ 
  open, 
  onOpenChange, 
  onConfirm 
}: RecusarReembolsoDialogProps) {
  const [motivo, setMotivo] = useState('');

  const handleConfirm = () => {
    if (!motivo.trim()) return;
    onConfirm(motivo);
    setMotivo('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Recusar Reembolso
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Informe o motivo da recusa do reembolso. Esta informação será enviada ao solicitante.
          </p>

          <div>
            <Label>Motivo da Recusa *</Label>
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: Comprovantes insuficientes, valores incorretos, etc..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm} 
            disabled={!motivo.trim()}
          >
            Confirmar Recusa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
