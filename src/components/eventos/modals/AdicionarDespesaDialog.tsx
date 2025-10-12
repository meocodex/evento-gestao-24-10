import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCategorias } from '@/contexts/CategoriasContext';

interface AdicionarDespesaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdicionar: (data: any) => void;
}

export function AdicionarDespesaDialog({ open, onOpenChange, onAdicionar }: AdicionarDespesaDialogProps) {
  const { toast } = useToast();
  const { categoriasDespesas } = useCategorias();
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [valorUnitario, setValorUnitario] = useState('');
  const [categoria, setCategoria] = useState<string>('');

  const valorTotal = quantidade * (parseFloat(valorUnitario) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!descricao.trim() || !valorUnitario || !categoria) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await onAdicionar({ 
        descricao, 
        quantidade,
        valorUnitario: parseFloat(valorUnitario),
        valor: valorTotal,
        categoria,
        status: 'pendente',
        data: new Date().toISOString().split('T')[0]
      });
      
      setDescricao('');
      setQuantidade(1);
      setValorUnitario('');
      setCategoria('');
      onOpenChange(false);
    } catch (error) {
      // Erro já tratado pelo hook
    }
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

          <div>
            <Label htmlFor="valorUnitario">Valor Unitário (R$) *</Label>
            <Input 
              id="valorUnitario"
              type="number"
              step="0.01"
              min="0"
              value={valorUnitario} 
              onChange={(e) => setValorUnitario(e.target.value)} 
              placeholder="0,00"
              required
            />
          </div>

          <div className="p-3 bg-accent rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Valor Total:</span>
              <span className="text-lg font-bold text-red-600">
                R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div>
            <Label>Categoria *</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categoriasDespesas.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
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
