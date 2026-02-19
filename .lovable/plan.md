

## Correções e Melhorias na Aba Documentos

### 1. Bug Critico: Check Constraint bloqueia upload

O upload falha com o erro `violates check constraint "eventos_contratos_tipo_check"` porque o insert usa `tipo: 'documento'`, mas a constraint so permite `'bar', 'ingresso', 'bar_ingresso', 'credenciamento'`.

**Correcao:** Migração SQL para adicionar `'documento'` ao check constraint.

```sql
ALTER TABLE eventos_contratos DROP CONSTRAINT eventos_contratos_tipo_check;
ALTER TABLE eventos_contratos ADD CONSTRAINT eventos_contratos_tipo_check 
  CHECK (tipo = ANY (ARRAY['bar','ingresso','bar_ingresso','credenciamento','documento']));
```

### 2. Exibir tamanho do arquivo na listagem

- Adicionar coluna `arquivo_tamanho` (integer, nullable) na tabela `eventos_contratos` via migração
- Salvar `arquivo.size` no insert do hook
- Exibir formatado (KB/MB) na listagem do componente
- Atualizar o tipo `DocumentoEvento` com campo `arquivoTamanho`

### 3. Upload de multiplos arquivos

- Alterar o input de arquivo para aceitar `multiple`
- Adaptar o estado para `arquivos: File[]` ao inves de `arquivo: File | null`
- Ao submeter, enviar todos os arquivos sequencialmente com o mesmo titulo (ou titulo + indice)
- Mostrar quantidade de arquivos selecionados na area de upload

### 4. Confirmação antes de excluir

- Usar o `ConfirmDialog` existente em `src/components/shared/ConfirmDialog.tsx`
- Adicionar estado para controlar o dialog de confirmação e armazenar qual documento sera removido
- Ao clicar no botao de excluir, abrir o dialog; ao confirmar, executar a remocao

---

### Resumo de Mudanças

| Arquivo | Acao |
|---|---|
| Migração SQL | Alterar check constraint + adicionar coluna `arquivo_tamanho` |
| `src/types/evento-contratos.ts` | Adicionar campo `arquivoTamanho` |
| `src/hooks/useEventoContratos.ts` | Salvar tamanho no insert, selecionar coluna nova |
| `src/components/eventos/secoes/ContratosEvento.tsx` | Multiplos arquivos, exibir tamanho, dialog de confirmação |

