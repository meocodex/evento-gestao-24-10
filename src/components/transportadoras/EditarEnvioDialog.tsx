import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Envio } from '@/types/transportadoras';
import { useTransportadoras } from '@/contexts/TransportadorasContext';
import { DocumentUpload } from '@/components/shared/DocumentUpload';

interface EditarEnvioDialogProps {
  envio: Envio;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditarEnvioDialog({ envio, open, onOpenChange }: EditarEnvioDialogProps) {
  const { editarEnvio } = useTransportadoras();
  const [formData, setFormData] = useState({
    status: envio.status,
    dataEntregaPrevista: envio.dataEntregaPrevista.split('T')[0],
    rastreio: envio.rastreio || '',
    valor: envio.valor?.toString() || '',
    formaPagamento: envio.formaPagamento,
    comprovantePagamento: envio.comprovantePagamento || '',
    observacoes: envio.observacoes || '',
  });

  useEffect(() => {
    setFormData({
      status: envio.status,
      dataEntregaPrevista: envio.dataEntregaPrevista.split('T')[0],
      rastreio: envio.rastreio || '',
      valor: envio.valor?.toString() || '',
      formaPagamento: envio.formaPagamento,
      comprovantePagamento: envio.comprovantePagamento || '',
      observacoes: envio.observacoes || '',
    });
  }, [envio]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editarEnvio(envio.id, {
      ...formData,
      valor: formData.valor ? parseFloat(formData.valor) : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Envio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Envio['status']) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_transito">Em Trânsito</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data Prevista</Label>
              <Input
                type="date"
                value={formData.dataEntregaPrevista}
                onChange={(e) => setFormData({ ...formData, dataEntregaPrevista: e.target.value })}
              />
            </div>
            <div>
              <Label>Código de Rastreio</Label>
              <Input
                value={formData.rastreio}
                onChange={(e) => setFormData({ ...formData, rastreio: e.target.value })}
                placeholder="Ex: TR123456789BR"
              />
            </div>
            <div>
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              />
            </div>
            <div>
              <Label>Forma de Pagamento</Label>
              <Select
                value={formData.formaPagamento}
                onValueChange={(value: 'antecipado' | 'na_entrega' | 'a_combinar') =>
                  setFormData({ ...formData, formaPagamento: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="antecipado">Antecipado</SelectItem>
                  <SelectItem value="na_entrega">Na Entrega</SelectItem>
                  <SelectItem value="a_combinar">A Combinar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.formaPagamento === 'antecipado' && (
              <div>
                <Label>Comprovante de Pagamento</Label>
                <DocumentUpload
                  onFileSelect={(file) => {
                    const url = URL.createObjectURL(file);
                    setFormData({ ...formData, comprovantePagamento: url });
                  }}
                  currentFile={formData.comprovantePagamento}
                />
              </div>
            )}
            <div className="col-span-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
