

# Guia Completo de Migracao - Lovable Cloud para Supabase Proprio

## Visao Geral

Este guia cobre a migracao completa do projeto de gestao de eventos do Lovable Cloud para um projeto Supabase independente, incluindo banco de dados, edge functions, storage e autenticacao.

---

## Passo 1: Preparar o Ambiente

### 1.1 Criar Projeto Supabase
- Acesse [supabase.com](https://supabase.com) e crie uma conta
- Crie um novo projeto (anote a **URL**, **anon key** e **service_role key**)
- Instale o Supabase CLI: `npm install -g supabase`

### 1.2 Exportar Codigo do Lovable
- No Lovable, conecte o projeto ao GitHub (Settings -> GitHub)
- Clone o repositorio: `git clone <url-do-repo>`

---

## Passo 2: Migrar o Banco de Dados

### 2.1 Aplicar Migracoes Sequencialmente

O projeto possui **90 arquivos de migracao** na pasta `supabase/migrations/`. Eles devem ser aplicados **em ordem cronologica**.

**Opcao A - Via Supabase CLI (recomendado):**
```bash
# Inicializar o projeto local
supabase init

# Copiar os arquivos de migracao para o novo projeto
cp -r supabase/migrations/* <novo-projeto>/supabase/migrations/

# Linkar ao projeto remoto
supabase link --project-ref <SEU_PROJECT_REF>

# Aplicar todas as migracoes
supabase db push
```

**Opcao B - Via SQL Editor no Dashboard:**
- Abra cada arquivo em `supabase/migrations/` em ordem
- Execute no SQL Editor do dashboard Supabase

### 2.2 O que as migracoes criam

| Componente | Quantidade |
|---|---|
| Tipos/Enums customizados | 13 (app_role, status_evento, tipo_evento, etc.) |
| Tabelas principais | ~30 (profiles, eventos, clientes, demandas, etc.) |
| Functions/RPCs | ~45 (has_permission, has_role, triggers, etc.) |
| Triggers | ~25 (updated_at, search vectors, recorrencia, etc.) |
| Policies RLS | ~80+ (controle granular por permissao) |
| Indices | ~40 (performance em buscas e filtros) |
| Materialized Views | 4 (stats de eventos, demandas, estoque, financeiro) |

---

## Passo 3: Configurar Extensions

As seguintes extensoes devem estar habilitadas no novo projeto (a maioria ja vem habilitada por padrao):

```sql
-- Verificar/habilitar extensoes necessarias
CREATE EXTENSION IF NOT EXISTS "pg_trgm" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_net";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
```

---

## Passo 4: Migrar Storage Buckets

Criar os 9 buckets no novo projeto. Via SQL Editor ou Dashboard:

```sql
-- Buckets publicos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg','image/png','image/webp']),
  ('documentos-transporte', 'documentos-transporte', true, 10485760, ARRAY['application/pdf']),
  ('cadastros-publicos', 'cadastros-publicos', true, 10485760, NULL);

-- Buckets privados
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('eventos', 'eventos', false),
  ('contratos', 'contratos', false),
  ('comprovantes', 'comprovantes', false),
  ('demandas', 'demandas', false),
  ('estoque', 'estoque', false),
  ('financeiro-anexos', 'financeiro-anexos', false);
```

**Politicas de Storage** - adicionar via SQL Editor:

```sql
-- Avatars: leitura publica, upload autenticado
CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
CREATE POLICY "Auth upload avatars" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Auth update avatars" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "Auth delete avatars" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'avatars');

-- Repetir padrao similar para os demais buckets privados
-- (SELECT, INSERT, UPDATE, DELETE para authenticated)
CREATE POLICY "Auth read eventos" ON storage.objects FOR SELECT
  TO authenticated USING (bucket_id = 'eventos');
CREATE POLICY "Auth manage eventos" ON storage.objects FOR ALL
  TO authenticated USING (bucket_id = 'eventos')
  WITH CHECK (bucket_id = 'eventos');

-- Cadastros publicos: INSERT anonimo permitido
CREATE POLICY "Public read cadastros" ON storage.objects FOR SELECT
  USING (bucket_id = 'cadastros-publicos');
CREATE POLICY "Anon insert cadastros" ON storage.objects FOR INSERT
  TO anon, authenticated WITH CHECK (bucket_id = 'cadastros-publicos');
```

---

## Passo 5: Migrar Edge Functions

### 5.1 Copiar os arquivos

As 10 edge functions estao em `supabase/functions/`:

| Funcao | JWT | Descricao |
|---|---|---|
| `setup-first-admin` | Desabilitado | Cria primeiro admin do sistema |
| `verificar-status-eventos` | Desabilitado | Cron: atualiza status de eventos |
| `buscar-cliente-por-documento` | Desabilitado | Busca publica por CPF/CNPJ |
| `criar-evento-publico` | Padrao | Cria evento a partir de cadastro publico |
| `criar-operador` | Padrao | Cria usuario operador (admin only) |
| `excluir-operacional` | Padrao | Exclui membro operacional |
| `excluir-usuario` | Padrao | Exclui usuario do sistema |
| `convert-to-webp` | Padrao | Converte imagens para WebP |
| `send-push` | Padrao | Envia notificacoes push |
| `validar-remocao-material` | Padrao | Valida remocao de material |

### 5.2 Configurar config.toml

Criar/editar `supabase/config.toml`:

```toml
[functions.setup-first-admin]
verify_jwt = false

[functions.verificar-status-eventos]
verify_jwt = false

[functions.buscar-cliente-por-documento]
verify_jwt = false
```

### 5.3 Deploy

```bash
# Deploy todas as funcoes
supabase functions deploy setup-first-admin
supabase functions deploy verificar-status-eventos
supabase functions deploy buscar-cliente-por-documento
supabase functions deploy criar-evento-publico
supabase functions deploy criar-operador
supabase functions deploy excluir-operacional
supabase functions deploy excluir-usuario
supabase functions deploy convert-to-webp
supabase functions deploy send-push
supabase functions deploy validar-remocao-material
```

### 5.4 Configurar Secrets

No dashboard Supabase, ou via CLI, adicionar os secrets necessarios:

```bash
supabase secrets set VAPID_PUBLIC_KEY="<sua_chave>"
supabase secrets set VAPID_PRIVATE_KEY="<sua_chave>"
supabase secrets set VITE_VAPID_PUBLIC_KEY="<sua_chave>"
```

**Nota:** `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` ja sao injetados automaticamente nas edge functions pelo Supabase.

---

## Passo 6: Atualizar o Frontend

### 6.1 Atualizar variaveis de ambiente

Criar arquivo `.env` na raiz:

```env
VITE_SUPABASE_PROJECT_ID="<SEU_PROJECT_REF>"
VITE_SUPABASE_PUBLISHABLE_KEY="<SUA_ANON_KEY>"
VITE_SUPABASE_URL="https://<SEU_PROJECT_REF>.supabase.co"
```

### 6.2 O arquivo `src/integrations/supabase/client.ts` nao precisa mudar

Ele ja le as variaveis de ambiente dinamicamente:

```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

### 6.3 Regenerar tipos (opcional mas recomendado)

```bash
supabase gen types typescript --project-id <SEU_PROJECT_REF> > src/integrations/supabase/types.ts
```

---

## Passo 7: Migrar Dados (se necessario)

### 7.1 Exportar dados do banco atual

Nao e possivel fazer `pg_dump` diretamente do Lovable Cloud. Para migrar dados existentes:

1. Use a interface da aplicacao para exportar relatorios
2. Ou crie um script que leia dados via API e insira no novo banco

### 7.2 Migrar usuarios (Auth)

Usuarios NAO sao migrados automaticamente. Opcoes:
- **Recriar manualmente**: Usar o `setup-first-admin` para criar o primeiro admin, depois criar os demais via interface
- **Importar via API**: Usar `supabase.auth.admin.createUser()` no novo projeto com os dados dos usuarios

---

## Passo 8: Hospedar o Frontend

### Opcao A - Vercel (recomendado)

```bash
npm install -g vercel
vercel --prod
```

Configurar variaveis de ambiente no dashboard Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

### Opcao B - Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Opcao C - Build local

```bash
npm run build
# Servir a pasta dist/ com qualquer servidor web
```

---

## Passo 9: Configurar Cron Jobs

O projeto usa funcoes periodicas. No SQL Editor do novo Supabase:

```sql
-- Habilitar extensoes
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Marcar contas vencidas (diariamente as 6h)
SELECT cron.schedule(
  'marcar-contas-vencidas',
  '0 6 * * *',
  $$SELECT marcar_contas_vencidas();$$
);

-- Verificar status de eventos (a cada hora)
SELECT cron.schedule(
  'verificar-status-eventos',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url:='https://<SEU_PROJECT_REF>.supabase.co/functions/v1/verificar-status-eventos',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer <SUA_ANON_KEY>"}'::jsonb,
    body:='{"time": "now"}'::jsonb
  );
  $$
);
```

---

## Checklist Final

- [ ] Projeto Supabase criado
- [ ] Todas as 90 migracoes aplicadas com sucesso
- [ ] Extensions habilitadas (pg_trgm, pg_net, pg_cron)
- [ ] 9 storage buckets criados com policies
- [ ] 10 edge functions deployadas
- [ ] Secrets configurados (VAPID keys)
- [ ] Variaveis de ambiente atualizadas no frontend
- [ ] Types TypeScript regenerados
- [ ] Primeiro admin criado via setup-first-admin
- [ ] Cron jobs configurados
- [ ] Frontend hospedado (Vercel/Netlify)
- [ ] Testar login e fluxos principais
- [ ] Testar upload de arquivos nos buckets
- [ ] Testar edge functions (criar usuario, excluir, etc.)

---

## Observacoes Importantes

1. **Os arquivos de migracao sao incrementais** - cada um depende do anterior. Execute sempre em ordem.
2. **RLS ja esta configurado** nas migracoes - nao precisa configurar manualmente.
3. **O trigger `on_auth_user_created`** cria profiles automaticamente quando um usuario faz signup.
4. **Permissoes granulares** usam tabelas `permissions` e `user_permissions` com a funcao `has_permission()`.
5. **Nao edite** `client.ts` nem `types.ts` manualmente - use `supabase gen types` para regenerar.

