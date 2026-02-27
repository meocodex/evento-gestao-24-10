

# Corrigir erro ao criar nova conta a pagar

## Problema Identificado

Dois bugs no formulario `NovaContaPagarSheet.tsx`:

### Bug 1: Data vazia enviada ao banco (ERRO PRINCIPAL)
O erro no banco e `invalid input syntax for type date: ""`. Quando o usuario nao preenche a data de vencimento ou deixa o campo vazio, o valor `""` (string vazia) e enviado ao Supabase, que rejeita por nao ser uma data valida. O schema Zod deveria capturar isso, mas o `register('data_vencimento')` envia string vazia que passa pelo refine.

### Bug 2: onChange sobrescrito nos campos numericos
Os inputs de `quantidade` e `valor_unitario` usam `{...register(...)}` junto com um `onChange` customizado que SOBRESCREVE o onChange do react-hook-form. Resultado: o react-hook-form nunca recebe os valores digitados, mantendo os defaults (quantidade=1, valor_unitario=undefined/0). A validacao Zod de `valor_unitario > 0` falha silenciosamente.

## Correcoes

### Arquivo: `src/components/financeiro/NovaContaPagarSheet.tsx`

1. **Campos numericos**: Remover o `onChange` customizado e usar `watch()` do react-hook-form para calcular o valor total, eliminando os estados locais `quantidade` e `valorUnitario`.

2. **Calculo do valor total**: Usar os valores do react-hook-form via `watch('quantidade')` e `watch('valor_unitario')` para calcular `valorTotal` de forma reativa.

### Arquivo: `src/lib/validations/financeiro.ts`

3. **Validacao da data**: Reforcar a validacao de `data_vencimento` para rejeitar strings vazias antes do refine (adicionar `.min(1, 'Data de vencimento e obrigatoria')` antes do `.refine`).

## Resumo das mudancas

- `src/components/financeiro/NovaContaPagarSheet.tsx`: Remover estados locais `quantidade`/`valorUnitario`, remover `onChange` customizados dos inputs numericos, usar `watch` para calcular valor total
- `src/lib/validations/financeiro.ts`: Adicionar `.min(1)` nos campos de data para rejeitar strings vazias

