import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DocumentUpload } from '@/components/shared/DocumentUpload';
import { useTransportadoras } from '@/hooks/transportadoras';
import { Envio } from '@/types/transportadoras';
import { useIsMobile } from '@/hooks/use-mobile';

interface EditarEnvioSheetProps {
  envio: Envio;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditarEnvioSheet({ envio, open, onOpenChange }: EditarEnvioSheetProps) {
  const { editarEnvio } = useTransportadoras();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState(envio);

  // Só atualizar formData se envio realmente mudou (comparação por ID)
  useEffect(() => {
    if (envio.id !== formData.id) {
      setFormData(envio);
    }
  }, [envio.id, envio, formData.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await editarEnvio.mutateAsync({ id: envio.id, data: formData });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"}
        className={isMobile ? "h-[90vh] rounded-t-3xl" : "w-full sm:w-[600px] lg:w-[800px] overflow-y-auto"}
      >
        <SheetHeader className="border-b border-navy-100 pb-4 mb-6">
          <SheetTitle className="text-2xl font-display text-navy-800">
            Editar Envio
          </SheetTitle>
          <SheetDescription className="text-navy-500">
            Atualize as informações do envio
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="status" className="text-navy-700">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'pendente' | 'em_transito' | 'entregue' | 'cancelado') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="border-navy-200">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dataEntregaPrevista" className="text-navy-700">Data Prevista</Label>
                <Input
                  id="dataEntregaPrevista"
                  type="date"
                  value={formData.dataEntregaPrevista}
                  onChange={(e) => setFormData({ ...formData, dataEntregaPrevista: e.target.value })}
                  className="border-navy-200 focus:border-navy-400"
                />
              </div>
              <div>
                <Label htmlFor="dataEntrega" className="text-navy-700">Data Real de Entrega</Label>
                <Input
                  id="dataEntrega"
                  type="date"
                  value={formData.dataEntrega || ''}
                  onChange={(e) => setFormData({ ...formData, dataEntrega: e.target.value })}
                  className="border-navy-200 focus:border-navy-400"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="rastreio" className="text-navy-700">Código de Rastreamento</Label>
              <Input
                id="rastreio"
                value={formData.rastreio || ''}
                onChange={(e) => setFormData({ ...formData, rastreio: e.target.value })}
                className="border-navy-200 focus:border-navy-400"
                placeholder="Ex: BR123456789"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valor" className="text-navy-700">Valor (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={formData.valor || 0}
                  onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
                  className="border-navy-200 focus:border-navy-400"
                />
              </div>
              <div>
                <Label htmlFor="formaPagamento" className="text-navy-700">Forma de Pagamento</Label>
                <Select
                  value={formData.formaPagamento}
                  onValueChange={(value: 'antecipado' | 'na_entrega' | 'a_combinar') =>
                    setFormData({ ...formData, formaPagamento: value })
                  }
                >
                  <SelectTrigger className="border-navy-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="antecipado">Antecipado</SelectItem>
                    <SelectItem value="na_entrega">Na Entrega</SelectItem>
                    <SelectItem value="a_combinar">A Combinar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.formaPagamento === 'antecipado' && (
              <div>
                <Label className="text-navy-700">Comprovante de Pagamento</Label>
                <DocumentUpload
                  onFileSelect={(file) => {
                    // TODO: Upload file to storage and get URL
                  }}
                  currentFile={formData.comprovantePagamento}
                />
              </div>
            )}

            <div>
              <Label htmlFor="observacoes" className="text-navy-700">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes || ''}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                className="border-navy-200 focus:border-navy-400"
                rows={3}
              />
            </div>
          </div>

          <SheetFooter className="border-t border-navy-100 pt-6 mt-6 gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Alterações
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
