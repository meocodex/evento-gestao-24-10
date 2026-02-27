

# Adicionar "Manter-me conectado" na tela de Login

## O que sera feito

Adicionar um checkbox "Manter-me conectado" entre o campo de senha e o botao "Entrar" na tela de login. Quando marcado, a sessao persistira no `localStorage` (comportamento padrao do Supabase Auth). Quando desmarcado, usara `sessionStorage` para que a sessao expire ao fechar o navegador.

## Mudancas

### 1. `src/pages/Auth.tsx`

- Adicionar estado `rememberMe` (default: `false`)
- Adicionar import do `Checkbox` de `@/components/ui/checkbox`
- Inserir checkbox entre o campo de senha (linha 392) e o botao Entrar (linha 394)
- No `handleLogin`, antes do `signInWithPassword`, configurar a persistencia da sessao:
  - Se `rememberMe` estiver desmarcado, chamar `supabase.auth.setSession` com storage customizado usando `sessionStorage`
  - Forma mais simples: armazenar a preferencia em `localStorage` e usar no `AuthContext` para controlar o comportamento

### 2. `src/integrations/supabase/client.ts` -- NAO pode ser editado

Como o client nao pode ser editado, a abordagem sera:
- Apos login bem-sucedido com `rememberMe` desmarcado, salvar um flag `session_transient` no `sessionStorage`
- No `AuthContext`, ao detectar esse flag ausente (navegador reaberto), fazer `signOut` automatico

### Abordagem final simplificada

1. **Auth.tsx**: Adicionar checkbox + estado. Apos login com sucesso, salvar flag em `sessionStorage` se `rememberMe` estiver desmarcado
2. **AuthContext.tsx**: No carregamento, verificar se existe sessao ativa mas sem o flag `sessionStorage` -- se sim, fazer logout automatico (sessao expirou ao fechar navegador)

## Detalhes da UI

```text
[ Campo Senha        ]
[x] Manter-me conectado
[ Entrar             ]
```

O checkbox usara o componente `Checkbox` do shadcn/ui ja existente no projeto, com label inline.

