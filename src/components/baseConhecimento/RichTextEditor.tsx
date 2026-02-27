import { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading2, Heading3, List, ListOrdered, Quote, Code2,
  Link2, Minus, Undo2, Redo2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder = 'Escreva aqui...', className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { class: 'text-primary underline cursor-pointer' },
      }),
      Underline,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      onChange(html === '<p></p>' ? '' : html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none min-h-[200px] p-4 focus:outline-none',
      },
    },
  });

  // Sync external value into editor
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const normalizedValue = value || '<p></p>';
    if (currentHtml !== normalizedValue && currentHtml !== value) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL do link:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const toolbarGroups = [
    [
      { icon: Bold, label: 'Negrito', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
      { icon: Italic, label: 'Itálico', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
      { icon: UnderlineIcon, label: 'Sublinhado', action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline') },
      { icon: Strikethrough, label: 'Tachado', action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike') },
    ],
    [
      { icon: Heading2, label: 'Título H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
      { icon: Heading3, label: 'Subtítulo H3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
    ],
    [
      { icon: List, label: 'Lista', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
      { icon: ListOrdered, label: 'Lista numerada', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
      { icon: Quote, label: 'Citação', action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
      { icon: Code2, label: 'Código', action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock') },
    ],
    [
      { icon: Link2, label: 'Link', action: setLink, active: editor.isActive('link') },
      { icon: Minus, label: 'Separador', action: () => editor.chain().focus().setHorizontalRule().run(), active: false },
    ],
    [
      { icon: Undo2, label: 'Desfazer', action: () => editor.chain().focus().undo().run(), active: false },
      { icon: Redo2, label: 'Refazer', action: () => editor.chain().focus().redo().run(), active: false },
    ],
  ];

  return (
    <div className={cn('w-full', className)}>
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-md border border-input bg-muted/50 p-1">
        {toolbarGroups.map((group, gi) => (
          <div key={gi} className="flex items-center gap-0.5">
            {gi > 0 && <Separator orientation="vertical" className="mx-1 h-5" />}
            {group.map((item) => (
              <Button
                key={item.label}
                type="button"
                variant="ghost"
                size="icon"
                className={cn('h-7 w-7', item.active && 'bg-accent text-accent-foreground')}
                title={item.label}
                onMouseDown={(e) => {
                  e.preventDefault();
                  item.action();
                }}
              >
                <item.icon className="h-3.5 w-3.5" />
              </Button>
            ))}
          </div>
        ))}
      </div>
      <div className="rounded-b-md border border-t-0 border-input bg-background">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
