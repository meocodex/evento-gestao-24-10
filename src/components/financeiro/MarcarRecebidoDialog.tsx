import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnexosUpload } from '@/components/financeiro/AnexosUpload';
import type { ContaReceber, FormaPagamento, AnexoFinanceiro } from '@/types/financeiro';

interface MarcarRecebidoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conta: ContaReceber | null;
  onConfirm: (data: { 
    id: string; 
    data_recebimento: string; 
    forma_recebimento: string;
    observacoes_pagamento?: string;
    comprovante_pagamento?: string;
  }) => void;
}

export function MarcarRecebidoDialog({ open, onOpenChange, conta, onConfirm }: MarcarRecebidoDialogProps) {
  const [dataRecebimento, setDataRecebimento] = useState(new Date().toISOString().split('T')[0]);
  const [formaRecebimento, setFormaRecebimento] = useState<FormaPagamento>('PIX');
  const [observacoes, setObservacoes] = useState('');
  const [anexos, setAnexos] = useState<AnexoFinanceiro[]>([]);

  const handleConfirm = () => {
    if (!conta) return;
    onConfirm({
      id: conta.id,
      data_recebimento: dataRecebimento,
      forma_recebimento: formaRecebimento,
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
          <DialogTitle>Marcar como Recebido</DialogTitle>
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
            <Label htmlFor="data_recebimento">Data de Recebimento *</Label>
            <Input
              id="data_recebimento"
              type="date"
              value={dataRecebimento}
              onChange={(e) => setDataRecebimento(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="forma_recebimento">Forma de Recebimento *</Label>
            <Select value={formaRecebimento} onValueChange={(v) => setFormaRecebimento(v as FormaPagamento)}>
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
            <Label htmlFor="observacoes_recebimento">Observações do Recebimento</Label>
            <Textarea
              id="observacoes_recebimento"
              placeholder="Nota sobre o recebimento..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label>Comprovante de Recebimento</Label>
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
            Confirmar Recebimento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
