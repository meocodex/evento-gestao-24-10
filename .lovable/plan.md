

# Novos Bugs e Erros Encontrados no Sistema

## BUG 1 (CRITICO): NovoMaterialSheet - Categoria salva o label ao inves do value
**Arquivo:** `src/components/estoque/NovoMaterialSheet.tsx` (linha 128)

O `SelectItem` para categoria usa `value={cat.label}` ao inves de `value={cat.value}`. Isso significa que o banco armazena o texto de exibicao (ex: "Iluminacao") ao inves do identificador normalizado (ex: "iluminacao"). Se alguem editar o nome de uma categoria, todos os materiais que usavam aquele nome perdem a associacao.

**Correcao:** Trocar `value={cat.label}` por `value={cat.value}` na linha 128.

---

## BUG 2 (MEDIO): NovaDemandaSheet - mutateAsync sem await
**Arquivo:** `src/components/demandas/NovaDemandaSheet.tsx` (linha 71)

O `criarDemanda.mutateAsync({...})` e chamado **sem** `await`. O toast de sucesso (linha 86) e o reset do formulario (linha 91) executam imediatamente, antes da mutation completar. Se a mutation falhar, o catch nunca captura o erro porque a Promise nao e awaited. Resultado: o formulario fecha e mostra "sucesso" mesmo quando a criacao falha.

**Correcao:** Adicionar `await` antes de `criarDemanda.mutateAsync(...)` e mover o toast/reset para dentro do `.then()` ou apos o await.

---

## BUG 3 (MEDIO): FinanceiroEvento carrega TODAS as demandas desnecessariamente
**Arquivo:** `src/components/eventos/secoes/FinanceiroEvento.tsx` (linha 27)

O componente usa `useDemandas(1, 1000)` para buscar ate 1000 demandas, apenas para filtrar reembolsos de um evento especifico. Ja existe o hook `useDemandasReembolso` (`src/hooks/demandas/useDemandasReembolso.ts`) que busca apenas demandas de reembolso de forma eficiente. Alem do problema de performance, se houver mais de 1000 demandas no sistema, os reembolsos podem nao aparecer (limite do Supabase).

**Correcao:** Substituir `useDemandas(1, 1000)` por `useDemandasReembolso()` e filtrar por `eventoRelacionado === evento.id`.

---

## BUG 4 (MEDIO): useEventosMateriaisAlocados - .single() em configuracoes_usuario
**Arquivo:** `src/contexts/eventos/useEventosMateriaisAlocados.ts` (linhas 402-406)

Na geracao de declaracao de transporte, o codigo usa `.single()` para buscar `configuracoes_usuario`. Se o usuario nao tiver configuracoes salvas, o `.single()` lanca erro e a geracao de documento falha completamente.

**Correcao:** Trocar `.single()` por `.maybeSingle()` e usar valores default quando config for null.

---

## BUG 5 (BAIXO): console.error em codigo de producao
**Arquivos:**
- `src/contexts/demandas/useDemandasReembolsos.ts` (linhas 60, 110, 164, 206)
- `src/components/transportadoras/NovoEnvioSheet.tsx` (linha 207)
- `src/components/equipe/ConcederAcessoSistemaSheet.tsx` (linha 189)

Conforme regras do projeto, `console.error` nao deve existir em codigo de producao. Estes logs expoe detalhes internos no console do navegador.

**Correcao:** Remover todos os `console.error` destes arquivos.

---

## Resumo

| # | Arquivo | Bug | Severidade |
|---|---------|-----|------------|
| 1 | NovoMaterialSheet.tsx | cat.label ao inves de cat.value no Select | Critico |
| 2 | NovaDemandaSheet.tsx | mutateAsync sem await | Medio |
| 3 | FinanceiroEvento.tsx | useDemandas(1, 1000) ineficiente | Medio |
| 4 | useEventosMateriaisAlocados.ts | .single() em configuracoes_usuario | Medio |
| 5 | Varios arquivos | console.error em producao | Baixo |

## Detalhes Tecnicos

### Bug 1 (NovoMaterialSheet):
```text
ANTES: <SelectItem key={cat.value} value={cat.label}>
DEPOIS: <SelectItem key={cat.value} value={cat.value}>
```

### Bug 2 (NovaDemandaSheet):
Reestruturar o handleSubmit para usar async/await corretamente, movendo toast e reset para apos o await.

### Bug 3 (FinanceiroEvento):
```text
ANTES: const { demandas } = useDemandas(1, 1000);
DEPOIS: const { data: demandas = [] } = useDemandasReembolso();
```
E filtrar: `demandas.filter(d => d.eventoRelacionado === evento.id)`

### Bug 4 (useEventosMateriaisAlocados):
Trocar `.single()` por `.maybeSingle()` na linha 406 e adicionar fallback para valores default da empresa.

### Bug 5 (console.error):
Remover todas as chamadas `console.error(...)` dos arquivos listados.

## Sequencia de Implementacao

1. Corrigir NovoMaterialSheet.tsx (bug 1 - mais critico, dados corrompidos)
2. Corrigir NovaDemandaSheet.tsx (bug 2 - UX enganosa)
3. Corrigir FinanceiroEvento.tsx (bug 3 - performance)
4. Corrigir useEventosMateriaisAlocados.ts (bug 4 - crash potencial)
5. Remover console.error (bug 5 - higiene de codigo)

