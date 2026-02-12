

## Plano de Correção - 30 Erros de Build Residuais

### Análise dos Erros

Os erros podem ser categorizados em 5 grupos principais:

#### **Grupo 1: Mock Functions sem Argumentos (3 erros)**
- `useEstoqueMutations.test.ts:598` - `.eq()` chamado sem argumentos
- `useEventosMutations.test.ts:500` - `.eq()` chamado sem argumentos  
- `useEventosMutations.test.ts:528` - `.eq()` chamado sem argumentos

**Causa:** Os mocks de Supabase foram corrigidos para exigir argumentos, mas alguns testes continuam chamando `.eq()` sem passar os parâmetros necessários.

**Solução:** Adicionar argumentos dummy aos `.eq()` nos mocks dos testes (ex: `.eq('id', 'test-id')`).

---

#### **Grupo 2: Import Faltando `Json` Type (1 erro)**
- `useNotifications.ts:65` - Tipo `Json` não importado mas é usado

**Causa:** Na linha 65, há um cast `as unknown as Json` mas o tipo `Json` não foi importado de `@/integrations/supabase/types`.

**Solução:** Adicionar import: `import { Json } from '@/integrations/supabase/types';`

---

#### **Grupo 3: Propriedades Faltando em Tipos de Query (12 erros)**
- `estoque-alocacao.test.ts:89, 90, 277` - Property `quantidade_disponivel` não existe
- `estoque-alocacao.test.ts:572, 576, 922, 924` - Property `status` não existe em seriais
- `evento-workflow.test.ts:576, 581` - Mesmo problema com seriais

**Causa:** Os tipos gerados pelo Supabase para `.select()` sem campos explícitos não incluem todas as colunas esperadas pelo código de teste.

**Solução:** Modificar as queries `.select()` para especificar explicitamente os campos necessários, ou adicionar type guard/null coalescing nos acessos.

---

#### **Grupo 4: Missing Required Fields em Inserts (6 erros)**
- `estoque-alocacao.test.ts:126` - Falta `tipo_envio` no insert
- `estoque-alocacao.test.ts:358` - Falta `tipo_envio` no insert
- `evento-workflow.test.ts:140` - Falta campos obrigatórios do Evento
- `evento-workflow.test.ts:182` - Falta campos obrigatórios
- `evento-workflow.test.ts:668` - Array incompleto para insert
- `crudResources.test.ts:86` - Field `nome` não existe

**Causa:** As definições de insert dos testes não incluem todos os campos obrigatórios do schema Supabase.

**Solução:** 
1. Para `eventos_materiais_alocados`: Adicionar `tipo_envio: 'antecipado'` ou `'com_tecnicos'`
2. Para `eventos`: Adicionar campos obrigatórios (`data_inicio`, `data_fim`, `hora_inicio`, `hora_fim`, `tipo_evento`)
3. Para materiais: Usar os nomes de campo corretos conforme schema

---

#### **Grupo 5: Type Cast e Status Invalidos (4 erros)**
- `evento-workflow.test.ts:190` - Status `'em_uso'` vs `'em-uso'` (underscore vs hífen)
- `evento-workflow.test.ts:220` - String não é `StatusEvento` válido
- `evento-workflow.test.ts:453` - String não é tipo timeline válido
- `crudResources.test.ts:144` - Field `titulo` não existe em demandas

**Causa:** Mistura de convenções snake_case (banco) vs camelCase/hífen (UI), e tipos enum restritos.

**Solução:**
1. Usar `'em-uso'` em vez de `'em_uso'` para status de materiais
2. Validar que todos os status de evento/timeline são valores do enum correto
3. Usar nomes de campo corretos conforme schema

---

#### **Grupo 6: Null Safety (2 erros)**
- `estoque-alocacao.test.ts:134, 135` - `alocacao` possivelmente null
- `evento-workflow.test.ts:185` - Mesmo

**Causa:** Queries retornam dados que podem ser nulos mas o código trata como não-nulos.

**Solução:** Adicionar verificação `if (alocacao)` ou usar `?.` optional chaining.

---

### Estratégia de Correção (por arquivo)

| Arquivo | Tipo | Ações |
|---------|------|-------|
| `useEstoqueMutations.test.ts` | Test | 1. Adicionar args a `.eq()` na linha 598 |
| `useEventosMutations.test.ts` | Test | 1. Adicionar args a `.eq()` nas linhas 500, 528 |
| `useNotifications.ts` | Hook | 1. Importar `Json` de `@/integrations/supabase/types` |
| `estoque-alocacao.test.ts` | Test | 1. Especificar campos explícitos em `.select()` 2. Adicionar `tipo_envio` em inserts 3. Adicionar null checks para alocacao |
| `evento-workflow.test.ts` | Test | 1. Corrigir status de materiais (`'em-uso'`) 2. Adicionar campos obrigatórios em evento insert 3. Validar tipos de status/timeline 4. Adicionar null checks |
| `crudResources.test.ts` | Test | 1. Usar nomes de campo corretos conforme schema 2. Adicionar todos campos obrigatórios |
| `eventosFlow.test.ts` | Test | 1. Adicionar campos obrigatórios em insert |

---

### Resumo de Mudanças

- **1 hook a corrigir** - Importar tipo `Json`
- **5 arquivos de teste a corrigir** - Adicionar campos obrigatórios, arrumar status, adicionar null checks
- **Total de mudanças:** ~30 pequenos ajustes espalhados em 6 arquivos

Esta é a última etapa de correção de build antes de poder prosseguir com a simplificação do módulo de contratos.

