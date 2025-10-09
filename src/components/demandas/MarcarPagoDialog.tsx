import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Upload, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarcarPagoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (dataPagamento: string, comprovante?: string, observacoes?: string) => void;
  valorTotal: number;
}

export function MarcarPagoDialog({ 
  open, 
  onOpenChange, 
  onConfirm,
  valorTotal 
}: MarcarPagoDialogProps) {
  const [dataPagamento, setDataPagamento] = useState<Date>();
  const [comprovante, setComprovante] = useState<string>('');
  const [observacoes, setObservacoes] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setComprovante(file.name);
    }
  };

  const handleConfirm = () => {
    if (!dataPagamento) return;
    onConfirm(
      dataPagamento.toISOString(),
      comprovante || undefined,
      observacoes || undefined
    );
    setDataPagamento(undefined);
    setComprovante('');
    setObservacoes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Marcar como Pago
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Valor pago:</p>
            <p className="text-2xl font-bold text-green-600">
              R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div>
            <Label>Data do Pagamento *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dataPagamento && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataPagamento ? (
                    format(dataPagamento, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dataPagamento}
                  onSelect={setDataPagamento}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>Comprovante de Pagamento (Opcional)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                onChange={handleFileUpload}
                className="flex-1"
              />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
            {comprovante && (
              <p className="text-sm text-muted-foreground mt-1">
                Arquivo: {comprovante}
              </p>
            )}
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!dataPagamento}>
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
