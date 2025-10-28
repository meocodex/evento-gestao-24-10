# 🚀 Configuração de GitHub Actions - Guia Completo

Este guia explica como configurar e usar os workflows de CI/CD com GitHub Actions neste projeto.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração Inicial](#configuração-inicial)
3. [Workflows Disponíveis](#workflows-disponíveis)
4. [Executar Testes Localmente](#executar-testes-localmente)
5. [Interpretar Resultados](#interpretar-resultados)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

Este projeto implementa 3 workflows principais de GitHub Actions:

| Workflow | Trigger | Duração | Custo (min/mês) |
|----------|---------|---------|-----------------|
| **CI** | Todo PR/Push | 2-4 min | ~200-400 min |
| **E2E** | Push main, Manual, Agendado | 5-10 min | ~100-200 min |
| **Load Tests** | Manual, Agendado | 8-15 min | ~50-100 min |

**Total estimado**: 350-700 minutos/mês (dentro do free tier de 2.000 min)

---

## ⚙️ Configuração Inicial

### 1. Adicionar Secrets no GitHub

Acesse: **Repository → Settings → Secrets and Variables → Actions**

Clique em **"New repository secret"** e adicione:

#### Obrigatórios (para todos os workflows):

```bash
VITE_SUPABASE_URL
# Valor: https://oizymmjlgmwiuevksxos.supabase.co

VITE_SUPABASE_PUBLISHABLE_KEY
# Valor: eyJhbGci... (sua chave pública)

VITE_SUPABASE_PROJECT_ID
# Valor: oizymmjlgmwiuevksxos
```

#### Para testes E2E e Load Tests:

```bash
TEST_USER_EMAIL
# Valor: email do usuário de teste (ex: teste@exemplo.com)

TEST_USER_PASSWORD
# Valor: senha do usuário de teste (mínimo 8 caracteres)

E2E_BASE_URL
# Valor: URL da aplicação em staging/production
# Exemplo: https://seu-app.lovable.app
```

### 2. Criar Usuário de Teste

1. Acesse sua aplicação em produção
2. Crie um usuário específico para testes (ex: `teste@exemplo.com`)
3. Use esse email/senha nos secrets do GitHub
4. **Importante**: Não use um usuário real com dados sensíveis!

### 3. Configurar Branch Protection

Acesse: **Repository → Settings → Branches → Add rule**

Para a branch `main`:

- ✅ **Require status checks to pass before merging**
  - Marque: `lint-and-test` (do workflow CI)
- ✅ **Require branches to be up to date before merging**
- ✅ **Include administrators** (opcional mas recomendado)

---

## 🔄 Workflows Disponíveis

### 1. CI - Build, Lint & Test

**Arquivo**: `.github/workflows/ci.yml`

**Quando executa**:
- Todo push para `main` ou `develop`
- Todo Pull Request para `main` ou `develop`

**O que faz**:
1. ✅ Checkout do código
2. ✅ Setup Node.js 18 com cache npm
3. ✅ Instala dependências (`npm ci`)
4. ✅ Executa ESLint (`npm run lint`)
5. ✅ Verifica tipos TypeScript (`npm run type-check`)
6. ✅ Executa testes de validação (`npm run test:ci`)
7. ✅ Faz build da aplicação (`npm run build`)

**Tempo**: 2-4 minutos

**Status**: ❌ Bloqueia merge se falhar

**Exemplo de uso**:
```bash
# Criar branch e fazer PR
git checkout -b feature/nova-feature
git add .
git commit -m "feat: adiciona nova feature"
git push origin feature/nova-feature

# GitHub Actions executará automaticamente
```

---

### 2. E2E Tests - Playwright

**Arquivo**: `.github/workflows/e2e.yml`

**Quando executa**:
- Push para `main`
- Manual (workflow_dispatch)
- Agendado: Segunda-feira às 2am UTC

**O que faz**:
1. ✅ Executa testes E2E em **3 browsers** (Chromium, Firefox, WebKit)
2. ✅ Testa autenticação (login, logout, proteção de rotas)
3. ✅ Testa gestão de eventos (CRUD completo)
4. ✅ Testa alocação de materiais
5. ✅ Captura screenshots em caso de falha
6. ✅ Gera relatório HTML

**Tempo**: 5-10 minutos por browser (paralelo)

**Executar manualmente**:
1. Acesse: **Actions → E2E Tests - Playwright**
2. Clique em **"Run workflow"**
3. Selecione a branch
4. Clique em **"Run workflow"**

**Ver relatórios**:
- Acesse o workflow run
- Role até **"Artifacts"**
- Baixe `playwright-report-chromium` (ou outros browsers)

---

### 3. Load Tests - K6

**Arquivo**: `.github/workflows/load-tests.yml`

**Quando executa**:
- Manual (workflow_dispatch)
- Agendado: Segunda-feira às 3am UTC

**O que faz**:
1. ✅ Executa testes de carga com K6
2. ✅ Simula 10-50 usuários simultâneos
3. ✅ Valida tempos de resposta
4. ✅ Gera métricas de performance

**Tempo**: 8-15 minutos

**Executar manualmente**:
1. Acesse: **Actions → Load Tests - K6**
2. Clique em **"Run workflow"**
3. Selecione a branch
4. Clique em **"Run workflow"**

**⚠️ Importante**: Testes de carga podem impactar performance temporariamente. Execute fora do horário de pico!

---

## 💻 Executar Testes Localmente

### Testes de Validação

```bash
# Executar todos os testes de validação
npm run test

# Modo CI (sai com código de erro se falhar)
npm run test:ci
```

### Testes E2E

```bash
# 1. Fazer build primeiro
npm run build

# 2. Executar testes (headless)
npm run test:e2e

# 3. Executar com UI interativa (recomendado para debug)
npm run test:e2e:ui

# 4. Ver relatório após execução
npm run test:e2e:report

# 5. Executar apenas um browser
npx playwright test --project=chromium

# 6. Executar apenas um arquivo de teste
npx playwright test tests/e2e/auth.spec.ts

# 7. Debug de um teste específico
npx playwright test tests/e2e/auth.spec.ts --debug
```

### Type Check

```bash
# Verificar erros de TypeScript sem compilar
npm run type-check
```

---

## 📊 Interpretar Resultados

### CI Workflow

**Status verde (✅)**:
- Lint passou
- Type check passou
- Testes de validação passaram
- Build foi bem-sucedido

**Status vermelho (❌)**:
- Verifique logs de cada step
- Erros de lint: corrija formatação/regras
- Erros de tipo: corrija tipos TypeScript
- Testes falharam: veja mensagem de erro
- Build falhou: verifique dependências

### E2E Tests

**Exemplo de resultado com sucesso**:
```
✅ auth.spec.ts - deve fazer login com sucesso (2.3s)
✅ eventos.spec.ts - deve criar novo evento (4.1s)
✅ materiais.spec.ts - deve alocar material (3.7s)
```

**Exemplo de resultado com falha**:
```
❌ auth.spec.ts - deve fazer login com sucesso (5.0s)
   Error: Timeout 10000ms exceeded
   Screenshot: test-results/auth-login-chromium/failure.png
```

**Como debugar falhas**:
1. Baixe o artifact `playwright-screenshots-{browser}`
2. Veja o screenshot do momento da falha
3. Leia o trace completo no relatório HTML
4. Execute localmente com `--debug` para step-by-step

### Load Tests

**Métricas importantes**:
- **http_req_duration**: Tempo de resposta (deve ser < 500ms)
- **http_req_failed**: Taxa de falhas (deve ser < 1%)
- **iterations**: Número de requisições completadas
- **vus**: Usuários virtuais simultâneos

**Interpretação**:
- ✅ **Bom**: Tempo médio < 500ms, falhas < 1%
- ⚠️ **Atenção**: Tempo médio 500-1000ms, falhas 1-5%
- ❌ **Crítico**: Tempo médio > 1000ms, falhas > 5%

---

## 🔧 Troubleshooting

### Problema: CI falha com "npm ci" error

**Solução**:
```bash
# Deletar node_modules e package-lock localmente
rm -rf node_modules package-lock.json

# Reinstalar
npm install

# Commitar novo package-lock.json
git add package-lock.json
git commit -m "fix: atualiza package-lock.json"
```

### Problema: E2E falha com "Timeout exceeded"

**Causas comuns**:
1. Aplicação demorou muito para carregar
2. Seletor não foi encontrado (mudança de UI)
3. Network lenta

**Solução**:
- Aumente timeout em `playwright.config.ts`:
  ```typescript
  use: {
    navigationTimeout: 60000, // Era 30000
    actionTimeout: 15000,     // Era 10000
  }
  ```

### Problema: E2E falha com "Authentication failed"

**Solução**:
1. Verifique se `TEST_USER_EMAIL` e `TEST_USER_PASSWORD` estão corretos
2. Teste login manual com essas credenciais
3. Certifique-se que o usuário existe no ambiente de teste

### Problema: Load Tests falha ou resposta muito lenta

**Causas**:
1. Banco de dados com muitos dados de teste
2. Lovable Cloud em cold start
3. RLS policies complexas

**Solução**:
1. Execute load test após warm-up da aplicação
2. Revise queries do banco (adicione índices se necessário)
3. Ajuste thresholds em `tests/load/eventos.test.js`

### Problema: Workflows não aparecem no GitHub

**Solução**:
1. Verifique se arquivos estão em `.github/workflows/`
2. Verifique sintaxe YAML (use um validator online)
3. Dê push para `main` ou `develop`
4. Aguarde 1-2 minutos para GitHub indexar

### Problema: Atingiu limite de minutos do GitHub Actions

**Solução**:
1. **Free tier**: 2.000 min/mês
2. Otimize workflows:
   - Use cache de dependências (já configurado)
   - Reduza frequência de testes agendados
   - Execute E2E apenas em `main` (remova de PRs)
3. Considere GitHub Pro/Team (3.000-50.000 min/mês)

---

## 📚 Recursos Adicionais

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Playwright Docs](https://playwright.dev/)
- [K6 Docs](https://k6.io/docs/)
- [Lovable Docs](https://docs.lovable.dev/)

---

## ✅ Checklist de Configuração

Use este checklist para verificar se tudo está configurado:

- [ ] Todos os secrets adicionados no GitHub
- [ ] Usuário de teste criado e funcional
- [ ] Branch protection rules configuradas
- [ ] CI workflow executou com sucesso em um PR
- [ ] E2E workflow executado manualmente (pelo menos 1x)
- [ ] Load tests executado manualmente (pelo menos 1x)
- [ ] Badges adicionados ao README
- [ ] Time treinado em como interpretar resultados

---

**Última atualização**: 2025-10-28
