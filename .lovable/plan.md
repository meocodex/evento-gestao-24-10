

# Editor WYSIWYG em Tempo Real para Base de Conhecimento

## Objetivo
Substituir o editor atual (textarea com tags HTML + aba de preview separada) por um editor WYSIWYG verdadeiro, onde o usuario edita visualmente o conteudo formatado em tempo real, sem precisar alternar entre abas.

## Abordagem
Usar `contentEditable` nativo com `document.execCommand` para formatacao. Sem dependencias externas -- mantendo o bundle leve conforme o padrao do projeto.

## Mudancas

### 1. Reescrever `src/components/baseConhecimento/RichTextEditor.tsx`

**Remover**:
- Sistema de Tabs (Editar/Visualizar)
- Textarea com manipulacao de selectionStart/selectionEnd
- Funcoes `wrapSelection`, `insertAtCursor`, array `FORMAT_ACTIONS`

**Novo componente**:
- Um `div` com `contentEditable={true}` estilizado com as classes `prose` do Tailwind
- Barra de ferramentas acima com os mesmos botoes (Negrito, Italico, H2, H3, Lista, Lista Ordenada, Link, Separador)
- Cada botao executa `document.execCommand()` (ex: `bold`, `italic`, `insertOrderedList`, etc.)
- Para links: um prompt simples pedindo a URL
- O `onInput` do div captura `innerHTML` e chama `onChange(html)`
- Sincronizacao bidirecional: quando `value` muda externamente, atualiza `innerHTML` do div (com protecao contra loop infinito)
- Indicador visual de formatacao ativa nos botoes (verifica `document.queryCommandState`)

**Interface mantida identica**:
```typescript
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}
```

### 2. Nenhuma mudanca nos consumidores

Os componentes `NovoArtigoSheet`, `EditarArtigoSheet` e `ArtigoDetalhes` continuam funcionando sem alteracao, pois o editor continua produzindo/consumindo HTML como string.

## Detalhes Tecnicos

- `document.execCommand` e deprecated pela spec mas funciona em todos os browsers modernos e e a abordagem padrao para WYSIWYG leve sem bibliotecas
- Placeholder implementado via CSS `[contenteditable]:empty:before` com pseudo-elemento
- Estado dos botoes (ativo/inativo) atualizado via `onSelectionChange` no document, usando `document.queryCommandState('bold')` etc.
- Protecao XSS ja existe no fluxo atual (`dangerouslySetInnerHTML` no ArtigoDetalhes) -- o conteudo e criado apenas por admins autenticados

## Arquivo modificado
| Arquivo | Acao |
|---------|------|
| `src/components/baseConhecimento/RichTextEditor.tsx` | Reescrever como WYSIWYG com contentEditable |

