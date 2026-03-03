

# Fix: Erro ao ativar "Incluir arquivados"

## Problema encontrado

Ao clicar em "Incluir arquivados", a pagina quebra com o erro:
```
A <Select.Item /> must have a value prop that is not an empty string.
```

**Causa**: Alguns eventos (provavelmente os arquivados) possuem o campo `cidade` vazio. O `availableCities` no `Eventos.tsx` nao filtra valores vazios, e o `SelectItem` do Radix nao aceita `value=""`.

## Correcao

**Arquivo**: `src/pages/Eventos.tsx`

Linha 49, alterar de:
```typescript
return Array.from(new Set(eventos.map(e => e.cidade)));
```
Para:
```typescript
return Array.from(new Set(eventos.map(e => e.cidade).filter(Boolean)));
```

Mesma correcao para `availableTags` na linha 53:
```typescript
return Array.from(new Set(eventos.flatMap(e => e.tags).filter(Boolean)));
```

Apenas 1 arquivo modificado com 2 linhas alteradas.

