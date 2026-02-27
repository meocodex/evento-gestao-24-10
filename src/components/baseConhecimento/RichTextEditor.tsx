import { useRef, useCallback } from 'react';
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2, Minus, Eye, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

type FormatAction = {
  icon: React.ElementType;
  label: string;
  action: (text: string, start: number, end: number) => { newText: string; cursorPos: number };
};

const wrapSelection = (
  text: string,
  start: number,
  end: number,
  before: string,
  after: string,
  placeholder = 'texto'
): { newText: string; cursorPos: number } => {
  const selected = text.slice(start, end);
  const content = selected || placeholder;
  const newText = text.slice(0, start) + before + content + after + text.slice(end);
  const cursorPos = start + before.length + content.length;
  return { newText, cursorPos };
};

const insertAtCursor = (
  text: string,
  start: number,
  end: number,
  insertion: string
): { newText: string; cursorPos: number } => {
  const newText = text.slice(0, start) + insertion + text.slice(end);
  return { newText, cursorPos: start + insertion.length };
};

const FORMAT_ACTIONS: FormatAction[] = [
  {
    icon: Bold,
    label: 'Negrito',
    action: (text, start, end) => wrapSelection(text, start, end, '<strong>', '</strong>', 'texto em negrito'),
  },
  {
    icon: Italic,
    label: 'Itálico',
    action: (text, start, end) => wrapSelection(text, start, end, '<em>', '</em>', 'texto em itálico'),
  },
  {
    icon: Heading2,
    label: 'Título H2',
    action: (text, start, end) => wrapSelection(text, start, end, '<h2>', '</h2>', 'Título'),
  },
  {
    icon: Heading3,
    label: 'Subtítulo H3',
    action: (text, start, end) => wrapSelection(text, start, end, '<h3>', '</h3>', 'Subtítulo'),
  },
  {
    icon: List,
    label: 'Lista',
    action: (text, start, end) => {
      const selected = text.slice(start, end);
      const items = selected
        ? selected.split('\n').map((line) => `  <li>${line}</li>`).join('\n')
        : '  <li>Item</li>';
      return insertAtCursor(text, start, end, `<ul>\n${items}\n</ul>`);
    },
  },
  {
    icon: ListOrdered,
    label: 'Lista numerada',
    action: (text, start, end) => {
      const selected = text.slice(start, end);
      const items = selected
        ? selected.split('\n').map((line) => `  <li>${line}</li>`).join('\n')
        : '  <li>Item</li>';
      return insertAtCursor(text, start, end, `<ol>\n${items}\n</ol>`);
    },
  },
  {
    icon: Link2,
    label: 'Link',
    action: (text, start, end) => {
      const selected = text.slice(start, end) || 'texto do link';
      return insertAtCursor(text, start, end, `<a href="url">${selected}</a>`);
    },
  },
  {
    icon: Minus,
    label: 'Separador',
    action: (text, start, end) => insertAtCursor(text, start, end, '\n<hr />\n'),
  },
];

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = useCallback(
    (action: FormatAction['action']) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const { selectionStart, selectionEnd } = textarea;
      const { newText, cursorPos } = action(value, selectionStart, selectionEnd);
      onChange(newText);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(cursorPos, cursorPos);
      });
    },
    [value, onChange]
  );

  return (
    <Tabs defaultValue="editar" className={cn('w-full', className)}>
      <TabsList className="w-full grid grid-cols-2">
        <TabsTrigger value="editar" className="gap-1.5">
          <Pencil className="h-3.5 w-3.5" /> Editar
        </TabsTrigger>
        <TabsTrigger value="visualizar" className="gap-1.5">
          <Eye className="h-3.5 w-3.5" /> Visualizar
        </TabsTrigger>
      </TabsList>

      <TabsContent value="editar" className="mt-2 space-y-2">
        <div className="flex flex-wrap gap-1 rounded-md border border-input bg-muted/50 p-1">
          {FORMAT_ACTIONS.map((fmt) => (
            <Button
              key={fmt.label}
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title={fmt.label}
              onClick={() => applyFormat(fmt.action)}
            >
              <fmt.icon className="h-3.5 w-3.5" />
            </Button>
          ))}
        </div>
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[200px] font-mono text-sm"
        />
      </TabsContent>

      <TabsContent value="visualizar" className="mt-2">
        <div
          className="prose prose-sm dark:prose-invert max-w-none min-h-[200px] rounded-md border border-input bg-background p-4"
          dangerouslySetInnerHTML={{ __html: value || '<p class="text-muted-foreground">Nenhum conteúdo ainda...</p>' }}
        />
      </TabsContent>
    </Tabs>
  );
}
