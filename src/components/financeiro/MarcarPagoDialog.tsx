import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ContaPagar, FormaPagamento } from '@/types/financeiro';

interface MarcarPagoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conta: ContaPagar | null;
  onConfirm: (data: { id: string; data_pagamento: string; forma_pagamento: string }) => void;
}

export function MarcarPagoDialog({ open, onOpenChange, conta, onConfirm }: MarcarPagoDialogProps) {
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().split('T')[0]);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('PIX');

  const handleConfirm = () => {
    if (!conta) return;
    onConfirm({
      id: conta.id,
      data_pagamento: dataPagamento,
      forma_pagamento: formaPagamento,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Marcar como Pago</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Conta</Label>
            <p className="text-sm text-muted-foreground">{conta?.descricao}</p>
          </div>
          <div>
            <Label>Valor</Label>
            <p className="text-sm font-medium">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(conta?.valor || 0))}
            </p>
          </div>
          <div>
            <Label htmlFor="data_pagamento">Data de Pagamento *</Label>
            <Input
              id="data_pagamento"
              type="date"
              value={dataPagamento}
              onChange={(e) => setDataPagamento(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="forma_pagamento">Forma de Pagamento *</Label>
            <Select value={formaPagamento} onValueChange={(v) => setFormaPagamento(v as FormaPagamento)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="Boleto">Boleto</SelectItem>
                <SelectItem value="Transferência">Transferência</SelectItem>
                <SelectItem value="Cartão">Cartão</SelectItem>
                <SelectItem value="Dinheiro">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
