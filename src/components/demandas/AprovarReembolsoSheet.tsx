import { useState } from 'react';
import { BaseSheet } from '@/components/shared/sheets';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SheetFooter } from '@/components/ui/sheet';
import { CheckCircle } from 'lucide-react';

interface AprovarReembolsoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (formaPagamento: string, observacoes?: string) => void;
  valorTotal: number;
}

export function AprovarReembolsoSheet({ 
  open, 
  onOpenChange, 
  onConfirm,
  valorTotal 
}: AprovarReembolsoSheetProps) {
  const [formaPagamento, setFormaPagamento] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const handleConfirm = () => {
    if (!formaPagamento) return;
    onConfirm(formaPagamento, observacoes || undefined);
    setFormaPagamento('');
    setObservacoes('');
  };

  const handleCancel = () => {
    setFormaPagamento('');
    setObservacoes('');
    onOpenChange(false);
  };

  return (
    <BaseSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Aprovar Reembolso"
      size="md"
    >
      <div className="space-y-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="font-semibold">Aprovar Reembolso</span>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Valor a reembolsar:</p>
          <p className="text-2xl font-bold text-primary">
            R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div>
          <Label>Forma de Pagamento *</Label>
          <Select value={formaPagamento} onValueChange={setFormaPagamento}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a forma de pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="ted">TED</SelectItem>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Observações</Label>
          <Textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Informações adicionais sobre o pagamento..."
            rows={3}
          />
        </div>
      </div>

      <SheetFooter className="gap-2 sm:gap-0">
        <Button variant="outline" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button onClick={handleConfirm} disabled={!formaPagamento}>
          Aprovar Reembolso
        </Button>
      </SheetFooter>
    </BaseSheet>
  );
}
