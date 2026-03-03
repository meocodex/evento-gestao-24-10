

# Padronizar Formulario Interno com o Publico

## Problema
O formulario interno (`NovoEventoSheet`) nao possui o campo `tipoEvento`, que e `NOT NULL` na tabela `eventos`. A mutation faz fallback para `'bar'` silenciosamente (linha 28: `tipo_evento: data.tipoEvento || 'bar'`). Alem disso, o campo Estado usa input livre em vez de Select com UFs.

## Mudancas

### 1. `src/components/eventos/NovoEventoSheet.tsx`

- **Adicionar campo Tipo de Evento** (Select com opcoes: Ingresso, Bar, Hibrido) -- obrigatorio, posicionado antes do nome
- **Trocar Estado** de Input livre para Select com lista de UFs (importar `estados` de `@/lib/validations/cliente`)
- **Adicionar state** `tipoEvento` com `useState<string>('')`
- **Incluir `tipoEvento`** no payload do `criarEvento.mutateAsync()`
- **Validacao**: bloquear submit se `tipoEvento` estiver vazio

Todos os demais campos permanecem como estao (opcionais onde ja sao opcionais). Nenhuma imagem e obrigatoria no formulario interno.

### Arquivos

| Arquivo | Mudanca |
|---------|---------|
| `src/components/eventos/NovoEventoSheet.tsx` | Adicionar Select tipo_evento + Select UF para estado |

