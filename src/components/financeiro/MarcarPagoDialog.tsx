import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnexosUpload } from '@/components/financeiro/AnexosUpload';
import type { ContaPagar, FormaPagamento, AnexoFinanceiro } from '@/types/financeiro';

interface MarcarPagoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conta: ContaPagar | null;
  onConfirm: (data: { 
    id: string; 
    data_pagamento: string; 
    forma_pagamento: string;
    observacoes_pagamento?: string;
    comprovante_pagamento?: string;
  }) => void;
}

export function MarcarPagoDialog({ open, onOpenChange, conta, onConfirm }: MarcarPagoDialogProps) {
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().split('T')[0]);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('PIX');
  const [observacoes, setObservacoes] = useState('');
  const [anexos, setAnexos] = useState<AnexoFinanceiro[]>([]);

  const handleConfirm = () => {
    if (!conta) return;
    onConfirm({
      id: conta.id,
      data_pagamento: dataPagamento,
      forma_pagamento: formaPagamento,
      observacoes_pagamento: observacoes || undefined,
      comprovante_pagamento: anexos.length > 0 ? anexos[0].url : undefined,
    });
    setObservacoes('');
    setAnexos([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
          <div>
            <Label htmlFor="observacoes_pagamento">Observações do Pagamento</Label>
            <Textarea
              id="observacoes_pagamento"
              placeholder="Nota sobre o pagamento..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label>Comprovante de Pagamento</Label>
            <AnexosUpload
              onAnexosChange={setAnexos}
              anexosAtuais={anexos}
              maxFiles={5}
            />
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
