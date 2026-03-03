import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Evento } from '@/types/eventos';
import { useFecharEvento } from '@/hooks/eventos/useFecharEvento';
import { CheckCircle, FileText, DollarSign, Archive, Loader2, TrendingUp, TrendingDown } from 'lucide-react';

interface FecharEventoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evento: Evento;
  receitasSelecionadas: string[];
  despesasSelecionadas: string[];
  onGerarPDF: () => void;
}

export function FecharEventoDialog({
  open,
  onOpenChange,
  evento,
  receitasSelecionadas,
  despesasSelecionadas,
  onGerarPDF,
}: FecharEventoDialogProps) {
  const { fecharEvento, isLoading } = useFecharEvento();

  const receitasFiltradas = evento.financeiro.receitas.filter(r => receitasSelecionadas.includes(r.id));
  const despesasFiltradas = evento.financeiro.despesas.filter(d => despesasSelecionadas.includes(d.id));
  const totalReceitas = receitasFiltradas.reduce((sum, r) => sum + r.valor, 0);
  const totalDespesas = despesasFiltradas.reduce((sum, d) => sum + d.valor, 0);
  const saldo = totalReceitas - totalDespesas;

  const handleConfirmar = async () => {
    try {
      // 1. Gerar PDF
      onGerarPDF();

      // 2. Fechar evento + contabilizar
      await fecharEvento({
        evento,
        receitasSelecionadas,
        despesasSelecionadas,
      });

      onOpenChange(false);
    } catch {
      // Erro já tratado pelo hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Fechar Evento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo Financeiro */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <TrendingUp className="h-4 w-4 mx-auto text-green-600 mb-1" />
              <p className="text-xs text-muted-foreground">Receitas</p>
              <p className="text-sm font-bold text-green-600">
                R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <Badge variant="secondary" className="mt-1 text-xs">{receitasFiltradas.length}</Badge>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <TrendingDown className="h-4 w-4 mx-auto text-red-600 mb-1" />
              <p className="text-xs text-muted-foreground">Despesas</p>
              <p className="text-sm font-bold text-red-600">
                R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <Badge variant="secondary" className="mt-1 text-xs">{despesasFiltradas.length}</Badge>
            </div>
            <div className={`text-center p-3 rounded-lg border ${saldo >= 0 ? 'bg-primary/10 border-primary/20' : 'bg-destructive/10 border-destructive/20'}`}>
              <DollarSign className="h-4 w-4 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Saldo</p>
              <p className={`text-sm font-bold ${saldo >= 0 ? 'text-primary' : 'text-destructive'}`}>
                R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <Separator />

          {/* Checklist de ações */}
          <div className="space-y-3">
            <p className="text-sm font-medium">O sistema irá executar:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                <span>Gerar e baixar o PDF de fechamento</span>
              </div>
              {receitasFiltradas.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  <span>Lançar {receitasFiltradas.length} receita(s) como <strong>Contas a Receber</strong></span>
                </div>
              )}
              {despesasFiltradas.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  <span>Lançar {despesasFiltradas.length} despesa(s) como <strong>Contas a Pagar</strong></span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                <span>Arquivar o evento <strong>{evento.nome}</strong></span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Confirmar Fechamento
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
