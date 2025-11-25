import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditarQuantidadeChecklistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id: string;
    nome: string;
    quantidade: number;
    alocado: number;
  } | null;
  onConfirm: (id: string, novaQuantidade: number) => void;
}

export function EditarQuantidadeChecklistDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
}: EditarQuantidadeChecklistDialogProps) {
  const [quantidade, setQuantidade] = useState(item?.quantidade || 0);
  const [erro, setErro] = useState('');

  const handleConfirm = () => {
    if (!item) return;

    if (quantidade < item.alocado) {
      setErro(`A quantidade não pode ser menor que ${item.alocado} (já alocado)`);
      return;
    }

    if (quantidade <= 0) {
      setErro('A quantidade deve ser maior que zero');
      return;
    }

    onConfirm(item.id, quantidade);
    onOpenChange(false);
    setErro('');
  };

  const handleOpenChange = (open: boolean) => {
    if (open && item) {
      setQuantidade(item.quantidade);
      setErro('');
    }
    onOpenChange(open);
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Quantidade</DialogTitle>
          <DialogDescription>
            Atualize a quantidade necessária de <strong>{item.nome}</strong> para este evento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quantidade">Nova Quantidade</Label>
            <Input
              id="quantidade"
              type="number"
              min={item.alocado}
              value={quantidade}
              onChange={(e) => {
                setQuantidade(parseInt(e.target.value) || 0);
                setErro('');
              }}
              placeholder="Digite a nova quantidade"
            />
            <p className="text-sm text-muted-foreground">
              Já alocado: <strong>{item.alocado}</strong> unidade(s)
            </p>
            {erro && (
              <p className="text-sm text-destructive">{erro}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
