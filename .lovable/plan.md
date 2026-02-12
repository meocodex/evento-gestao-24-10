
## Plano de Correção de Erros de Build - Prioridade Crítica

### Problema Central
Existem **20+ erros de build** impedindo a compilação. Os principais causadores são:

1. **Type mismatches entre tipos Supabase gerados (Json) e tipos da aplicação**
2. **Casting inadequado de strings para tipos union específicos**
3. **Inserção de campos não permitidos pelo Supabase**
4. **RPC return types incorretos**

### Erros Agrupados por Causa

#### 1️⃣ **Categoria/Status como `string` vs Union Types** (5 erros)
- `useDemandasMutations.ts:116` - `categoria: string` não é `"administrativa" | "comercial" | ...`
- `useEventosFinanceiro.ts:155` - `categoria: string` não é `"alimentacao" | "insumos" | ...`
- `useEstoqueMutations.ts:145` - `s.status === 'em_uso'` vs `"consumido" | "disponivel" | "em-uso"` (underscore!)
- `useEstoqueMutations.ts:243` - Mesmo problema
- `useEstoqueMutations.ts:289` - Mesmo problema

**Solução:** Usar type casting explícito: `categoria as CategoriaFinanceira`

---

#### 2️⃣ **Campo `evento_id` não existente em tipos Supabase** (4 erros)
- `useEventosFinanceiro.ts:43` - Insert sem `evento_id` no tipo gerado
- `useEventosFinanceiro.ts:62` - Mesmo
- `useEventosFinanceiro.ts:128` - Mesmo
- `useEventosMateriaisAlocados.ts:82` - Mesmo

**Causa:** Supabase gerou tipos que não incluem `evento_id` como field opcional

**Solução:** Fazer cast `as unknown as` ou construir objeto com tipos expandidos

---

#### 3️⃣ **Material_id vs Fields no Insert** (2 erros)
- `useEstoqueMutations.ts:192` - Field `material_id` não permitido
- `useEventosMateriaisAlocados.ts:106` - Mesmo

**Solução:** Remover `material_id` da inserção (já é a PK/constraint)

---

#### 4️⃣ **RPC Return Type Mismatch** (2 erros)
- `useEstoqueMutations.ts:330` - RPC retorna `{quantidade_anterior, quantidade_nova}` mas código espera `{valor_anterior, valor_novo}`
- `useDemandasMutations.ts:342-343` - Insert em `demandas_reembolsos` (table não reconhecida)

**Solução:** Corrigir o tipo esperado do RPC

---

#### 5️⃣ **Json Type Incompatibility** (2 erros)
- `useEventosMateriaisAlocados.ts:487` - `{ nome, documento, telefone, endereco }` não é `Json`
- Vários em `useEventosMateriaisAlocados` com arrays

**Solução:** Converter para formato `Json` ou usar cast `as Json`

---

#### 6️⃣ **Test Files** (2 erros)
- `useEventosMutations.test.ts` - `useRealtimeHub` chamado sem argumentos
- `useEstoqueMutations.test.ts` - Mesmo

**Solução:** Adicionar argumentos nos mocks

---

### Plano de Implementação (em ordem de prioridade)

#### **Fase 1: Fix Critical Type Casts** (30 min)
1. **`useDemandasMutations.ts`** - Cast `categoria` como `CategoriaFinanceira`
2. **`useEventosFinanceiro.ts`** - Cast `categoria` e arrumar inserts com `evento_id`
3. **`useEstoqueMutations.ts`** - Corrigir comparação de status (`'em-uso'` vs `'em_uso'`)

#### **Fase 2: Fix Insert Data Issues** (20 min)
1. **`useEstoqueMutations.ts:192`** - Remover `material_id` do insert
2. **`useEventosMateriaisAlocados.ts:106`** - Remover `evento_id` do insert array (ou adicionar cast)
3. **`useEventosMateriaisAlocados.ts:487`** - Converter objeto para `Json`

#### **Fase 3: Fix RPC/Query Issues** (15 min)
1. **`useEstoqueMutations.ts:330`** - Corrigir tipo retornado do RPC `sincronizar_quantidade_disponivel`
2. **`useDemandasMutations.ts:342`** - Verificar se `demandas_reembolsos` existe ou usar tabela correta
3. **`useEstoqueSeriais.ts:53`** - Resolver ambiguidade de relacionamento

#### **Fase 4: Fix Test Files** (10 min)
1. **`useEventosMutations.test.ts`** - Adicionar mock args para `useRealtimeHub`
2. **`useEstoqueMutations.test.ts`** - Mesmo

---

### Arquivos a Modificar

```
Crítica (Build bloqueante):
✓ src/contexts/demandas/useDemandasMutations.ts (3 erros)
✓ src/contexts/estoque/useEstoqueMutations.ts (6 erros)
✓ src/contexts/eventos/useEventosFinanceiro.ts (4 erros)
✓ src/contexts/eventos/useEventosMateriaisAlocados.ts (3 erros)
✓ src/contexts/estoque/useEstoqueSeriais.ts (1 erro)
✓ src/contexts/eventos/__tests__/useEventosMutations.test.ts (2 erros)
✓ src/contexts/estoque/__tests__/useEstoqueMutations.test.ts (1 erro)

Total: 7 arquivos, ~20 erros
```

---

### Próximos Passos
Após aprovação deste plano, os erros serão corrigidos **antes** de prosseguirmos com a simplificação do módulo de contratos e a implementação da feature de anexação de contratos assinados.

