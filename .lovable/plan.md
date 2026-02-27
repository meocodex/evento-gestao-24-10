

# Editor de Texto Rico para Base de Conhecimento

## Contexto
Atualmente o campo "Conteudo" dos artigos usa um `<Textarea>` simples (texto puro). O conteudo e renderizado com `dangerouslySetInnerHTML` na pagina de detalhes, mas o admin precisa digitar HTML manualmente. Precisamos adicionar uma barra de ferramentas de formatacao.

## Sobre o campo "Publicado"
O switch "Publicado" controla a visibilidade do artigo:
- **Desligado (Rascunho)**: somente admins podem ver o artigo
- **Ligado (Publicado)**: todos os membros da equipe podem ver

Vamos renomear o label para deixar mais claro: "Publicar para a equipe" com uma descricao auxiliar.

## Solucao: Toolbar de Formatacao Customizada

Em vez de adicionar uma biblioteca pesada de rich text editor, vamos criar um componente `RichTextEditor` com uma barra de ferramentas que insere tags HTML no textarea. Isso mantem o bundle leve e o conteudo ja e renderizado como HTML na pagina de detalhes.

### Funcionalidades da Toolbar
- **Negrito** (Bold)
- **Italico** (Italic)
- **Titulo** (H2, H3)
- **Lista com marcadores** (ul/li)
- **Lista numerada** (ol/li)
- **Link**
- **Separador horizontal** (hr)

### Componente: `src/components/baseConhecimento/RichTextEditor.tsx`

Um componente que encapsula o textarea com uma barra de botoes acima. Cada botao insere/envolve o texto selecionado com a tag HTML correspondente. O componente usa `useRef` para manipular a selecao do textarea (`selectionStart`, `selectionEnd`).

Interface:
```text
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}
```

### Alteracoes nos Sheets

**NovoArtigoSheet.tsx e EditarArtigoSheet.tsx:**
- Substituir o `<Textarea>` do campo "Conteudo" pelo novo `RichTextEditor`
- Integrar com `react-hook-form` usando `watch` + `setValue` ao inves de `register`
- Renomear o label do switch "Publicado" para "Publicar para a equipe" com texto auxiliar

### Preview em Tempo Real

Adicionar uma aba de pre-visualizacao ao lado da edicao usando `Tabs` do shadcn, com duas abas:
- **Editar**: mostra o editor com toolbar
- **Visualizar**: renderiza o HTML do conteudo no mesmo estilo da pagina de detalhes

## Detalhes Tecnicos

### Arquivos a criar
- `src/components/baseConhecimento/RichTextEditor.tsx` - Editor com toolbar

### Arquivos a modificar
- `src/components/baseConhecimento/NovoArtigoSheet.tsx` - Usar RichTextEditor e melhorar label do switch
- `src/components/baseConhecimento/EditarArtigoSheet.tsx` - Mesmas alteracoes

### Sequencia
1. Criar o componente `RichTextEditor` com toolbar de formatacao
2. Atualizar `NovoArtigoSheet` para usar o editor e melhorar UX do switch "Publicado"
3. Atualizar `EditarArtigoSheet` com as mesmas mudancas

