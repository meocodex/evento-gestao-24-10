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
            Para arquivar este evento, é necessário que:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>O evento já tenha terminado (data/hora fim ultrapassada)</li>
              <li>Todos os materiais tenham sido devolvidos</li>
              <li>O fechamento financeiro esteja completo</li>
            </ul>
            <p className="mt-2">Eventos arquivados não aparecem na lista principal, mas podem ser acessados através do filtro de arquivados.</p>
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
