import { useRef, useCallback, useEffect, useState } from 'react';
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

type ToolbarAction = {
  icon: React.ElementType;
  label: string;
  command: string;
  value?: string;
  custom?: boolean;
};

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { icon: Bold, label: 'Negrito', command: 'bold' },
  { icon: Italic, label: 'Itálico', command: 'italic' },
  { icon: Heading2, label: 'Título H2', command: 'formatBlock', value: 'h2' },
  { icon: Heading3, label: 'Subtítulo H3', command: 'formatBlock', value: 'h3' },
  { icon: List, label: 'Lista', command: 'insertUnorderedList' },
  { icon: ListOrdered, label: 'Lista numerada', command: 'insertOrderedList' },
  { icon: Link2, label: 'Link', command: 'createLink', custom: true },
  { icon: Minus, label: 'Separador', command: 'insertHorizontalRule' },
];

const STATEFUL_COMMANDS = ['bold', 'italic', 'insertUnorderedList', 'insertOrderedList'];

export function RichTextEditor({ value, onChange, placeholder = 'Escreva aqui...', className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>({});

  // Sync external value changes into the editor
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (editor.innerHTML !== value) {
      editor.innerHTML = value;
    }
  }, [value]);

  const handleInput = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    isInternalChange.current = true;
    const html = editor.innerHTML;
    onChange(html === '<br>' ? '' : html);
  }, [onChange]);

  const updateActiveStates = useCallback(() => {
    const states: Record<string, boolean> = {};
    for (const cmd of STATEFUL_COMMANDS) {
      try {
        states[cmd] = document.queryCommandState(cmd);
      } catch {
        states[cmd] = false;
      }
    }
    setActiveStates(states);
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', updateActiveStates);
    return () => document.removeEventListener('selectionchange', updateActiveStates);
  }, [updateActiveStates]);

  const execAction = useCallback((action: ToolbarAction) => {
    editorRef.current?.focus();
    if (action.custom && action.command === 'createLink') {
      const url = prompt('URL do link:');
      if (url) document.execCommand('createLink', false, url);
    } else if (action.value) {
      document.execCommand(action.command, false, action.value);
    } else {
      document.execCommand(action.command, false);
    }
    handleInput();
    updateActiveStates();
  }, [handleInput, updateActiveStates]);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex flex-wrap gap-1 rounded-t-md border border-input bg-muted/50 p-1">
        {TOOLBAR_ACTIONS.map((action) => (
          <Button
            key={action.label}
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              'h-7 w-7',
              activeStates[action.command] && 'bg-accent text-accent-foreground'
            )}
            title={action.label}
            onMouseDown={(e) => {
              e.preventDefault();
              execAction(action);
            }}
          >
            <action.icon className="h-3.5 w-3.5" />
          </Button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
        className={cn(
          'prose prose-sm dark:prose-invert max-w-none',
          'min-h-[200px] rounded-b-md border border-t-0 border-input bg-background p-4',
          'focus:outline-none',
          'empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none'
        )}
      />
    </div>
  );
}
