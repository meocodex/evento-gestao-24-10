import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Archive, X } from 'lucide-react';

interface ArquivarEventoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ArquivarEventoDialog({ 
  open, 
  onOpenChange, 
  onConfirm,
  isLoading 
}: ArquivarEventoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Arquivar Evento</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja arquivar este evento? Eventos arquivados não aparecerão na lista principal, mas podem ser acessados através do filtro de arquivados.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isLoading}
          >
            <Archive className="h-4 w-4 mr-2" />
            {isLoading ? 'Arquivando...' : 'Arquivar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
