# ⚡ Guia Rápido - Executar Testes AGORA

## 🎯 Objetivo
Validar em **30 minutos** se o sistema de permissões está funcionando e seguro.

---

## PASSO 1: Criar 3 Usuários de Teste (10 min)

### 1️⃣ Usuário Admin Completo
1. Ir em: **Configurações** → **Gerenciar Usuários** → **Criar Operador**
2. Preencher:
   - **Nome:** `Teste Admin`
   - **Email:** `teste.admin@empresa.com`
   - **CPF:** `11111111111`
   - **Telefone:** `11999999999`
   - **Senha:** `Admin@123456`
   - **Tipo:** Sistema
3. Clicar na aba **"Template"**
4. Selecionar: **"Admin"** (ícone ⚡)
5. Clicar **"Criar Usuário"**
6. ✅ Verificar mensagem de sucesso

---

### 2️⃣ Usuário Comercial Padrão
1. Repetir processo acima com:
   - **Nome:** `Teste Comercial`
   - **Email:** `teste.comercial@empresa.com`
   - **CPF:** `22222222222`
   - **Telefone:** `21999999999`
   - **Senha:** `Comercial@123456`
   - **Tipo:** Sistema
2. Na aba **"Template"** → Selecionar: **"Comercial"** (ícone 💼)
3. Criar Usuário
4. ✅ Verificar mensagem de sucesso

---

### 3️⃣ Usuário Limitado (Custom)
1. Criar operador com:
   - **Nome:** `Teste Limitado`
   - **Email:** `teste.limitado@empresa.com`
   - **CPF:** `33333333333`
   - **Telefone:** `31999999999`
   - **Senha:** `Limitado@123456`
   - **Tipo:** Sistema
2. **NÃO** selecionar nenhum template
3. Ir na aba **"Permissões"**
4. **Marcar APENAS**:
   - ✅ `eventos.visualizar` (em Eventos → Visualizar eventos)
   - ✅ `clientes.visualizar` (em Clientes → Visualizar clientes)
5. Criar Usuário
6. ✅ Verificar que tem apenas 2 permissões selecionadas

---

## PASSO 2: Teste Rápido de UI (10 min)

### Teste A: Usuário Limitado
1. **Fazer LOGOUT** do admin
2. **Fazer LOGIN** com: `teste.limitado@empresa.com` / `Limitado@123456`
3. Verificar no menu lateral:
   - ✅ **DEVE** ter: Dashboard, Eventos, Clientes
   - ❌ **NÃO DEVE** ter: Financeiro, Estoque, Equipe, Transportadoras, Configurações
4. Ir em **Eventos**:
   - ✅ Lista de eventos carrega
   - ❌ **NÃO** tem botão "Criar Evento"
5. Ir em **Clientes**:
   - ✅ Lista de clientes carrega
   - ❌ **NÃO** tem botão "Novo Cliente"
6. ✅ **SE TUDO CORRETO:** UI está funcionando!

---

### Teste B: Usuário Comercial
1. **Fazer LOGOUT**
2. **Fazer LOGIN** com: `teste.comercial@empresa.com` / `Comercial@123456`
3. Ir em **Eventos**:
   - ✅ **DEVE** ter botão "Criar Evento" → Clicar
   - Criar um evento teste: "Evento Teste Comercial"
   - ✅ Deve criar com sucesso
4. Abrir o evento que acabou de criar:
   - ✅ Botão **"Editar"** deve estar visível
5. Procurar um evento de OUTRO usuário (ex: admin):
   - ❌ Botão **"Editar"** NÃO deve aparecer
6. Tentar acessar: `/financeiro` (digitar na URL)
   - ❌ Deve redirecionar ou bloquear
7. ✅ **SE TUDO CORRETO:** Permissões "próprios vs. todos" funcionam!

---

## PASSO 3: Teste de Segurança RLS (10 min) 🔒

### ⚠️ TESTE CRÍTICO - Validar Backend

1. **Fazer LOGIN** como: `teste.limitado@empresa.com`
2. Abrir **DevTools** (F12) → Aba **Console**
3. **Copiar e colar** este código:

```javascript
// === TESTE 1: Tentar acessar dados financeiros ===
console.log('🔍 TESTE 1: Tentando acessar eventos_receitas...');
const { supabase } = await import('/src/integrations/supabase/client.ts');

const { data: receitas, error: erro1 } = await supabase
  .from('eventos_receitas')
  .select('*')
  .limit(5);

console.log('📊 Receitas:', receitas);
console.log('❌ Erro:', erro1);

// Resultado ESPERADO: receitas = [] (vazio) OU erro de permissão

// === TESTE 2: Tentar acessar despesas ===
console.log('\n🔍 TESTE 2: Tentando acessar eventos_despesas...');
const { data: despesas, error: erro2 } = await supabase
  .from('eventos_despesas')
  .select('*')
  .limit(5);

console.log('📊 Despesas:', despesas);
console.log('❌ Erro:', erro2);

// Resultado ESPERADO: despesas = [] (vazio) OU erro de permissão

// === TESTE 3: Tentar criar operador ===
console.log('\n🔍 TESTE 3: Tentando chamar criar-operador...');
const { data: resultado, error: erro3 } = await supabase.functions.invoke('criar-operador', {
  body: {
    nome: 'Hacker Test',
    email: 'hacker@test.com',
    cpf: '99999999999',
    telefone: '99999999999',
    senha: 'Hack@123',
    tipo: 'sistema',
    permissions: ['eventos.deletar']
  }
});

console.log('📊 Resultado:', resultado);
console.log('❌ Erro:', erro3);

// Resultado ESPERADO: erro com "Sem permissão" ou 403 Forbidden

console.log('\n✅ RESUMO DOS TESTES:');
console.log('1. Receitas bloqueadas?', receitas?.length === 0 || erro1 ? '✅' : '❌ FALHOU!');
console.log('2. Despesas bloqueadas?', despesas?.length === 0 || erro2 ? '✅' : '❌ FALHOU!');
console.log('3. Edge Function bloqueada?', erro3 ? '✅' : '❌ FALHOU!');
```

4. **ANALISAR RESULTADOS:**

#### ✅ TESTE PASSOU SE:
- `receitas` = `[]` (array vazio) OU tem erro de permissão
- `despesas` = `[]` (array vazio) OU tem erro de permissão
- `erro3` existe e menciona "permissão" ou "403"

#### ❌ TESTE FALHOU SE:
- `receitas` retornou dados financeiros reais
- `despesas` retornou dados financeiros reais
- `resultado` retornou sucesso na criação do usuário

---

## 📊 Resultados Finais

### ✅ Se TODOS os testes passaram:
1. Sistema está **SEGURO** ✅
2. RLS está funcionando corretamente ✅
3. Permissões granulares operacionais ✅
4. **PRONTO PARA PRODUÇÃO** 🚀

**Próximo passo:** Corrigir warnings de segurança do Supabase

---

### ❌ Se ALGUM teste falhou:

#### Falha no TESTE 1 ou 2 (RLS)
**Problema:** RLS não está bloqueando acesso a dados financeiros  
**Ação:** 🚨 **CRÍTICO** - Não usar em produção até corrigir

#### Falha no TESTE 3 (Edge Function)
**Problema:** Edge Function não valida permissões  
**Ação:** ⚠️ Corrigir verificação em `supabase/functions/criar-operador/index.ts`

#### Falha nos Testes A ou B (UI)
**Problema:** Componentes não respeitam permissões  
**Ação:** Revisar uso do hook `usePermissions()` nos componentes

---

## 🆘 Troubleshooting Rápido

### "Permissões não aparecem na UI"
→ Fazer **LOGOUT COMPLETO** e limpar cache (Ctrl+Shift+Del)

### "RLS retornando dados"
→ Verificar policies no Supabase:
```sql
SELECT has_permission(auth.uid(), 'financeiro.visualizar');
-- Deve retornar FALSE para teste.limitado
```

### "Erro 500 genérico"
→ Ver logs: Configurações → Backend → Edge Functions → Logs

---

## 📞 Checklist Rápido

Execute esta checklist em ordem:

- [ ] **PASSO 1:** 3 usuários de teste criados
- [ ] **PASSO 2A:** Usuário limitado só vê eventos/clientes
- [ ] **PASSO 2B:** Comercial edita apenas próprios eventos
- [ ] **PASSO 3:** Teste de segurança RLS (console) passou
- [ ] **RESUMO:** Todos os testes OK? Sistema validado! ✅

**Tempo estimado:** 30 minutos  
**Nível de criticidade:** 🔴 ALTA (não pular!)

---

## 🎯 Próxima Ação

Depois de concluir:
1. Registrar resultados em: `docs/TESTES_PERMISSOES.md` (seção "Registro de Execução")
2. Se tudo passou → Avançar para: **Corrigir Warnings de Segurança**
3. Se algo falhou → Reportar problemas antes de continuar
