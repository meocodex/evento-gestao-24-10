

# Editor WYSIWYG Completo com Tiptap

## Objetivo
Substituir o editor atual (contentEditable + document.execCommand) por um editor WYSIWYG completo usando **Tiptap** -- o editor open-source mais popular para React, baseado no ProseMirror.

## Por que Tiptap?
- Open-source (MIT license)
- Arquitetura extensivel via plugins
- Suporte nativo a React
- Comunidade ativa e bem mantido
- Muito mais robusto que `document.execCommand` (que e deprecated)

## Funcionalidades do novo editor
- **Formatacao de texto**: Negrito, Italico, Sublinhado, Tachado
- **Titulos**: H2, H3
- **Listas**: Ordenadas e nao-ordenadas
- **Citacao** (blockquote)
- **Bloco de codigo**
- **Links** com dialog para inserir URL
- **Separador horizontal**
- **Desfazer/Refazer**
- **Placeholder** nativo
- **Indicadores ativos** nos botoes da toolbar

## Dependencias a instalar
- `@tiptap/react` -- integracao React
- `@tiptap/starter-kit` -- extensoes essenciais (bold, italic, headings, lists, code, blockquote, history)
- `@tiptap/extension-link` -- suporte a links
- `@tiptap/extension-underline` -- sublinhado
- `@tiptap/extension-placeholder` -- placeholder nativo
- `@tiptap/pm` -- peer dependency do ProseMirror

## Mudancas

### 1. Reescrever `src/components/baseConhecimento/RichTextEditor.tsx`

- Usar `useEditor` e `EditorContent` do `@tiptap/react`
- Configurar extensoes: StarterKit, Link, Underline, Placeholder
- Barra de ferramentas com botoes usando `editor.chain().focus().toggleBold().run()` etc.
- Estado ativo dos botoes via `editor.isActive('bold')` -- muito mais confiavel que `queryCommandState`
- Sincronizacao bidirecional via `onUpdate` (editor para parent) e `useEffect` com `editor.commands.setContent()` (parent para editor)
- Manter a mesma interface `RichTextEditorProps` -- nenhum consumidor precisa mudar

### 2. Estilos do editor

- Manter as classes `prose` do Tailwind para o conteudo
- Estilizar o editor via CSS no `index.css` para `.tiptap` (foco, placeholder, etc.)
- Toolbar mantendo o visual atual com botoes `shadcn/ui`

### 3. Nenhuma mudanca nos consumidores

`NovoArtigoSheet.tsx` e `EditarArtigoSheet.tsx` continuam usando a mesma interface:
```
<RichTextEditor value={...} onChange={...} placeholder="..." />
```

## Arquivos modificados

| Arquivo | Acao |
|---------|------|
| `src/components/baseConhecimento/RichTextEditor.tsx` | Reescrever com Tiptap |
| `src/index.css` | Adicionar estilos minimos para `.tiptap` |
| `package.json` | Novas dependencias (automatico) |

## Detalhes tecnicos

- O Tiptap produz HTML como output -- compativel com o conteudo ja salvo no banco
- O StarterKit inclui extensoes de history (undo/redo) sem configuracao extra
- Links configurados com `openOnClick: false` no editor (para nao navegar ao clicar durante edicao) e `autolink: true` para detectar URLs automaticamente
- Bundle impact estimado: ~45KB gzipped (ProseMirror core + extensoes)
