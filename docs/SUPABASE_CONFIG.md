# 🔧 Configuração do Supabase

## 📋 Visão Geral

Este projeto utiliza **Supabase** como backend (PostgreSQL + Auth + Storage + Real-time). As configurações de conexão estão no arquivo `.env`.

---

## 🔑 Variáveis de Ambiente

### Configuração Atual

O projeto está configurado com as seguintes variáveis (arquivo `.env`):

```env
VITE_SUPABASE_PROJECT_ID="oizymmjlgmwiuevksxos"
VITE_SUPABASE_URL="https://oizymmjlgmwiuevksxos.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Descrição das Variáveis

| Variável | Descrição | Onde Encontrar |
|----------|-----------|----------------|
| `VITE_SUPABASE_PROJECT_ID` | ID único do projeto Supabase | Dashboard → Settings → General |
| `VITE_SUPABASE_URL` | URL da API do Supabase | Dashboard → Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave pública (anon key) | Dashboard → Settings → API |

---

## 🌐 Acesso ao Dashboard Supabase

### URL do Projeto
```
https://supabase.com/dashboard/project/oizymmjlgmwiuevksxos
```

### Seções Importantes

1. **Table Editor** - Visualizar e editar dados
   - `/editor`

2. **SQL Editor** - Executar queries SQL
   - `/sql`

3. **Authentication** - Gerenciar usuários
   - `/auth/users`

4. **Storage** - Arquivos e imagens
   - `/storage/buckets`

5. **Database** - Migrations e backups
   - `/database/migrations`

6. **API Docs** - Documentação automática
   - `/api`

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

| Tabela | Descrição | Registros Típicos |
|--------|-----------|-------------------|
| `profiles` | Perfis de usuários | Dados do usuário logado |
| `user_roles` | Roles de acesso | admin, comercial, suporte |
| `clientes` | Cadastro de clientes | CPF/CNPJ, contatos |
| `eventos` | Gestão de eventos | Eventos com status workflow |
| `eventos_checklist` | Itens do checklist | Materiais necessários |
| `eventos_materiais_alocados` | Alocações de material | Quantidade alocada |
| `estoque` | Inventário de materiais | Controle de estoque |
| `demandas` | Tarefas e reembolsos | Workflow de aprovação |
| `contratos` | Contratos e propostas | Documentos jurídicos |
| `transportadoras` | Logística | Fretes e envios |
| `financeiro_receitas` | Receitas por evento | Faturamento |
| `financeiro_despesas` | Despesas por evento | Custos |

### Enums do Sistema

```sql
-- Roles de usuário
app_role: 'admin', 'comercial', 'suporte'

-- Status de evento
status_evento:
  'orcamento_enviado', 'confirmado', 'materiais_alocados',
  'em_preparacao', 'em_andamento', 'aguardando_retorno',
  'aguardando_fechamento', 'finalizado', 'cancelado'

-- Tipo de evento
tipo_evento: 'ingresso', 'bar', 'hibrido'

-- Status de demanda
status_demanda: 'aberta', 'em-andamento', 'concluida', 'cancelada'

-- Prioridade de demanda
prioridade_demanda: 'baixa', 'media', 'alta', 'urgente'
```

---

## 🔒 Segurança (Row Level Security)

### RLS Ativo

Todas as tabelas possuem **Row Level Security (RLS)** habilitado. Isso significa:

- ✅ Usuários só veem seus próprios dados
- ✅ Operações validadas pelo backend
- ✅ Impossível acessar dados de outros usuários via API
- ✅ Políticas configuradas por tabela

### Exemplo de Política RLS

```sql
-- Tabela: eventos
-- Política: Usuários autenticados podem ver seus eventos
CREATE POLICY "Users can view their events"
ON eventos
FOR SELECT
USING (auth.uid() IS NOT NULL);
```

---

## 🔌 Client Supabase

### Configuração Atual

O cliente Supabase está configurado em:
```
src/integrations/supabase/client.ts
```

```typescript
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
```

### Recursos Habilitados

- ✅ **Autenticação** - Login, logout, sessão persistente
- ✅ **Real-time** - Subscriptions para mudanças em tempo real
- ✅ **Storage** - Upload de arquivos (contratos, anexos)
- ✅ **Auto-refresh Token** - Renovação automática de sessão
- ✅ **Persist Session** - Mantém login após reload

---

## 🧪 Testando a Conexão

### Via Código

```typescript
import { supabase } from '@/integrations/supabase/client';

// Testar conexão
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .limit(1);

if (error) {
  console.error('Erro de conexão:', error);
} else {
  console.log('Conectado com sucesso!', data);
}
```

### Via SQL Editor (Dashboard)

```sql
-- Verificar tabelas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Contar registros
SELECT
  'clientes' as tabela, COUNT(*) as registros FROM clientes
UNION ALL
SELECT 'eventos', COUNT(*) FROM eventos
UNION ALL
SELECT 'demandas', COUNT(*) FROM demandas;
```

---

## 🔄 Migrations

### Localização

As migrations estão em:
```
supabase/migrations/
```

### Histórico

- **56 migrations** aplicadas (Out 10 - Nov 1, 2025)
- Migrations mais recentes:
  - `20251101002159` - Correção de triggers de alocação
  - `20251031220036` - Atualização de quantidade alocada
  - `20251030182427` - Ajustes de permissões

### Aplicar Migrations Localmente

```bash
# Usando Supabase CLI
supabase db reset
supabase db push
```

---

## 📡 Edge Functions

### Funções Disponíveis

| Função | Endpoint | Descrição |
|--------|----------|-----------|
| `criar-evento-publico` | `/functions/v1/criar-evento-publico` | Cadastro público de eventos |
| `setup-first-admin` | `/functions/v1/setup-first-admin` | Criar primeiro admin |
| `verificar-status-eventos` | `/functions/v1/verificar-status-eventos` | Cron job de status |
| `send-push` | `/functions/v1/send-push` | Notificações push |
| `convert-to-webp` | `/functions/v1/convert-to-webp` | Otimizar imagens |
| `criar-operador` | `/functions/v1/criar-operador` | Criar usuário operacional |
| `excluir-usuario` | `/functions/v1/excluir-usuario` | Deletar usuário |

---

## 🚨 Troubleshooting

### Erro: "Invalid API Key"

**Causa:** Chave do Supabase incorreta ou expirada

**Solução:**
1. Verifique o arquivo `.env`
2. Copie novamente do Dashboard → Settings → API
3. Reinicie o servidor de desenvolvimento

### Erro: "Row Level Security Policy Violation"

**Causa:** Tentativa de acessar dados sem permissão

**Solução:**
1. Verifique se está logado (`auth.user()`)
2. Confirme que possui a role necessária
3. Revise políticas RLS no SQL Editor

### Erro: "Connection Timeout"

**Causa:** Problemas de rede ou projeto pausado

**Solução:**
1. Verifique sua conexão de internet
2. Acesse o Dashboard e verifique se o projeto está ativo
3. Projetos inativos entram em pausa após 7 dias

---

## 📊 Monitoramento

### Métricas Importantes

Acesse o Dashboard → Reports para visualizar:

- **API Requests** - Uso da API
- **Database Size** - Tamanho do banco
- **Bandwidth** - Tráfego de rede
- **Active Users** - Usuários ativos
- **Storage** - Uso de armazenamento

### Limites do Plano Gratuito

- **Database Size:** 500 MB
- **Bandwidth:** 5 GB/mês
- **Storage:** 1 GB
- **Realtime Concurrent Connections:** 200

---

## 🔗 Links Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase Client JS](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## 📞 Suporte

Para problemas relacionados ao Supabase:

1. **Documentação:** https://supabase.com/docs
2. **Discord:** https://discord.supabase.com
3. **GitHub Issues:** https://github.com/supabase/supabase/issues
4. **Status Page:** https://status.supabase.com

---

**Última Atualização:** 2025-11-03
