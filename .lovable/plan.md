
# Analise de Bugs e Erros no Sistema

## Bugs Encontrados

### BUG 1 (CRITICO): NovaContaReceberSheet - onChange sobrescreve react-hook-form
**Arquivo:** `src/components/financeiro/NovaContaReceberSheet.tsx` (linhas 116, 128)

O mesmo bug que foi corrigido em `NovaContaPagarSheet` ainda existe aqui. Os inputs de `quantidade` e `valor_unitario` usam `{...register(...)}` junto com um `onChange` customizado que sobrescreve o onChange do react-hook-form. Resultado: o valor digitado nunca chega ao form state, fazendo a validacao Zod falhar silenciosamente (valor_unitario fica 0, rejeitado pelo `.positive()`).

**Correcao:** Remover os estados locais `quantidade` e `valorUnitario`, remover os `onChange` customizados, e usar `watch()` para calcular o valor total (identico ao fix aplicado em NovaContaPagarSheet).

---

### BUG 2 (CRITICO): EditarContaPagarSheet - Mesmo bug de onChange
**Arquivo:** `src/components/financeiro/EditarContaPagarSheet.tsx` (linhas 140, 152)

Identico ao bug anterior. Os inputs de `quantidade` e `valor_unitario` usam `onChange` customizado que sobrescreve o `register()`. Ao editar uma conta, o valor que o usuario digita nao chega ao react-hook-form, causando falha na validacao ou envio de valores errados.

**Correcao:** Remover estados locais, remover onChange customizados, usar `watch()` para calcular valorTotal. Manter o `useEffect` de reset mas sem atualizar estados locais.

---

### BUG 3 (CRITICO): EditarContaReceberSheet - Mesmo bug de onChange
**Arquivo:** `src/components/financeiro/EditarContaReceberSheet.tsx` (linhas 144, 156)

Identico ao anterior. Mesmo padrao de `onChange` sobrescrevendo o `register()`.

**Correcao:** Identica as demais - remover estados locais, usar `watch()`.

---

### BUG 4 (MEDIO): Categorias - `.single()` em toggleCategoria, editarCategoria, excluirCategoria
**Arquivo:** `src/contexts/categorias/useCategoriasMutations.ts` (linhas 111, 147, 183)

As mutations `toggleCategoria`, `editarCategoria` e `excluirCategoria` usam `.single()` na query de SELECT. Se a linha nao existir (ex: usuario nunca criou categorias daquele tipo), o `.single()` lanca um erro ao inves de retornar null. Deveria usar `.maybeSingle()` com tratamento para quando nao encontra dados.

**Correcao:** Trocar `.single()` por `.maybeSingle()` e adicionar verificacao de nulidade antes de prosseguir.

---

## Resumo das Correcoes

| # | Arquivo | Bug | Severidade |
|---|---------|-----|------------|
| 1 | NovaContaReceberSheet.tsx | onChange sobrescreve register() | Critico |
| 2 | EditarContaPagarSheet.tsx | onChange sobrescreve register() | Critico |
| 3 | EditarContaReceberSheet.tsx | onChange sobrescreve register() | Critico |
| 4 | useCategoriasMutations.ts | .single() pode falhar sem dados | Medio |

## Detalhes Tecnicos

### Para bugs 1-3 (formularios financeiros):

Padrao de correcao (aplicar em cada arquivo):

```text
REMOVER:
  const [quantidade, setQuantidade] = useState(...);
  const [valorUnitario, setValorUnitario] = useState(...);
  
  onChange={(e) => setQuantidade(...)}
  onChange={(e) => setValorUnitario(...)}

ADICIONAR:
  const watchedQuantidade = watch('quantidade') || 0;
  const watchedValorUnitario = watch('valor_unitario') || 0;
  const valorTotal = watchedQuantidade * watchedValorUnitario;
```

Para `EditarContaPagarSheet` e `EditarContaReceberSheet`, tambem remover `setQuantidade(...)` e `setValorUnitario(...)` do `useEffect`.

### Para bug 4 (categorias):

Trocar `.single()` por `.maybeSingle()` nas linhas 111, 147 e 183, e adicionar guard clause:

```text
if (!config) throw new Error('Configuracao de categorias nao encontrada');
```

## Sequencia de Implementacao

1. Corrigir NovaContaReceberSheet.tsx (bug 1)
2. Corrigir EditarContaPagarSheet.tsx (bug 2)
3. Corrigir EditarContaReceberSheet.tsx (bug 3)
4. Corrigir useCategoriasMutations.ts (bug 4)
