import { useState } from 'react';
import { FormSheet } from '@/components/shared/sheets';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface AdicionarReceitaSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdicionar: (data: any) => void;
}

export function AdicionarReceitaSheet({ open, onOpenChange, onAdicionar }: AdicionarReceitaSheetProps) {
  const { toast } = useToast();
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [valorUnitario, setValorUnitario] = useState('');
  const [tipo, setTipo] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const valorTotal = quantidade * (parseFloat(valorUnitario) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!descricao.trim() || !valorUnitario || !tipo) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await onAdicionar({ 
        descricao, 
        quantidade,
        valorUnitario: parseFloat(valorUnitario),
        valor: valorTotal,
        tipo,
        status: 'pendente',
        data: new Date().toISOString().split('T')[0]
      });
      
      setDescricao('');
      setQuantidade(1);
      setValorUnitario('');
      setTipo('');
      onOpenChange(false);
    } catch (error) {
      // Erro já tratado pelo hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Adicionar Receita"
      onSubmit={handleSubmit}
      isLoading={loading}
      submitText="Adicionar"
      size="md"
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="descricao">Descrição *</Label>
          <Input 
            id="descricao"
            value={descricao} 
            onChange={(e) => setDescricao(e.target.value)} 
            placeholder="Ex: Pagamento do cliente"
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
            <span className="text-lg font-bold text-green-600">
              R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div>
          <Label>Tipo *</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="venda">Venda</SelectItem>
              <SelectItem value="locacao">Locação</SelectItem>
              <SelectItem value="servico">Serviço</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </FormSheet>
  );
}
