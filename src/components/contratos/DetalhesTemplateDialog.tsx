import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ContratoTemplate } from '@/types/contratos';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DetalhesTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ContratoTemplate | null;
  onEdit?: () => void;
}

export function DetalhesTemplateDialog({ open, onOpenChange, template, onEdit }: DetalhesTemplateDialogProps) {
  if (!template) return null;

  const previewConteudo = template.conteudo.split('\n').map((line, i) => (
    <p key={i} className="mb-2 whitespace-pre-wrap">{line}</p>
  ));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{template.nome}</span>
            <Badge variant={template.status === 'ativo' ? 'default' : 'secondary'}>
              {template.status === 'ativo' ? 'Ativo' : 'Inativo'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Tipo:</span>
              <p className="font-medium capitalize">{template.tipo}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Versão:</span>
              <p className="font-medium">v{template.versao}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Criado em:</span>
              <p className="font-medium">
                {format(new Date(template.criadoEm), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Atualizado em:</span>
              <p className="font-medium">
                {format(new Date(template.atualizadoEm), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>

          <div>
            <span className="text-sm text-muted-foreground">Descrição:</span>
            <p className="mt-1">{template.descricao}</p>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-2">Variáveis do Template ({template.variaveis.length})</h4>
            <div className="flex flex-wrap gap-2">
              {template.variaveis.map((v) => (
                <Badge key={v} variant="outline">
                  {`{{${v}}}`}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-3">Preview do Conteúdo</h4>
            <div className="bg-muted/30 p-4 rounded-md border max-h-[400px] overflow-y-auto">
              <div className="text-sm font-mono">{previewConteudo}</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {onEdit && (
            <Button onClick={onEdit}>
              Editar Template
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
