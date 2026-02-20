

## Melhorias no Modulo Financeiro

### 1. Dialogs "Marcar como Pago/Recebido" - Adicionar comprovante e observacoes

Atualmente os dialogs `MarcarPagoDialog` e `MarcarRecebidoDialog` so pedem data e forma de pagamento. Vamos adicionar:

- **Upload de comprovante** (reutilizando `AnexosUpload` ja existente)
- **Campo de observacoes/nota** sobre o pagamento
- Os hooks `useContasPagar.marcarComoPago` e `useContasReceber.marcarComoRecebido` serao atualizados para salvar `observacoes` e `anexos` junto com o pagamento

**Arquivos alterados:**
- `src/components/financeiro/MarcarPagoDialog.tsx` - adicionar campos de anexo e observacoes
- `src/components/financeiro/MarcarRecebidoDialog.tsx` - idem
- `src/hooks/financeiro/useContasPagar.ts` - mutation `marcarComoPago` envia observacoes e anexos
- `src/hooks/financeiro/useContasReceber.ts` - mutation `marcarComoRecebido` envia observacoes e anexos

---

### 2. Corrigir sistema de recorrencia

**Problema atual:** A proxima fatura e gerada com base na `data_vencimento` da fatura paga. Se a fatura 1 vence dia 05/10 mas foi paga dia 15/10, a proxima e gerada para 05/11 (correto). Porem, as faturas so sao geradas quando a anterior e paga.

**Comportamento desejado:**
- Faturas recorrentes devem ser geradas automaticamente mes a mes, independente de pagamento
- A data de vencimento deve sempre seguir o padrao original (dia 5, dia 10, etc.)
- So param de ser geradas se o operador cancelar a conta
- Contas vencidas devem ser marcadas como "em atraso"

**Solucao:**
- Alterar os triggers `gerar_proxima_recorrencia_pagar` e `gerar_proxima_recorrencia_receber` para gerar a proxima fatura baseada na data de vencimento original (nao na data de pagamento)
- Criar uma edge function `gerar-recorrencias-financeiro` que roda periodicamente (via cron) e gera faturas pendentes para contas recorrentes que ainda nao foram canceladas
- Alterar a funcao `marcar_contas_vencidas()` para funcionar com o cron tambem

**Migracao SQL:**
- Reescrever trigger `gerar_proxima_recorrencia_pagar` - gerar proxima fatura sempre pela data_vencimento original
- Reescrever trigger `gerar_proxima_recorrencia_receber` - idem
- Adicionar coluna `observacoes_pagamento` em `contas_pagar` e `contas_receber` para salvar nota do pagamento
- Adicionar coluna `comprovante_pagamento` em `contas_pagar` e `contas_receber` para URL do comprovante

---

### 3. Visual melhorado na lista - botao pagar e status "em atraso"

**Contas vencidas:** O botao "Marcar como Pago" tambem deve aparecer para contas com status `vencido` (nao apenas `pendente`). Destacar visualmente linhas vencidas com cor de fundo sutil vermelha e badge "Em Atraso".

**Botao pagar mais visivel:** Trocar de icone ghost para um botao com texto "Pagar" com cor verde para contas pendentes/vencidas.

**Arquivos alterados:**
- `src/components/financeiro/TabelaContasPagar.tsx` - mostrar botao pagar para vencidos, melhorar visual
- `src/components/financeiro/TabelaContasReceber.tsx` - idem para "Receber"

---

### 4. Multiplos anexos ao criar conta + label do tipo

O componente `AnexosUpload` ja suporta multiplos arquivos. Porem, nao ha campo para descrever o que e cada anexo (ex: "comprovante de pagamento", "nota fiscal").

**Solucao:** Adicionar campo opcional de descricao/label em cada anexo no tipo `AnexoFinanceiro`.

**Arquivos alterados:**
- `src/types/financeiro.ts` - adicionar campo `descricao` em `AnexoFinanceiro`
- `src/components/financeiro/AnexosUpload.tsx` - adicionar input de descricao por anexo

---

### Resumo tecnico

| Acao | Tipo |
|---|---|
| Migracoes SQL (colunas + triggers) | Banco de dados |
| `MarcarPagoDialog.tsx` / `MarcarRecebidoDialog.tsx` | Frontend - adicionar campos |
| `useContasPagar.ts` / `useContasReceber.ts` | Hooks - atualizar mutations |
| `TabelaContasPagar.tsx` / `TabelaContasReceber.tsx` | Frontend - visual melhorado |
| `AnexosUpload.tsx` | Frontend - descricao por anexo |
| `src/types/financeiro.ts` | Tipos - novo campo descricao |

