

# Base de Conhecimento - Area Informativa

## Objetivo
Criar um modulo completo de Base de Conhecimento onde administradores podem publicar tutoriais, guias e artigos informativos para os membros da equipe. O conteudo sera organizado por categorias e tags, com suporte a texto rico, links/videos, e anexos de arquivos.

## Estrutura do Banco de Dados

### Tabela: `base_conhecimento_categorias`
Armazena as categorias para organizar artigos (ex: Estoque, Eventos, Financeiro, Geral).

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid PK | Identificador unico |
| nome | text NOT NULL | Nome da categoria |
| descricao | text | Descricao opcional |
| icone | text | Emoji ou nome de icone |
| ordem | integer DEFAULT 0 | Ordem de exibicao |
| ativa | boolean DEFAULT true | Se esta ativa |
| created_at | timestamptz | Data de criacao |
| updated_at | timestamptz | Data de atualizacao |

### Tabela: `base_conhecimento_artigos`
Armazena os artigos/tutoriais publicados.

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid PK | Identificador unico |
| titulo | text NOT NULL | Titulo do artigo |
| conteudo | text NOT NULL | Conteudo em texto rico (HTML) |
| resumo | text | Resumo curto do artigo |
| categoria_id | uuid FK | Referencia a categoria |
| tags | text[] | Tags para busca |
| anexos | jsonb DEFAULT '[]' | Lista de arquivos anexados |
| links_externos | jsonb DEFAULT '[]' | Links e videos embutidos |
| publicado | boolean DEFAULT false | Se esta publicado |
| autor_id | uuid NOT NULL | Quem criou o artigo |
| autor_nome | text NOT NULL | Nome do autor |
| visualizacoes | integer DEFAULT 0 | Contador de visualizacoes |
| ordem | integer DEFAULT 0 | Ordem na categoria |
| created_at | timestamptz | Data de criacao |
| updated_at | timestamptz | Data de atualizacao |

### Politicas RLS

- **SELECT**: Todos os usuarios autenticados podem visualizar artigos publicados
- **INSERT/UPDATE/DELETE**: Apenas usuarios com `admin.full_access`
- Categorias seguem o mesmo padrao

### Storage Bucket
- Bucket `base-conhecimento` (privado) para upload de PDFs, imagens e documentos anexados aos artigos

## Frontend - Componentes

### 1. Pagina principal: `src/pages/BaseConhecimento.tsx`
- Barra de busca para filtrar artigos por titulo, conteudo ou tags
- Grid de categorias com contagem de artigos
- Lista de artigos recentes
- Filtro por categoria e tags

### 2. Pagina de artigo: `src/pages/ArtigoDetalhes.tsx`
- Titulo e metadados (autor, data, categoria, tags)
- Conteudo renderizado com formatacao
- Secao de links/videos embutidos (iframe do YouTube)
- Lista de anexos com download
- Navegacao entre artigos da mesma categoria

### 3. Componentes de gestao (admin):
- `NovoArtigoSheet.tsx` - Formulario para criar artigo com editor de texto rico, upload de anexos, adicao de links/videos
- `EditarArtigoSheet.tsx` - Edicao do artigo existente
- `GerenciarCategoriasSheet.tsx` - CRUD de categorias

### 4. Hooks e Queries:
- `src/contexts/baseConhecimento/useBaseConhecimentoQueries.ts` - Queries para listar artigos e categorias
- `src/contexts/baseConhecimento/useBaseConhecimentoMutations.ts` - Mutations para CRUD

## Navegacao

- Novo item no sidebar: **"Base de Conhecimento"** no grupo **"Gestao"**, com icone `BookOpen`
- Acessivel para todos os usuarios autenticados (visualizacao)
- Rota: `/base-conhecimento` e `/base-conhecimento/:id`

## Detalhes Tecnicos

### Query Keys
Adicionar ao `queryKeys.ts`:
```text
baseConhecimento: {
  categorias: ['base-conhecimento-categorias'],
  artigos: ['base-conhecimento-artigos'],
  artigo: (id: string) => ['base-conhecimento-artigo', id],
}
```

### Permissoes no Sidebar
- Todos os usuarios autenticados podem ver o menu (como Dashboard)
- Gestao de conteudo restrita a admins no frontend via `usePermissions`

### Editor de Texto
Utilizar `textarea` com suporte a Markdown simples ou HTML basico, sem dependencia extra de bibliotecas de rich text editor para manter o bundle leve.

## Sequencia de Implementacao

1. Criar migracao SQL (tabelas, RLS, bucket de storage)
2. Adicionar query keys e tipos TypeScript
3. Criar hooks de queries e mutations
4. Criar pagina principal da Base de Conhecimento
5. Criar pagina de detalhes do artigo
6. Criar componentes de gestao (sheets para CRUD)
7. Adicionar rota e item no sidebar
