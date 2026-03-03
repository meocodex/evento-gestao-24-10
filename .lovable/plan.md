

# Indicador Visual de Evento Já Contabilizado

## Objetivo
Mostrar na aba Financeiro do evento se ele já foi contabilizado no financeiro geral, e impedir tentativas duplicadas desabilitando a opção "Fechar Evento".

## Abordagem

### 1. Criar hook `useEventoContabilizado`
Arquivo: `src/hooks/eventos/useEventoContabilizado.ts`

- Query simples que verifica se existem registros em `contas_receber` ou `contas_pagar` com `evento_id` igual ao do evento
- Retorna `{ jaContabilizado: boolean, isLoading: boolean }`
- Query key: `['evento-contabilizado', eventoId]`

### 2. Adicionar banner visual em `FinanceiroEvento.tsx`
- Quando `jaContabilizado === true`, exibir um card/banner no topo com ícone de check e texto: **"Este evento já foi contabilizado no financeiro geral"** com estilo verde/success
- Desabilitar a opção "Fechar Evento" no dropdown flutuante (manter "Imprimir Fechamento" habilitado)
- Opcionalmente esconder os checkboxes de seleção se já contabilizado

### 3. Exportar novo hook
Arquivo: `src/hooks/eventos/index.ts` — adicionar export

## Arquivos

| Arquivo | Ação |
|---------|------|
| `src/hooks/eventos/useEventoContabilizado.ts` | Novo - query de verificação |
| `src/hooks/eventos/index.ts` | Adicionar export |
| `src/components/eventos/secoes/FinanceiroEvento.tsx` | Banner + desabilitar "Fechar Evento" |

## Detalhes técnicos

O hook fará:
```typescript
const { data } = await supabase
  .from('contas_receber')
  .select('id')
  .eq('evento_id', eventoId)
  .limit(1);
return data && data.length > 0;
```

O banner usará as classes de success existentes no projeto (`bg-green-500/10 border-green-500/50 text-green-700`), com ícone `CheckCircle` do lucide-react.

No dropdown, o item "Fechar Evento" receberá `disabled={jaContabilizado}` com tooltip explicativo.

