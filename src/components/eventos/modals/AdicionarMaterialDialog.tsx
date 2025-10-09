import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface AdicionarMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdicionar: (data: { nome: string; quantidade: number }) => void;
}

export function AdicionarMaterialDialog({ open, onOpenChange, onAdicionar }: AdicionarMaterialDialogProps) {
  const { toast } = useToast();
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe o nome do material.',
        variant: 'destructive',
      });
      return;
    }

    if (quantidade < 1) {
      toast({
        title: 'Quantidade inválida',
        description: 'A quantidade deve ser maior que zero.',
        variant: 'destructive',
      });
      return;
    }

    onAdicionar({ nome, quantidade });

    toast({
      title: 'Material adicionado!',
      description: 'O material foi adicionado ao checklist.',
    });
    
    // Reset form
    setNome('');
    setQuantidade(1);
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Material ao Checklist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Material *</Label>
            <Input 
              id="nome"
              value={nome} 
              onChange={(e) => setNome(e.target.value)} 
              placeholder="Ex: Caixa de Som JBL"
              required
            />
          </div>

          <div>
            <Label htmlFor="quantidade">Quantidade *</Label>
            <Input 
              id="quantidade"
              type="number"
              min="1"
              value={quantidade} 
              onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)} 
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
