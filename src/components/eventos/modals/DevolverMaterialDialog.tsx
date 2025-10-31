import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, CheckCircle, AlertTriangle, XCircle, Trash } from 'lucide-react';
import { MaterialAlocado, StatusDevolucao } from '@/types/estoque';

interface DevolverMaterialDialogProps {
  material: MaterialAlocado | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmar: (dados: {
    statusDevolucao: StatusDevolucao;
    observacoes: string;
    fotos?: string[];
    quantidadeDevolvida?: number;
  }) => void;
}

export function DevolverMaterialDialog({ 
  material, 
  open, 
  onOpenChange,
  onConfirmar 
}: DevolverMaterialDialogProps) {
  const [statusDevolucao, setStatusDevolucao] = useState<StatusDevolucao>('devolvido_ok');
  const [observacoes, setObservacoes] = useState('');
  const [fotos, setFotos] = useState<string[]>([]);
  const [quantidadeDevolvida, setQuantidadeDevolvida] = useState<number>(material?.quantidadeAlocada || 1);

  if (!material) return null;

  const handleConfirmar = () => {
    if (['devolvido_danificado', 'perdido'].includes(statusDevolucao) && !observacoes.trim()) {
      return;
    }

    onConfirmar({
      statusDevolucao,
      observacoes,
      fotos: fotos.length > 0 ? fotos : undefined,
      quantidadeDevolvida: material?.serial ? undefined : quantidadeDevolvida,
    });

    // Limpar form
    setStatusDevolucao('devolvido_ok');
    setObservacoes('');
    setFotos([]);
    setQuantidadeDevolvida(material?.quantidadeAlocada || 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Registrar Devolução</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {material.serial 
              ? `Serial: ${material.serial}` 
              : `Quantidade: ${material.quantidadeAlocada} unidades`
            }
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {!material.serial && (
            <div>
              <Label htmlFor="quantidadeDevolvida">Quantidade Devolvida</Label>
              <Input
                id="quantidadeDevolvida"
                type="number"
                min="0"
                max={material.quantidadeAlocada}
                value={quantidadeDevolvida}
                onChange={(e) => setQuantidadeDevolvida(Math.min(material.quantidadeAlocada, Math.max(0, parseInt(e.target.value) || 0)))}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Alocado: {material.quantidadeAlocada} unidades | Restante será considerado consumido
              </p>
            </div>
          )}

          <div>
            <Label>Status da Devolução</Label>
            <RadioGroup value={statusDevolucao} onValueChange={(v) => setStatusDevolucao(v as StatusDevolucao)} className="mt-2 space-y-3">
              <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="devolvido_ok" id="ok" />
                <Label htmlFor="ok" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="font-medium">Devolvido em Perfeito Estado</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Material volta ao estoque disponível
                  </p>
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="devolvido_danificado" id="danificado" />
                <Label htmlFor="danificado" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span className="font-medium">Devolvido Danificado</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Material vai para manutenção (indisponível)
                  </p>
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="perdido" id="perdido" />
                <Label htmlFor="perdido" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="font-medium">Perdido no Evento</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Baixa permanente do estoque total
                  </p>
                </Label>
              </div>

              {!material.serial && (
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value="consumido" id="consumido" />
                  <Label htmlFor="consumido" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Trash className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Consumido/Usado</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Material consumível que não retorna
                    </p>
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>

          {['devolvido_danificado', 'perdido'].includes(statusDevolucao) && (
            <>
              <div>
                <Label htmlFor="observacoes">Motivo/Observações *</Label>
                <Textarea 
                  id="observacoes"
                  placeholder="Descreva o que aconteceu..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="mt-2"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label>Fotos Comprobatórias (opcional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    // Por enquanto, apenas armazena os nomes dos arquivos
                    // Em produção, fazer upload para Supabase Storage
                    setFotos(files.map(f => f.name));
                  }}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Aceita múltiplas imagens (JPEG, PNG)
                </p>
              </div>
            </>
          )}

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {statusDevolucao === 'devolvido_ok' && '✅ Material será marcado como disponível no estoque'}
              {statusDevolucao === 'devolvido_danificado' && '⚠️ Material será enviado para manutenção'}
              {statusDevolucao === 'perdido' && '🚫 Material será baixado do estoque (não estará mais disponível)'}
              {statusDevolucao === 'consumido' && '❌ Material será registrado como consumido'}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmar}
            disabled={
              (['devolvido_danificado', 'perdido'].includes(statusDevolucao) && !observacoes.trim())
            }
          >
            Confirmar Devolução
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
