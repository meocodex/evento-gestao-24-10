# 🔄 Migração: Sistema de Roles → Permissões Granulares

## 📌 Resumo Executivo

O sistema migrou de um modelo rígido baseado em **3 roles fixas** (`admin`, `comercial`, `suporte`) para um **sistema flexível de permissões granulares** que permite controle fino sobre cada ação no sistema.

### Por que migrar?

**Antes (Roles):**
- ❌ Apenas 3 níveis de acesso fixos
- ❌ Impossível criar permissões customizadas
- ❌ Admin tinha acesso TOTAL (não granular)
- ❌ Comercial e Suporte com escopo limitado

**Depois (Permissões Granulares):**
- ✅ 50+ permissões individuais
- ✅ Combine permissões livremente
- ✅ Templates predefinidos (Admin, Comercial, Suporte)
- ✅ Crie perfis customizados (ex: "Financeiro Júnior")
- ✅ Controle "próprios vs todos" (ex: `eventos.editar_proprios`)

---

## 🔄 Mapeamento de Roles → Permissões

### 🔴 Admin (acesso total)

**Permissões concedidas:**

#### Eventos
- `eventos.criar` - Criar novos eventos
- `eventos.visualizar_todos` - Ver todos os eventos
- `eventos.editar_todos` - Editar qualquer evento
- `eventos.deletar` - Deletar eventos

#### Clientes
- `clientes.criar` - Cadastrar novos clientes
- `clientes.visualizar` - Ver lista de clientes
- `clientes.editar` - Editar dados de clientes
- `clientes.deletar` - Remover clientes

#### Financeiro
- `financeiro.visualizar` - Ver dados financeiros (receitas/despesas)
- `financeiro.editar` - Criar/editar receitas e despesas

#### Contratos
- `contratos.visualizar` - Ver contratos e propostas
- `contratos.editar` - Criar/editar contratos

#### Demandas
- `demandas.criar` - Criar novas demandas
- `demandas.visualizar` - Ver todas as demandas
- `demandas.deletar` - Deletar demandas

#### Estoque
- `estoque.visualizar` - Ver estoque de materiais
- `estoque.editar` - Cadastrar/editar materiais
- `estoque.alocar` - Alocar materiais para eventos

#### Equipe
- `equipe.visualizar` - Ver equipe operacional
- `equipe.editar` - Cadastrar/editar membros

#### Transportadoras
- `transportadoras.visualizar` - Ver transportadoras
- `transportadoras.editar` - Cadastrar/editar transportadoras

#### Cadastros Públicos
- `cadastros.visualizar` - Ver cadastros pendentes
- `cadastros.aprovar` - Aprovar/rejeitar cadastros

#### Usuários (somente Admin)
- `usuarios.editar_permissoes` - Gerenciar permissões de outros usuários

---

### 🟢 Comercial (vendas e eventos)

**Permissões concedidas:**

#### Eventos
- `eventos.criar` - Criar novos eventos
- `eventos.visualizar` - Ver lista de eventos
- `eventos.editar_proprios` - Editar **apenas** eventos onde é comercial responsável
  - ⚠️ **IMPORTANTE:** Não pode editar eventos de outros comerciais

#### Clientes
- `clientes.criar` - Cadastrar novos clientes
- `clientes.visualizar` - Ver lista de clientes
- `clientes.editar` - Editar dados de clientes

#### Contratos
- `contratos.visualizar` - Ver contratos (somente leitura)

#### Demandas
- `demandas.criar` - Criar demandas

**Permissões NÃO concedidas:**
- ❌ Não pode ver dados financeiros
- ❌ Não pode editar eventos de outros comerciais
- ❌ Não pode deletar eventos
- ❌ Não pode gerenciar estoque
- ❌ Não pode gerenciar equipe operacional

---

### 🔵 Suporte (operações e logística)

**Permissões concedidas:**

#### Estoque
- `estoque.visualizar` - Ver estoque completo
- `estoque.editar` - Cadastrar/editar materiais e seriais
- `estoque.alocar` - Alocar materiais para eventos

#### Equipe
- `equipe.visualizar` - Ver equipe operacional
- `equipe.editar` - Cadastrar/editar membros da equipe

#### Transportadoras
- `transportadoras.visualizar` - Ver transportadoras
- `transportadoras.editar` - Gerenciar transportadoras e envios

#### Eventos (limitado)
- `eventos.visualizar` - Ver lista de eventos
- ⚠️ Pode ver mas **não pode editar** eventos

**Permissões NÃO concedidas:**
- ❌ Não pode criar/editar eventos
- ❌ Não pode ver dados financeiros
- ❌ Não pode gerenciar clientes

---

## 💡 Exemplos de Uso no Código

### 1. Verificar Permissão Única

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function CriarEventoButton() {
  const { hasPermission } = usePermissions();
  
  // Verifica se usuário pode criar eventos
  if (!hasPermission('eventos.criar')) {
    return null; // Não mostra botão
  }
  
  return <Button>Criar Evento</Button>;
}
```

### 2. Verificar Múltiplas Permissões (OR)

```typescript
function AbaFinanceiro({ evento }) {
  const { hasAnyPermission } = usePermissions();
  
  // Mostra aba se tiver QUALQUER uma das permissões
  const podeVerFinanceiro = hasAnyPermission([
    'financeiro.visualizar',
    'financeiro.visualizar_proprios'
  ]);
  
  if (!podeVerFinanceiro) {
    return null;
  }
  
  return <TabsContent value="financeiro">...</TabsContent>;
}
```

### 3. Verificar Todas as Permissões (AND)

```typescript
function GerenciarContratosButton() {
  const { hasAllPermissions } = usePermissions();
  
  // Só mostra se tiver TODAS as permissões
  const podeGerenciar = hasAllPermissions([
    'contratos.visualizar',
    'contratos.editar'
  ]);
  
  return podeGerenciar ? <Button>Gerenciar</Button> : null;
}
```

### 4. Verificar Permissões Contextuais (próprios vs. todos)

```typescript
function EditarEventoButton({ evento }) {
  const { canEditEvent } = usePermissions();
  
  // Verifica se pode editar ESTE evento específico
  // - eventos.editar_todos: pode editar qualquer evento
  // - eventos.editar_proprios: só pode editar se for o comercial
  if (!canEditEvent(evento)) {
    return null;
  }
  
  return <Button>Editar Evento</Button>;
}
```

### 5. Obter Lista de Permissões

```typescript
function PerfilUsuario() {
  const { permissions, isLoading } = usePermissions();
  
  if (isLoading) return <Spinner />;
  
  return (
    <div>
      <h3>Suas Permissões ({permissions.length})</h3>
      <ul>
        {permissions.map(perm => (
          <li key={perm}>{perm}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 🔒 Segurança: UI vs Backend

### ⚠️ CRÍTICO: Hook é apenas para UI

O hook `usePermissions` é **APENAS** para controle de interface (mostrar/esconder botões).

**A segurança REAL está no backend:**

```typescript
// ❌ ERRADO: Só verificar no frontend
function deletarEvento(id: string) {
  const { hasPermission } = usePermissions();
  if (hasPermission('eventos.deletar')) {
    // Chama API direto
    await supabase.from('eventos').delete().eq('id', id);
  }
}

// ✅ CORRETO: Backend valida via RLS
// Política RLS no Supabase:
CREATE POLICY "Users with permission can delete eventos"
ON eventos FOR DELETE
USING (has_permission(auth.uid(), 'eventos.deletar'));

// Frontend apenas esconde botão:
function DeletarButton({ eventoId }) {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission('eventos.deletar')) {
    return null; // Não mostra botão
  }
  
  return <Button onClick={() => deletarEvento(eventoId)}>Deletar</Button>;
}
```

**Por que essa arquitetura?**

1. **UI otimista**: Não mostra ações que falhariam no backend
2. **Segurança real**: RLS garante que mesmo tentativas de bypass via console/API falham
3. **Melhor UX**: Usuário não vê botões que não funcionariam para ele

---

## 🆕 Criando Permissões Customizadas

### Exemplo: Perfil "Financeiro Júnior"

Imagine que você quer um usuário que:
- ✅ Pode ver dados financeiros
- ❌ **NÃO** pode editar
- ✅ Pode ver eventos
- ❌ **NÃO** pode criar/editar eventos

**Passo a passo:**

1. Ir em `Configurações` → `Usuários` → `Criar Operador`
2. Preencher dados básicos (nome, email, senha)
3. **NÃO** selecionar template
4. Selecionar apenas estas permissões:
   - ✅ `financeiro.visualizar`
   - ✅ `eventos.visualizar`
5. Clicar em "Cadastrar"

**Resultado:**
- Usuário vê aba "Financeiro" nos eventos (leitura)
- Não vê botões "Adicionar Receita/Despesa"
- Vê lista de eventos mas sem botão "Criar Evento"

---

## 🔄 Migração de Código Antigo

### Hook Deprecado: `useEventoPermissions`

O hook antigo `useEventoPermissions` foi substituído por `usePermissions`.

#### Antes (❌ Deprecado)

```typescript
import { useEventoPermissions } from '@/hooks/useEventoPermissions';

function EventoCard({ evento }) {
  const { canEdit } = useEventoPermissions(evento);
  
  return canEdit && <Button>Editar</Button>;
}
```

#### Depois (✅ Novo)

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function EventoCard({ evento }) {
  const { canEditEvent } = usePermissions();
  
  return canEditEvent(evento) && <Button>Editar</Button>;
}
```

### Principais Diferenças

| Antigo | Novo | Nota |
|--------|------|------|
| `canEdit` | `canEditEvent(evento)` | Agora é função que recebe evento |
| `canView` | `canViewEvent(evento)` | Mais explícito |
| `isAdmin` | `hasPermission('eventos.editar_todos')` | Verificação granular |
| `canDelete` | `canDeleteEvent` | Mantido igual |

---

## 📊 Tabelas de Banco de Dados

### Tabela: `permissions`

Contém todas as permissões disponíveis no sistema.

```sql
id                          | modulo          | acao                  | categoria
----------------------------|-----------------|----------------------|-------------
eventos.criar               | Eventos         | criar                | Gestão
eventos.editar_proprios     | Eventos         | editar_proprios      | Gestão
financeiro.visualizar       | Financeiro      | visualizar           | Financeiro
```

### Tabela: `user_permissions`

Liga usuários às suas permissões.

```sql
user_id                     | permission_id
----------------------------|---------------------------
a1b2c3d4-...                | eventos.criar
a1b2c3d4-...                | clientes.editar
```

### Função: `has_permission()`

Usada nas políticas RLS para validar permissões.

```sql
CREATE OR REPLACE FUNCTION public.has_permission(
  user_id uuid,
  permission_id text
) RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_permissions
    WHERE user_permissions.user_id = has_permission.user_id
      AND user_permissions.permission_id = has_permission.permission_id
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

---

## 🐛 Troubleshooting

### Problema: Permissões não refletem na UI

**Sintoma:** Usuário tem permissão no banco mas botão não aparece.

**Soluções:**

1. **Fazer logout completo:**
   ```typescript
   // AuthContext carrega permissões no login
   // Mudanças só refletem após novo login
   await signOut();
   ```

2. **Limpar cache do navegador:**
   ```
   DevTools → Application → Clear Storage → Clear site data
   ```

3. **Verificar que `AuthContext` carrega permissões:**
   ```typescript
   // Abrir Console e verificar
   console.log(user.permissions);
   ```

### Problema: RLS bloqueando operações legítimas

**Sintoma:** Erro "new row violates row-level security policy".

**Causa:** Política RLS não inclui a permissão necessária.

**Solução:**

1. Verificar políticas RLS:
   ```sql
   -- Ver políticas da tabela eventos
   SELECT * FROM pg_policies WHERE tablename = 'eventos';
   ```

2. Atualizar política para incluir permissão:
   ```sql
   CREATE POLICY "Users with permission can create eventos"
   ON eventos FOR INSERT
   WITH CHECK (has_permission(auth.uid(), 'eventos.criar'));
   ```

### Problema: Edge Function retorna erro genérico

**Sintoma:** Erro 500 sem detalhes ao criar usuário.

**Solução:**

1. Verificar logs no Cloud:
   ```
   Cloud → Edge Functions → criar-operador → Logs
   ```

2. Procurar por erros de permissão:
   ```
   Error: User does not have permission 'usuarios.editar_permissoes'
   ```

3. Garantir que usuário que chama a função tem a permissão.

---

## ✅ Checklist de Migração Completa

- [x] ✅ Banco de dados com tabelas `permissions` e `user_permissions`
- [x] ✅ Função `has_permission()` criada no banco
- [x] ✅ Políticas RLS atualizadas para usar permissões granulares
- [x] ✅ Edge Function `criar-operador` valida permissões
- [x] ✅ `AuthContext` carrega permissões do usuário
- [x] ✅ Hook `usePermissions` implementado e documentado
- [x] ✅ UI de gestão de permissões em Configurações
- [x] ✅ Templates predefinidos (Admin, Comercial, Suporte)
- [x] ✅ Hook antigo `useEventoPermissions` deprecado
- [x] ✅ Código atualizado para usar novo hook
- [x] ✅ Documentação de migração criada

---

## 📚 Referências

- **Arquivo principal:** `src/hooks/usePermissions.ts`
- **Arquivo deprecado:** `src/hooks/useEventoPermissions.ts`
- **Context:** `src/contexts/AuthContext.tsx`
- **Edge Function:** `supabase/functions/criar-operador/index.ts`
- **Configurações UI:** `src/components/configuracoes/GerenciarPermissoes.tsx`
- **Testes:** `docs/TESTES_PERMISSOES.md`

---

## 🎯 Próximos Passos

1. ✅ Executar todos os testes em `docs/TESTES_PERMISSOES.md`
2. 📝 Treinar equipe no novo sistema de permissões
3. 🗑️ Remover código antigo de roles após validação completa
4. 🔍 Auditar todas as políticas RLS periodicamente
5. 📊 Monitorar logs de tentativas de acesso negado

---

**Última atualização:** 2025-10-22  
**Versão:** 1.0  
**Status:** ✅ Sistema em produção
