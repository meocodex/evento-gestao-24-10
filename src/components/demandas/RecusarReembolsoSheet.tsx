import { useState } from 'react';
import { BaseSheet } from '@/components/shared/sheets';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SheetFooter } from '@/components/ui/sheet';
import { XCircle } from 'lucide-react';

interface RecusarReembolsoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (motivo: string) => void;
}

export function RecusarReembolsoSheet({ 
  open, 
  onOpenChange, 
  onConfirm 
}: RecusarReembolsoSheetProps) {
  const [motivo, setMotivo] = useState('');

  const handleConfirm = () => {
    if (!motivo.trim()) return;
    onConfirm(motivo);
    setMotivo('');
  };

  const handleCancel = () => {
    setMotivo('');
    onOpenChange(false);
  };

  return (
    <BaseSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Recusar Reembolso"
      size="md"
    >
      <div className="space-y-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <XCircle className="h-5 w-5 text-destructive" />
          <span className="font-semibold">Recusar Reembolso</span>
        </div>

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

      <SheetFooter className="gap-2 sm:gap-0">
        <Button variant="outline" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleConfirm} 
          disabled={!motivo.trim()}
        >
          Confirmar Recusa
        </Button>
      </SheetFooter>
    </BaseSheet>
  );
}
