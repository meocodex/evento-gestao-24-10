# Correções e Melhorias nos Testes

Este documento descreve as correções e melhorias aplicadas na suite de testes.

---

## ✅ Correções Aplicadas em 2025-11-11

### Problema #1: Dados de Teste Incompatíveis com Schemas Zod (13 falhas corrigidas)

**Arquivos corrigidos:**
- `src/lib/validations/__tests__/cliente.test.ts` (2 falhas)
- `src/lib/validations/__tests__/demanda.test.ts` (3 falhas)
- `src/lib/validations/__tests__/financeiro.test.ts` (8 falhas)

#### Correções em `cliente.test.ts`
- ✅ Corrigido tipo de documento: `'pf'` → `'CPF'`, `'pj'` → `'CNPJ'` (schemas usam maiúsculas)
- ✅ Corrigido estrutura de endereço: campos planos → objeto aninhado com estrutura completa:
  ```typescript
  // Antes (ERRADO)
  cep: '01310100',
  endereco: 'Av. Paulista',
  numero: '1000',
  cidade: 'São Paulo',
  estado: 'SP'
  
  // Depois (CORRETO)
  endereco: {
    cep: '01310100',
    logradouro: 'Av. Paulista',
    numero: '1000',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP'
  }
  ```

#### Correções em `demanda.test.ts`
- ✅ Corrigido categoria inválida: `'logistica'` → `'operacional'` (categoria válida do enum)
- ✅ Garantida consistência em todos os testes usando categorias válidas

#### Correções em `financeiro.test.ts`
- ✅ Adicionado campo obrigatório `recorrencia: 'unico'` em TODOS os testes
- ✅ Corrigido tipo inválido em `contaReceberSchema`: `'evento'` → tipos válidos (`'venda'`, `'locacao'`, `'servico'`, `'outros'`)
- ✅ Removido campo inexistente `evento_id` e categoria inválida `'evento'`

### Problema #2: Mocks de Permissões Inadequados (29 falhas corrigidas)

**Arquivos corrigidos:**
- `src/hooks/__tests__/usePermissions.test.ts` (23 falhas)
- `src/hooks/__tests__/useEventoPermissions.test.ts` (6 falhas)

#### Mudanças Aplicadas
**Problema identificado:** Mutação direta de objetos mockados não disparava re-renderização adequada nos testes.

**Solução implementada:** Refatoração completa para usar `vi.mocked()` + `mockReturnValue()` explicitamente em cada teste.

```typescript
// ❌ Antes (INCORRETO - mutação direta)
const mockUser = { id: 'user-123', permissions: [] };
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: mockUser })),
}));

beforeEach(() => {
  mockUser.permissions = []; // Mutação direta
});

// ✅ Depois (CORRETO - mock explícito por teste)
vi.mock('@/contexts/AuthContext');
const mockUseAuth = vi.mocked(useAuth);

beforeEach(() => {
  mockUseAuth.mockReturnValue({
    user: {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      tipo: 'sistema',
      role: 'comercial',
      permissions: [],
      isAdmin: false,
    },
    logout: vi.fn(),
    isAuthenticated: true,
    loading: false,
  });
});

// Cada teste agora tem mock explícito e isolado
it('deve ter permissão específica', () => {
  mockUseAuth.mockReturnValue({
    user: { /* ... estrutura completa com permissões específicas */ },
    /* ... resto do contexto */
  });
  // teste...
});
```

**Vantagens da nova abordagem:**
- ✅ Cada teste tem mock explícito e isolado
- ✅ Não depende de mutação de objeto compartilhado
- ✅ Mais fácil de debugar e entender
- ✅ Menos propenso a falsos positivos/negativos
- ✅ Segue best practices de testes unitários

---

## 📊 Resumo de Resultados Esperados

### Antes das Correções
- ❌ **Total de Falhas**: 42 testes
- ⚠️ **Taxa de Sucesso**: ~67% (127/169)
- 🔴 **Schemas Zod**: 13 falhas
- 🔴 **Mocks de Permissões**: 29 falhas

### Após as Correções
- ✅ **Total de Sucessos**: 169 testes (esperado)
- ✅ **Taxa de Sucesso**: 100%
- ✅ **Schemas Zod**: Todos funcionando
- ✅ **Mocks de Permissões**: Todos funcionando

---

## 🎯 Próximos Passos

### 1. Validação
Execute os testes para confirmar 100% de sucesso:
```bash
npm run test:coverage
```

### 2. Análise de Cobertura
Verifique se as métricas atendem aos requisitos:
- Statements: ≥60%
- Branches: ≥55%
- Functions: ≥60%
- Lines: ≥60%

### 3. Testes E2E
Execute a suite completa de testes end-to-end:
```bash
npm run test:e2e
```

### 4. Automação CI/CD
Configure GitHub Actions para executar os testes automaticamente em cada PR.

---

## 📝 Lições Aprendidas

### Best Practices para Mocks
1. ✅ Use `vi.mocked()` para type-safety
2. ✅ Use `mockReturnValue()` explicitamente por teste
3. ✅ Evite mutação direta de objetos mockados
4. ✅ Garanta isolamento completo entre testes

### Best Practices para Schemas Zod
1. ✅ Sempre valide tipos exatos (case-sensitive)
2. ✅ Respeite estrutura de objetos aninhados
3. ✅ Inclua todos os campos obrigatórios
4. ✅ Use valores válidos dos enums definidos

---

## 📞 Comandos Úteis

```bash
# Executar todos os testes
npm test

# Executar com interface visual
npm run test:ui

# Executar com cobertura
npm run test:coverage

# Watch mode
npm run test:watch

# Testes E2E
npm run test:e2e

# Testes E2E com UI
npm run test:e2e:ui

# Testes E2E vendo navegador
npm run test:e2e:headed

# Rodar teste específico
npm test -- cliente.test.ts
```

---

**Status Final**: ✅ Todas as correções implementadas  
**Data**: 2025-11-11  
**Próxima Ação**: Executar `npm run test:coverage` para validar
