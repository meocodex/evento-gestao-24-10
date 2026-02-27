

# Corrigir Sincronização de Categorias Entre Usuários

## Problema
Quando o Usuário A cria uma nova categoria, o Usuário B não a vê porque:
1. O cache do React Query é persistido no localStorage com `staleTime` de 5 minutos
2. Não existe listener de tempo real (Realtime) para invalidar o cache quando categorias mudam

## Solução
Adicionar listeners Realtime nas tabelas de categorias para que mudanças feitas por qualquer usuário invalidem automaticamente o cache de todos os outros usuários conectados.

## Alterações

### 1. Habilitar Realtime nas tabelas (Migração SQL)
```text
ALTER PUBLICATION supabase_realtime ADD TABLE public.configuracoes_categorias;
ALTER PUBLICATION supabase_realtime ADD TABLE public.base_conhecimento_categorias;
```

### 2. Adicionar listener Realtime em `useCategoriasQueries.ts`
- Adicionar `useEffect` com subscription no canal `configuracoes_categorias`
- Quando receber evento `postgres_changes` (INSERT, UPDATE, DELETE), invalidar a query key `queryKeys.configuracoes.categorias`
- Reduzir `staleTime` para 1 minuto (o Realtime cuida da invalidação)
- Cleanup da subscription no return do useEffect

### 3. Adicionar listener Realtime em `useBaseConhecimentoQueries.ts`
- Mesmo padrão: subscription no canal `base_conhecimento_categorias`
- Invalidar `queryKeys.baseConhecimento.categorias` e a query `['base-conhecimento-categorias', 'todas']`

### Arquivos a modificar
- `src/contexts/categorias/useCategoriasQueries.ts` — adicionar Realtime listener
- `src/contexts/baseConhecimento/useBaseConhecimentoQueries.ts` — adicionar Realtime listener

### Arquivos a criar
- Migração SQL para habilitar Realtime nas tabelas

### Detalhes técnicos
Os listeners usarão `useEffect` com cleanup, importando `useQueryClient` do TanStack Query para chamar `invalidateQueries` quando receberem mudanças. Isso segue o padrão já existente no sistema para outras tabelas (profiles, user_roles, etc.).
