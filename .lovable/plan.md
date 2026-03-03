
# Receitas e Despesas entram como Pagas/Recebidas no Fechamento

## Problema
Atualmente, ao fechar o evento, o status das receitas e despesas no financeiro geral depende do status original no evento. Se uma receita estava "pendente" no evento, ela entra como "pendente" no financeiro geral. O correto e que **todas** entrem como ja liquidadas.

## Mudanca

Arquivo: `src/hooks/eventos/useFecharEvento.ts`

- **Receitas** (contas a receber): status sempre `'recebido'`, com `data_recebimento` preenchida com a data atual e `forma_recebimento` definida como `'Transferencia'` (valor padrao)
- **Despesas** (contas a pagar): status sempre `'pago'`, com `data_pagamento` preenchida com a data atual e `forma_pagamento` definida como `'Transferencia'` (valor padrao)

### Detalhes tecnicos

Linha 41 muda de:
```
status: receita.status === 'pago' ? 'recebido' : 'pendente',
```
Para:
```
status: 'recebido',
data_recebimento: new Date().toISOString().split('T')[0],
forma_recebimento: 'Transferencia',
```

Linha 64 muda de:
```
status: despesa.status === 'pago' ? 'pago' : 'pendente',
```
Para:
```
status: 'pago',
data_pagamento: new Date().toISOString().split('T')[0],
forma_pagamento: 'Transferencia',
```

Apenas 1 arquivo sera modificado: `src/hooks/eventos/useFecharEvento.ts`
