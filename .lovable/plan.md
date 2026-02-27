
# Remover texto "Ticket Up" e ajustar cor do Sidebar

## 1. Remover texto do header da Sidebar

No arquivo `src/components/layout/AppSidebar.tsx`, linhas 124-139:
- Remover o texto "Ticket Up" e o nome do usuario do header
- Manter apenas a logo centralizada
- Aumentar levemente o tamanho da logo para preencher melhor o espaco (de 40px para 48px)
- Mover o nome do usuario para o bloco "Perfil" no footer (que ja existe)

## 2. Alterar cor do Sidebar para contraste com a logo dourada

A logo tem tons dourados sobre fundo transparente. O sidebar navy escuro atual funciona, mas podemos melhorar com um tom mais profundo e levemente mais quente para criar contraste premium.

No arquivo `src/index.css`, alterar as variaveis do sidebar:

**Modo Claro:**
- `--sidebar-background`: de `220 29% 16%` para `225 25% 12%` (navy mais profundo)
- `--sidebar-accent`: de `220 29% 22%` para `225 25% 18%`
- `--sidebar-border`: de `220 29% 22%` para `225 25% 20%`

**Modo Escuro:**
- `--sidebar-background`: de `220 35% 8%` para `228 30% 7%` (quase preto azulado)
- `--sidebar-accent`: de `220 30% 16%` para `228 28% 14%`
- `--sidebar-border`: de `220 30% 14%` para `228 28% 12%`

Isso cria um fundo mais escuro e neutro que faz o dourado da logo "brilhar" por contraste.

## Arquivos alterados

1. **`src/components/layout/AppSidebar.tsx`** - Remover texto, centralizar logo, aumentar tamanho
2. **`src/index.css`** - Ajustar variaveis de cor do sidebar (6 variaveis)

## Resultado esperado

- Header do sidebar: apenas a logo centralizada, sem texto
- Nome do usuario aparece apenas no bloco "Perfil" no footer
- Sidebar com fundo mais escuro/profundo que destaca o dourado da logo
