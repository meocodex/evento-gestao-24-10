import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, CheckSquare, AlertTriangle, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { StatusDevolucao, MaterialAlocado } from '@/types/estoque';
import { toast } from '@/hooks/use-toast';

interface DevolverMaterialLoteDialogProps {
  materiais: MaterialAlocado[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmar: (materiaisIds: string[], statusDevolucao: StatusDevolucao, observacoes: string, fotos: string[]) => Promise<void>;
}

export function DevolverMaterialLoteDialog({
  materiais,
  open,
  onOpenChange,
  onConfirmar
}: DevolverMaterialLoteDialogProps) {
  const [materiaisSelecionados, setMateriaisSelecionados] = useState<string[]>([]);
  const [statusLote, setStatusLote] = useState<StatusDevolucao>('devolvido_ok');
  const [observacoesLote, setObservacoesLote] = useState('');
  const [fotosLote, setFotosLote] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);

  const toggleMaterial = (id: string) => {
    setMateriaisSelecionados(prev => 
      prev.includes(id) 
        ? prev.filter(m => m !== id)
        : [...prev, id]
    );
  };

  const selecionarTodos = () => {
    setMateriaisSelecionados(materiais.map(m => m.id));
  };

  const limparSelecao = () => {
    setMateriaisSelecionados([]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFotos: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      await new Promise((resolve) => {
        reader.onloadend = () => {
          if (reader.result) {
            newFotos.push(reader.result as string);
          }
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
    }
    
    setFotosLote(prev => [...prev, ...newFotos]);
  };

  const handleSubmitLote = async () => {
    if (materiaisSelecionados.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhum material selecionado",
        description: "Selecione pelo menos um material para devolver."
      });
      return;
    }

    if ((statusLote === 'devolvido_danificado' || statusLote === 'perdido') && !observacoesLote.trim()) {
      toast({
        variant: "destructive",
        title: "Observações obrigatórias",
        description: "Para materiais danificados ou perdidos, as observações são obrigatórias."
      });
      return;
    }

    setIsProcessing(true);
    setProcessedCount(0);

    try {
      await onConfirmar(materiaisSelecionados, statusLote, observacoesLote, fotosLote);
      
      toast({
        title: "Devoluções registradas!",
        description: `${materiaisSelecionados.length} ${materiaisSelecionados.length === 1 ? 'devolução registrada' : 'devoluções registradas'} com sucesso.`
      });
      
      // Reset
      setMateriaisSelecionados([]);
      setStatusLote('devolvido_ok');
      setObservacoesLote('');
      setFotosLote([]);
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao registrar devoluções",
        description: error instanceof Error ? error.message : "Tente novamente."
      });
    } finally {
      setIsProcessing(false);
      setProcessedCount(0);
    }
  };

  const getStatusIcon = (status: StatusDevolucao) => {
    switch (status) {
      case 'devolvido_ok':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'devolvido_danificado':
        return <AlertTriangle className="h-4 w-4" />;
      case 'perdido':
        return <XCircle className="h-4 w-4" />;
      case 'consumido':
        return <Trash2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: StatusDevolucao) => {
    switch (status) {
      case 'devolvido_ok':
        return 'Devolvido OK (volta ao estoque)';
      case 'devolvido_danificado':
        return 'Danificado (vai para manutenção)';
      case 'perdido':
        return 'Perdido (baixa do estoque)';
      case 'consumido':
        return 'Consumido';
      default:
        return status;
    }
  };

  const getAlertMessage = () => {
    const count = materiaisSelecionados.length;
    if (count === 0) return null;

    switch (statusLote) {
      case 'devolvido_ok':
        return `${count} ${count === 1 ? 'material será devolvido' : 'materiais serão devolvidos'} ao estoque como disponível.`;
      case 'devolvido_danificado':
        return `${count} ${count === 1 ? 'material será enviado' : 'materiais serão enviados'} para manutenção.`;
      case 'perdido':
        return `${count} ${count === 1 ? 'material será marcado' : 'materiais serão marcados'} como perdido e dado baixa.`;
      case 'consumido':
        return `${count} ${count === 1 ? 'material será marcado' : 'materiais serão marcados'} como consumido.`;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Devolução em Lote ({materiais.length} materiais pendentes)</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Header de Seleção */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Badge variant={materiaisSelecionados.length === materiais.length ? "default" : "secondary"}>
                {materiaisSelecionados.length} / {materiais.length}
              </Badge>
              <p className="text-sm text-muted-foreground">selecionados</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={selecionarTodos}
                disabled={materiaisSelecionados.length === materiais.length}
              >
                Selecionar Todos
              </Button>
              
              {materiaisSelecionados.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={limparSelecao}
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* Lista de Materiais */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-2">
              {materiais.map(material => {
                const selecionado = materiaisSelecionados.includes(material.id);
                
                return (
                  <Card
                    key={material.id}
                    className={`cursor-pointer transition-colors ${
                      selecionado ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                    onClick={() => toggleMaterial(material.id)}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      {/* Checkbox */}
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        selecionado ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                      }`}>
                        {selecionado && <Check className="h-4 w-4 text-primary-foreground" />}
                      </div>

                      {/* Info do Material */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{material.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {material.serial || `${material.quantidadeAlocada} unidades`}
                        </p>
                      </div>

                      {/* Badge de Tipo */}
                      <Badge variant="outline" className="flex-shrink-0">
                        {material.tipoEnvio === 'antecipado' ? 'Antecipado' : 'Técnicos'}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>

          {/* Status para o Lote */}
          {materiaisSelecionados.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label>Status para TODOS os selecionados:</Label>
                <RadioGroup value={statusLote} onValueChange={(v) => setStatusLote(v as StatusDevolucao)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="devolvido_ok" id="ok-lote" />
                    <Label htmlFor="ok-lote" className="flex items-center gap-2 cursor-pointer">
                      {getStatusIcon('devolvido_ok')}
                      {getStatusLabel('devolvido_ok')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="devolvido_danificado" id="danificado-lote" />
                    <Label htmlFor="danificado-lote" className="flex items-center gap-2 cursor-pointer">
                      {getStatusIcon('devolvido_danificado')}
                      {getStatusLabel('devolvido_danificado')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="perdido" id="perdido-lote" />
                    <Label htmlFor="perdido-lote" className="flex items-center gap-2 cursor-pointer">
                      {getStatusIcon('perdido')}
                      {getStatusLabel('perdido')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="consumido" id="consumido-lote" />
                    <Label htmlFor="consumido-lote" className="flex items-center gap-2 cursor-pointer">
                      {getStatusIcon('consumido')}
                      {getStatusLabel('consumido')}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Observações */}
              {(statusLote === 'devolvido_danificado' || statusLote === 'perdido') && (
                <div className="space-y-2">
                  <Label htmlFor="observacoes-lote">
                    Observações {(statusLote === 'devolvido_danificado' || statusLote === 'perdido') && '*'}
                  </Label>
                  <Textarea
                    id="observacoes-lote"
                    value={observacoesLote}
                    onChange={(e) => setObservacoesLote(e.target.value)}
                    placeholder="Descreva o que aconteceu com os materiais..."
                    rows={3}
                  />
                </div>
              )}

              {/* Upload de Fotos */}
              {(statusLote === 'devolvido_danificado' || statusLote === 'perdido') && (
                <div className="space-y-2">
                  <Label htmlFor="fotos-lote">Fotos (opcional)</Label>
                  <Input
                    id="fotos-lote"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                  {fotosLote.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {fotosLote.length} {fotosLote.length === 1 ? 'foto adicionada' : 'fotos adicionadas'}
                    </p>
                  )}
                </div>
              )}

              {/* Alert de Ação */}
              {getAlertMessage() && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{getAlertMessage()}</AlertDescription>
                </Alert>
              )}

              {/* Progress durante processamento */}
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Processando devoluções...</span>
                    <span className="font-medium">
                      {processedCount} / {materiaisSelecionados.length}
                    </span>
                  </div>
                  <Progress 
                    value={(processedCount / materiaisSelecionados.length) * 100} 
                    className="h-2"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmitLote}
            disabled={materiaisSelecionados.length === 0 || isProcessing}
          >
            {isProcessing ? 'Processando...' : `Registrar ${materiaisSelecionados.length} ${materiaisSelecionados.length === 1 ? 'Devolução' : 'Devoluções'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
