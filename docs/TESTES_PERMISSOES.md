# 🧪 Guia de Testes - Sistema de Permissões Granulares

## 📋 Visão Geral

Este documento contém os cenários de teste críticos para validar o sistema de permissões granulares implementado. Execute cada cenário na ordem apresentada.

---

## ✅ Cenário 1: Criar Usuário com Permissões Customizadas

### Objetivo
Validar que é possível criar usuários com permissões específicas e que essas permissões são respeitadas na interface.

### Pré-requisitos
- Estar logado como Admin (com permissão `usuarios.editar_permissoes`)

### Passos

1. **Criar novo usuário:**
   - Ir em `Configurações` → `Usuários` → `Criar Operador`
   - Preencher dados básicos:
     - Nome: "Teste Permissões Custom"
     - Email: `teste.custom@empresa.com`
     - Senha: `Teste123!`
   - **NÃO** selecionar template
   - Selecionar APENAS estas permissões:
     - ✅ `eventos.visualizar`
     - ✅ `clientes.visualizar`
   - Clicar em "Cadastrar"

2. **Validar criação no banco:**
   - Abrir Cloud → Database → Tabela `user_permissions`
   - Verificar que existem EXATAMENTE 2 registros para este usuário
   - Validar os `permission_id`: `eventos.visualizar` e `clientes.visualizar`

3. **Fazer logout e logar com novo usuário:**
   - Logout do admin
   - Login com: `teste.custom@empresa.com` / `Teste123!`

4. **Validar interface de Eventos:**
   - ✅ DEVE mostrar a página `/eventos`
   - ✅ DEVE exibir lista de eventos
   - ❌ NÃO DEVE mostrar botão "Criar Evento"
   - ❌ NÃO DEVE mostrar botão "Editar" nos cards de eventos
   - ❌ NÃO DEVE mostrar botão de ações (⋮) nos cards

5. **Validar interface de Clientes:**
   - ✅ DEVE mostrar a página `/clientes`
   - ✅ DEVE exibir lista de clientes
   - ❌ NÃO DEVE mostrar botão "Novo Cliente"
   - ❌ NÃO DEVE mostrar botões de editar/deletar

6. **Validar acesso negado a outras páginas:**
   - Tentar acessar `/configuracoes`
   - ❌ DEVE redirecionar ou mostrar "Acesso Negado"

### Resultado Esperado
✅ Usuário só vê funcionalidades relacionadas às suas 2 permissões  
✅ Não há botões de ação para operações não autorizadas

---

## ✅ Cenário 2: Template "Comercial"

### Objetivo
Validar que o template "Comercial" concede o conjunto correto de permissões.

### Pré-requisitos
- Estar logado como Admin

### Passos

1. **Criar usuário usando template:**
   - Ir em `Configurações` → `Usuários` → `Criar Operador`
   - Preencher dados:
     - Nome: "Teste Comercial"
     - Email: `teste.comercial@empresa.com`
     - Senha: `Teste123!`
   - Selecionar template: **"Comercial"**
   - Clicar em "Cadastrar"

2. **Validar permissões no banco:**
   - Abrir Cloud → Database → Tabela `user_permissions`
   - Validar que o usuário tem EXATAMENTE estas 8 permissões:
     - ✅ `eventos.criar`
     - ✅ `eventos.visualizar`
     - ✅ `eventos.editar_proprios`
     - ✅ `clientes.criar`
     - ✅ `clientes.visualizar`
     - ✅ `clientes.editar`
     - ✅ `contratos.visualizar`
     - ✅ `demandas.criar`

3. **Login como comercial:**
   - Logout do admin
   - Login com: `teste.comercial@empresa.com` / `Teste123!`

4. **Validar funcionalidades de Eventos:**
   - ✅ DEVE mostrar botão "Criar Evento"
   - ✅ DEVE poder criar novo evento
   - No evento criado:
     - ✅ DEVE mostrar botão "Editar" (é dono do evento)
     - ✅ DEVE poder editar dados do evento
   - Em eventos de OUTROS comerciais:
     - ❌ NÃO DEVE mostrar botão "Editar"
     - ❌ NÃO DEVE poder alterar status

5. **Validar Financeiro:**
   - Abrir qualquer evento
   - Tentar acessar aba "Financeiro"
   - ❌ Aba DEVE estar desabilitada/oculta
   - ❌ NÃO DEVE ver receitas/despesas

6. **Validar Clientes:**
   - ✅ DEVE mostrar botão "Novo Cliente"
   - ✅ DEVE poder criar clientes
   - ✅ DEVE poder editar clientes existentes
   - ❌ NÃO DEVE mostrar botão "Deletar"

### Resultado Esperado
✅ Comercial pode gerenciar APENAS seus próprios eventos  
✅ Não tem acesso a dados financeiros  
✅ Pode criar e editar clientes

---

## ✅ Cenário 3: RLS Impedindo Acessos Não Autorizados

### Objetivo
Validar que as políticas RLS (Row Level Security) no banco impedem acessos diretos via API.

### Pré-requisitos
- Ter usuário sem permissão `financeiro.visualizar` criado no Cenário 1
- Estar logado como esse usuário limitado

### Passos

1. **Testar proteção via UI:**
   - Login com: `teste.custom@empresa.com`
   - Abrir qualquer evento (página `/eventos/[id]`)
   - Verificar que aba "Financeiro" não aparece

2. **Testar proteção via Console (bypass direto):**
   - Abrir DevTools (F12) → Console
   - Executar código tentando acessar receitas diretamente:
   ```javascript
   const { supabase } = await import('/src/integrations/supabase/client.ts');
   const { data, error } = await supabase
     .from('eventos_receitas')
     .select('*')
     .limit(5);
   
   console.log('Dados:', data);
   console.log('Erro:', error);
   ```

3. **Validar bloqueio RLS:**
   - ✅ DEVE retornar `data: []` (array vazio) OU
   - ✅ DEVE retornar erro com código de permissão negada
   - ❌ NÃO DEVE retornar dados financeiros

4. **Testar outras tabelas protegidas:**
   - Repetir teste com `eventos_despesas`:
   ```javascript
   const { data, error } = await supabase
     .from('eventos_despesas')
     .select('*')
     .limit(5);
   console.log('Despesas:', data, error);
   ```
   - ✅ DEVE estar bloqueado também

### Resultado Esperado
✅ RLS bloqueia acesso direto via API mesmo sem verificações de UI  
✅ Usuários não conseguem "furar" restrições via console

---

## ✅ Cenário 4: Editar Permissões de Usuário Existente

### Objetivo
Validar que alterações de permissões são refletidas imediatamente após re-login.

### Pré-requisitos
- Ter usuário comercial criado no Cenário 2
- Estar logado como Admin

### Passos

1. **Login como admin e editar permissões:**
   - Ir em `Configurações` → `Usuários`
   - Localizar "Teste Comercial"
   - Clicar em "Editar Permissões"
   - **REMOVER** a permissão: `eventos.criar`
   - Salvar alterações

2. **Validar no banco:**
   - Abrir Cloud → Database → `user_permissions`
   - Verificar que `eventos.criar` foi removido
   - Deve ter agora 7 permissões (antes eram 8)

3. **Re-login como comercial:**
   - Logout do admin
   - Login com: `teste.comercial@empresa.com`

4. **Validar mudança na UI:**
   - Abrir página `/eventos`
   - ❌ Botão "Criar Evento" DEVE ter desaparecido
   - ✅ Lista de eventos ainda deve ser visível
   - ✅ Pode ainda editar seus próprios eventos (tem `editar_proprios`)

5. **Adicionar permissão de volta:**
   - Logout, logar como admin
   - Adicionar novamente `eventos.criar` ao usuário
   - Logout, logar como comercial
   - ✅ Botão "Criar Evento" DEVE reaparecer

### Resultado Esperado
✅ Mudanças de permissões refletem imediatamente após novo login  
✅ Sistema respeita granularidade das permissões

---

## ✅ Cenário 5: Permissões "Próprios vs. Todos"

### Objetivo
Validar diferença entre permissões `_proprios` e `_todos`.

### Pré-requisitos
- Ter 2 usuários comerciais criados
- Ter eventos criados por cada comercial

### Passos - Parte A: Comercial com `editar_proprios`

1. **Setup:**
   - Login como Admin
   - Criar usuário: `comercial1@empresa.com` com template "Comercial"
   - Criar usuário: `comercial2@empresa.com` com template "Comercial"

2. **Criar eventos de cada comercial:**
   - Login como `comercial1@empresa.com`
   - Criar evento: "Evento do Comercial 1"
   - Logout
   - Login como `comercial2@empresa.com`
   - Criar evento: "Evento do Comercial 2"

3. **Validar visualização como comercial1:**
   - Login como `comercial1@empresa.com`
   - Ir em `/eventos`
   - ✅ DEVE ver AMBOS os eventos na lista
   - No "Evento do Comercial 1":
     - ✅ DEVE ter botão "Editar"
     - ✅ DEVE poder abrir modal de edição
   - No "Evento do Comercial 2":
     - ❌ NÃO DEVE ter botão "Editar"
     - ❌ NÃO DEVE ter menu de ações

### Passos - Parte B: Admin com `editar_todos`

1. **Login como Admin**

2. **Validar visualização:**
   - Ir em `/eventos`
   - ✅ DEVE ver TODOS os eventos
   - Em QUALQUER evento:
     - ✅ DEVE ter botão "Editar"
     - ✅ DEVE poder editar dados
     - ✅ DEVE poder mudar status
     - ✅ DEVE poder deletar

### Resultado Esperado
✅ `editar_proprios` permite editar APENAS eventos onde é comercial  
✅ `editar_todos` permite editar QUALQUER evento  
✅ Visualização é sempre liberada para todos

---

## ✅ Cenário 6: Validar Proteção de Endpoints Sensíveis

### Objetivo
Garantir que Edge Functions e operações críticas verificam permissões.

### Pré-requisitos
- Ter usuário sem permissão `usuarios.editar_permissoes`

### Passos

1. **Login como usuário limitado:**
   - Use `teste.custom@empresa.com` (do Cenário 1)

2. **Tentar acessar criação de operador via API:**
   - Abrir DevTools → Network
   - Tentar navegar para `/configuracoes` (deve ser bloqueado)

3. **Tentar chamar Edge Function diretamente:**
   - Abrir Console
   - Executar:
   ```javascript
   const { supabase } = await import('/src/integrations/supabase/client.ts');
   const { data, error } = await supabase.functions.invoke('criar-operador', {
     body: {
       email: 'hacker@teste.com',
       password: 'senha123',
       nome: 'Tentativa de Hack',
       permissions: ['eventos.criar']
     }
   });
   console.log('Resultado:', data, error);
   ```

4. **Validar bloqueio:**
   - ✅ DEVE retornar erro de permissão negada
   - ❌ NÃO DEVE criar o usuário

5. **Validar logs do Edge Function:**
   - Admin → Cloud → Edge Functions → Logs
   - Procurar por chamadas recentes
   - ✅ DEVE ter log de tentativa bloqueada
   - ✅ Log deve mencionar verificação de permissões

### Resultado Esperado
✅ Edge Functions validam permissões antes de executar  
✅ Tentativas de bypass são registradas e bloqueadas

---

## 📊 Checklist Final de Validação

Execute esta checklist após todos os cenários:

### Segurança
- [ ] RLS bloqueia acesso direto a dados sensíveis
- [ ] Edge Functions verificam permissões
- [ ] Não é possível escalar privilégios via console
- [ ] Permissões são validadas no backend (não apenas UI)

### Funcionalidade
- [ ] Templates aplicam conjunto correto de permissões
- [ ] Permissões customizadas funcionam corretamente
- [ ] Mudanças de permissões refletem após re-login
- [ ] `_proprios` vs `_todos` funcionam como esperado

### Experiência do Usuário
- [ ] Botões de ação aparecem/somem conforme permissões
- [ ] Mensagens de erro são claras
- [ ] Não há elementos "mortos" (visíveis mas não funcionais)
- [ ] Loading states funcionam corretamente

### Dados
- [ ] Tabela `user_permissions` reflete estado correto
- [ ] Tabela `permissions` tem todas as permissões cadastradas
- [ ] Não há permissões órfãs ou duplicadas
- [ ] Função `has_permission()` retorna valores corretos

---

## 🐛 Problemas Comuns e Soluções

### Problema: Permissões não refletem na UI
**Solução:** Fazer logout completo e limpar cache do navegador

### Problema: RLS bloqueando operações legítimas
**Solução:** Verificar que políticas RLS incluem TODAS as permissões necessárias

### Problema: Edge Function retorna erro genérico
**Solução:** Verificar logs no Cloud → Edge Functions para detalhes

### Problema: Botões aparecem mas ações falham
**Solução:** Provável divergência entre verificação de UI e RLS - revisar políticas

---

## 📝 Registro de Execução

Use esta seção para anotar resultados dos testes:

| Cenário | Status | Observações | Data |
|---------|--------|-------------|------|
| 1. Permissões Custom | ⬜ | | |
| 2. Template Comercial | ⬜ | | |
| 3. Proteção RLS | ⬜ | | |
| 4. Editar Permissões | ⬜ | | |
| 5. Próprios vs Todos | ⬜ | | |
| 6. Endpoints Sensíveis | ⬜ | | |

**Legenda:**
- ✅ = Passou
- ❌ = Falhou
- ⚠️ = Passou com ressalvas
- ⬜ = Não testado

---

## 🎯 Próximos Passos Após Validação

Se todos os testes passarem:
1. ✅ Marcar Fase 9 como concluída
2. 📋 Prosseguir para Fase 4 (Unificação de Equipe)
3. 📝 Documentar quaisquer bugs encontrados

Se algum teste falhar:
1. 🐛 Documentar o problema em detalhes
2. 🔍 Investigar causa raiz
3. 🔧 Corrigir antes de prosseguir
