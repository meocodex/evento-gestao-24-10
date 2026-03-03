

# Eventos Arquivados Nao Aparecem

## Causa raiz

O problema esta no hook `useEventosQueries.ts`. A query ao banco de dados aplica filtros fixos:

```typescript
.eq('arquivado', false)
.neq('status', 'cancelado')
```

Isso significa que eventos arquivados **nunca sao buscados do banco**, independentemente do filtro `incluirArquivados` estar ativo no frontend. O filtro no `Eventos.tsx` (linha 61) e inutil porque os dados ja chegam sem os arquivados.

## Solucao

### 1. Passar o filtro `incluirArquivados` para o hook de query

- Modificar `useEventosQueries.ts` para receber um parametro `incluirArquivados`
- Quando `true`, remover o `.eq('arquivado', false)` da query
- Adicionar `incluirArquivados` na query key para invalidar cache corretamente

### 2. Propagar o parametro desde `Eventos.tsx`

- Passar `filters.incluirArquivados` para o hook `useEventos`
- O hook intermediario (`src/hooks/eventos/index.ts` ou similar) deve repassar ao `useEventosQueries`

### Arquivos a modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/contexts/eventos/useEventosQueries.ts` | Adicionar param `incluirArquivados`, condicionar `.eq('arquivado', false)` |
| Hook intermediario (`useEventos`) | Repassar parametro |
| `src/pages/Eventos.tsx` | Passar `filters.incluirArquivados` ao hook |

### Detalhe tecnico

No `useEventosQueries.ts`, a query condicional ficaria:

```typescript
let query = supabase.from('eventos').select(...)
  .neq('status', 'cancelado')
  .order('data_inicio', { ascending: false })
  .range(from, to);

if (!incluirArquivados) {
  query = query.eq('arquivado', false);
}
```

E a query key incluiria o novo parametro:
```typescript
queryKey: ['eventos', page, pageSize, debouncedSearchTerm, incluirArquivados]
```

