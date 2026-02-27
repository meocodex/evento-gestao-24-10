
# Corrigir serial sendo cadastrado no material errado

## Problema

No componente `NovoSerialSheet.tsx`, o `materialId` e passado como `defaultValues` do `useForm`. O React Hook Form so aplica `defaultValues` na primeira montagem do componente. Quando o usuario abre o sheet para um material (ex: "Stone") e depois abre para outro (ex: "PagBank"), o `materialId` interno do formulario continua com o valor antigo.

Alem disso, o `form.reset()` na linha 60 reseta para os `defaultValues` originais, nao para o `materialId` atual.

## Correcao

### Arquivo: `src/components/estoque/NovoSerialSheet.tsx`

1. Adicionar um `useEffect` que faz `form.reset()` com o `materialId` atualizado sempre que o sheet abre ou o `materialId` muda:

```text
useEffect(() => {
  if (open) {
    form.reset({
      materialId,
      serial: '',
      localizacao: 'Empresa',
      tags: [],
      observacoes: '',
      status: 'disponivel',
    });
  }
}, [materialId, open]);
```

2. No `onSubmit`, trocar `form.reset()` por `form.reset()` com os valores corretos, ou simplesmente fechar o sheet (o useEffect cuidara do reset na proxima abertura).

## Verificacao adicional

O mesmo padrao pode existir em `EditarSerialSheet.tsx`. Vou verificar se tambem precisa de correcao.

## Resumo

| Arquivo | Mudanca |
|---------|---------|
| NovoSerialSheet.tsx | Adicionar useEffect para sincronizar materialId quando sheet abre |

