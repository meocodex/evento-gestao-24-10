import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface AdicionarDespesaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdicionar: (data: any) => void;
}

export function AdicionarDespesaDialog({ open, onOpenChange, onAdicionar }: AdicionarDespesaDialogProps) {
  const { toast } = useToast();
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!descricao.trim() || !valor || !categoria) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos.',
        variant: 'destructive',
      });
      return;
    }

    onAdicionar({ descricao, valor: parseFloat(valor), categoria });

    toast({
      title: 'Despesa adicionada!',
      description: 'A despesa foi cadastrada com sucesso.',
    });
    
    setDescricao('');
    setValor('');
    setCategoria('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Despesa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="descricao">Descrição *</Label>
            <Input 
              id="descricao"
              value={descricao} 
              onChange={(e) => setDescricao(e.target.value)} 
              placeholder="Ex: Combustível"
              required
            />
          </div>

          <div>
            <Label htmlFor="valor">Valor (R$) *</Label>
            <Input 
              id="valor"
              type="number"
              step="0.01"
              min="0"
              value={valor} 
              onChange={(e) => setValor(e.target.value)} 
              placeholder="0,00"
              required
            />
          </div>

          <div>
            <Label>Categoria *</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transporte">Transporte</SelectItem>
                <SelectItem value="alimentacao">Alimentação</SelectItem>
                <SelectItem value="hospedagem">Hospedagem</SelectItem>
                <SelectItem value="equipe">Equipe</SelectItem>
                <SelectItem value="material">Material</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
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
