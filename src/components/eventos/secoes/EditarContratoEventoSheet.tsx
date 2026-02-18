import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ContratoEvento } from '@/types/evento-contratos';
import { useEventoContratos } from '@/hooks/useEventoContratos';
import { Loader2, Save, CheckCircle2 } from 'lucide-react';

interface EditarContratoEventoSheetProps {
  contrato: ContratoEvento;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventoId: string;
}

export function EditarContratoEventoSheet({
  contrato,
  open,
  onOpenChange,
  eventoId,
}: EditarContratoEventoSheetProps) {
  const [conteudo, setConteudo] = useState(contrato.conteudo);
  const { editarContrato, finalizarContrato } = useEventoContratos(eventoId);

  const handleSalvar = async () => {
    await editarContrato.mutateAsync({ id: contrato.id, conteudo });
    onOpenChange(false);
  };

  const handleFinalizar = async () => {
    await editarContrato.mutateAsync({ id: contrato.id, conteudo });
    await finalizarContrato.mutateAsync(contrato.id);
    onOpenChange(false);
  };

  const isSaving = editarContrato.isPending || finalizarContrato.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle className="text-left">{contrato.titulo}</SheetTitle>
            <Badge
              variant="outline"
              className={
                contrato.status === 'finalizado'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }
            >
              {contrato.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground text-left">
            Edite o texto do contrato abaixo. Clique em "Finalizar" quando estiver pronto para assinar.
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-hidden px-6 py-4">
          <Textarea
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            className="h-full min-h-[500px] resize-none font-mono text-sm leading-relaxed"
            placeholder="Conteúdo do contrato..."
          />
        </div>

        <SheetFooter className="px-6 pb-6 pt-4 border-t gap-2 flex-row">
          <Button
            variant="outline"
            onClick={handleSalvar}
            disabled={isSaving}
            className="flex-1"
          >
            {editarContrato.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar Rascunho
          </Button>

          {contrato.status !== 'finalizado' && (
            <Button
              onClick={handleFinalizar}
              disabled={isSaving}
              className="flex-1"
            >
              {finalizarContrato.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Finalizar Contrato
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
