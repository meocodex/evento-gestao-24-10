import { DetailsSheet } from '@/components/shared/sheets';
import { Button } from '@/components/ui/button';
import { ContratoTemplate } from '@/types/contratos';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DetalhesTemplateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ContratoTemplate | null;
  onEdit?: () => void;
}

export function DetalhesTemplateSheet({ open, onOpenChange, template, onEdit }: DetalhesTemplateSheetProps) {
  if (!template) return null;

  const previewConteudo = template.conteudo.split('\n').map((line, i) => (
    <p key={i} className="mb-2 whitespace-pre-wrap">{line}</p>
  ));

  // Tab: Dados
  const DadosTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Badge variant={template.status === 'ativo' ? 'default' : 'secondary'}>
          {template.status === 'ativo' ? 'Ativo' : 'Inativo'}
        </Badge>
        {onEdit && (
          <Button onClick={onEdit} size="sm">
            Editar Template
          </Button>
        )}
      </div>

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
    </div>
  );

  // Tab: Preview
  const PreviewTab = () => (
    <div>
      <h4 className="font-semibold mb-3">Preview do Conteúdo</h4>
      <div className="bg-muted/30 p-4 rounded-md border max-h-[400px] overflow-y-auto">
        <div className="text-sm font-mono">{previewConteudo}</div>
      </div>
    </div>
  );

  const tabs = [
    {
      value: 'dados',
      label: 'Dados',
      content: <DadosTab />
    },
    {
      value: 'preview',
      label: 'Preview',
      content: <PreviewTab />
    }
  ];

  return (
    <DetailsSheet
      open={open}
      onOpenChange={onOpenChange}
      title={template.nome}
      tabs={tabs}
      size="xl"
    />
  );
}
