
## Revisão: Aba Documentos do Evento

### Diagnóstico dos Problemas

#### Problema 1 — Storage sem RLS policies (bloqueio de upload/download)

O bucket `contratos` existe e é privado, mas não possui políticas de acesso configuradas em `storage.objects`. Isso significa que usuários autenticados **não conseguem fazer upload nem gerar URLs assinadas**, pois o storage bloqueia as operações por falta de permissão.

Erro esperado ao tentar fazer upload: `new row violates row-level security policy` ou `Unauthorized`.

#### Problema 2 — Chamada desnecessária ao `createSignedUrl` no upload

No hook `adicionarDocumento`, após o upload, o código gera uma signed URL de 1 ano (`createSignedUrl`) mas não usa o resultado — o banco armazena apenas o `path` do arquivo. Essa chamada extra falha se as policies não estiverem aplicadas e não agrega valor algum ao fluxo atual.

Trecho problemático (linha 63-67 do hook):
```typescript
// Esta chamada não é utilizada — o resultado signedData é descartado
const { data: signedData, error: signedError } = await supabase.storage
  .from('contratos')
  .createSignedUrl(path, 60 * 60 * 24 * 365);
if (signedError) throw signedError;
// signedData.signedUrl nunca é usado
```

#### Problema 3 — Registro legado no banco

Existe 1 registro antigo com `arquivo_assinado_url = null` (Contrato de Bar gerado pelo sistema anterior). A query já o filtra corretamente com `.not('arquivo_assinado_url', 'is', null)`, então não aparece na lista. Nenhuma ação necessária no código, mas o registro permanece no banco.

---

### Correções a Aplicar

#### Fase 1 — Migração: Adicionar RLS policies ao bucket `contratos`

Criar policies em `storage.objects` para o bucket `contratos` que permitem usuários autenticados fazer upload, download, leitura e remoção:

```sql
-- Policy: usuários autenticados podem fazer upload
CREATE POLICY "Authenticated users can upload contratos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'contratos');

-- Policy: usuários autenticados podem ver arquivos
CREATE POLICY "Authenticated users can view contratos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'contratos');

-- Policy: usuários autenticados podem deletar arquivos
CREATE POLICY "Authenticated users can delete contratos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'contratos');

-- Policy: usuários autenticados podem atualizar metadados
CREATE POLICY "Authenticated users can update contratos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'contratos');
```

#### Fase 2 — Remover chamada desnecessária ao `createSignedUrl` no upload

No `useEventoContratos.ts`, remover as linhas 63-67 que geram uma signed URL descartada após o upload. O path do arquivo já é salvo corretamente e o `getSignedUrl` é chamado sob demanda no momento do download.

Antes:
```typescript
const { error: uploadError } = await supabase.storage
  .from('contratos')
  .upload(path, arquivo, { upsert: false });

if (uploadError) throw uploadError;

// Remover estas linhas desnecessárias:
const { data: signedData, error: signedError } = await supabase.storage
  .from('contratos')
  .createSignedUrl(path, 60 * 60 * 24 * 365);

if (signedError) throw signedError;

const { error: insertError } = await supabaseAny ...
```

Depois:
```typescript
const { error: uploadError } = await supabase.storage
  .from('contratos')
  .upload(path, arquivo, { upsert: false });

if (uploadError) throw uploadError;

const { error: insertError } = await supabaseAny ...
```

---

### Resumo das Mudanças

| Ação | Detalhe |
|---|---|
| Migração SQL | 4 policies de storage no bucket `contratos` |
| Edição de código | Remover 5 linhas desnecessárias do hook |
| Sem alterações de UI | A interface `ContratosEvento.tsx` está correta |
| Sem migração de tabela | Estrutura do banco já está OK |

### Estado após a correção

- Upload de arquivos funcionará para usuários autenticados
- Download via signed URL (1 hora) funcionará corretamente
- Remoção de arquivos do storage funcionará
- A chamada extra ao storage no momento do upload é eliminada, tornando o fluxo mais limpo e rápido
