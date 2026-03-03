

# Fechamento de Evento com Integracao ao Financeiro Geral

## Objetivo
Quando o usuario fizer o fechamento de um evento, o sistema deve oferecer duas opcoes: **Imprimir Fechamento** (apenas gera o PDF como hoje) e **Fechar Evento** (gera PDF + fecha o evento + lanca receitas/despesas no financeiro geral).

## Situacao Atual
- O botao flutuante "Fechamento (X itens)" aparece quando ha itens selecionados em eventos finalizados
- Ele abre o `RelatorioFechamentoDialog` que apenas gera um PDF e faz download
- As receitas/despesas do evento ficam **isoladas** nas tabelas `eventos_receitas` e `eventos_despesas`, sem reflexo no financeiro geral (`contas_receber` e `contas_pagar`)
- Nao ha integracao entre o fechamento do evento e a mudanca de status para arquivado

## Mudancas Propostas

### 1. Alterar o botao flutuante em `FinanceiroEvento.tsx`
- Substituir o botao unico "Fechamento" por um **dropdown com duas opcoes**:
  - **Imprimir Fechamento**: comportamento atual (abre o dialog e gera PDF)
  - **Fechar Evento**: abre um novo dialog de confirmacao que executa as 3 acoes

### 2. Criar componente `FecharEventoDialog.tsx`
Novo dialog em `src/components/eventos/modals/FecharEventoDialog.tsx` que:
- Mostra resumo financeiro (receitas, despesas, saldo)
- Exibe checklist do que sera feito:
  - Gerar PDF do fechamento
  - Lancar receitas selecionadas como **Contas a Receber** no financeiro geral
  - Lancar despesas selecionadas como **Contas a Pagar** no financeiro geral
  - Arquivar o evento (mudar status para `arquivado`)
- Botao "Confirmar Fechamento" que executa tudo em sequencia

### 3. Criar hook `useFecharEvento.ts`
Novo hook em `src/hooks/eventos/useFecharEvento.ts` com a logica de:
- **Contabilizar receitas no financeiro geral**: para cada receita selecionada do evento, inserir um registro em `contas_receber` com:
  - `descricao`: `[Nome do Evento] - [Descricao da receita]`
  - `tipo`: mapeamento do tipo da receita (venda/locacao/servico/outros)
  - `valor`, `valor_unitario`, `quantidade`: valores da receita
  - `data_vencimento`: data da receita
  - `status`: se ja esta como "recebido" no evento, manter; senao "pendente"
  - `cliente`: nome do cliente do evento
  - `recorrencia`: 'unico'
  - `observacoes`: `Fechamento do evento: [nome]`
- **Contabilizar despesas no financeiro geral**: para cada despesa selecionada do evento, inserir um registro em `contas_pagar` com:
  - `descricao`: `[Nome do Evento] - [Descricao da despesa]`
  - `categoria`: categoria da despesa
  - `valor`, `valor_unitario`, `quantidade`: valores da despesa
  - `data_vencimento`: data da despesa
  - `status`: se ja esta como "pago" no evento, manter; senao "pendente"
  - `fornecedor`: responsavel da despesa
  - `recorrencia`: 'unico'
  - `observacoes`: `Fechamento do evento: [nome]`
- **Gerar PDF**: reutilizar a logica existente do `RelatorioFechamentoDialog`
- **Arquivar evento**: chamar `supabase.from('eventos').update({ arquivado: true })`
- **Invalidar queries**: `contas-pagar`, `contas-receber`, `eventos`, `evento-detalhes`

### 4. Adicionar colunas de rastreabilidade (migracao DB)
Adicionar coluna `evento_id` nas tabelas `contas_pagar` e `contas_receber` para rastrear a origem:
- `evento_id UUID REFERENCES eventos(id) ON DELETE SET NULL` (nullable, pois nem toda conta vem de evento)

Isso permite:
- Evitar duplicacao (verificar se ja foi contabilizado)
- Filtrar contas por evento no financeiro geral
- Rastreabilidade completa

### 5. Atualizar `FinanceiroEvento.tsx`
- Trocar o botao flutuante por um dropdown com as duas opcoes
- Passar os dados necessarios para ambos os dialogs
- Adicionar indicador visual se o evento ja foi contabilizado no financeiro geral

## Mapeamento de Dados

```text
eventos_receitas -> contas_receber
  descricao     -> descricao (prefixado com nome do evento)
  tipo          -> tipo (venda/locacao/servico/outros)
  valor         -> valor
  valor_unitario-> valor_unitario
  quantidade    -> quantidade
  data          -> data_vencimento
  status        -> status (pendente/recebido mapeado)
  evento.cliente-> cliente

eventos_despesas -> contas_pagar
  descricao      -> descricao (prefixado com nome do evento)
  categoria      -> categoria
  valor          -> valor
  valor_unitario -> valor_unitario
  quantidade     -> quantidade
  data           -> data_vencimento
  status         -> status (pendente/pago mapeado)
  responsavel    -> fornecedor
```

## Arquivos Modificados/Criados

| Arquivo | Acao |
|---------|------|
| `src/components/eventos/secoes/FinanceiroEvento.tsx` | Dropdown com 2 opcoes no botao flutuante |
| `src/components/eventos/modals/FecharEventoDialog.tsx` | Novo dialog de fechamento completo |
| `src/hooks/eventos/useFecharEvento.ts` | Novo hook com logica de contabilizacao |
| `src/hooks/eventos/index.ts` | Exportar novo hook |
| Migracao SQL | Adicionar `evento_id` em `contas_pagar` e `contas_receber` |

## Fluxo do Usuario

1. Evento esta finalizado
2. Usuario seleciona receitas e despesas na aba Financeiro
3. Botao flutuante aparece com dropdown:
   - "Imprimir Fechamento" -> gera PDF (comportamento atual)
   - "Fechar Evento" -> abre dialog de confirmacao
4. No dialog de fechamento:
   - Ve resumo financeiro
   - Ve checklist das acoes que serao executadas
   - Clica "Confirmar Fechamento"
5. Sistema executa:
   - Gera e baixa o PDF
   - Insere receitas em `contas_receber`
   - Insere despesas em `contas_pagar`
   - Arquiva o evento
   - Exibe toast de sucesso
6. Evento muda para status "arquivado"
7. No modulo Financeiro geral, as contas aparecem com referencia ao evento

