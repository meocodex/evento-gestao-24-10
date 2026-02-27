

# Melhorar Contraste entre Sidebar e Logo

## Problema

O sidebar atual tem fundo navy muito escuro (HSL 225 25% 12%) e a logo dourada sobre fundo transparente se perde visualmente por falta de contraste. Ambos sao escuros/opacos.

## Solucao

Duas mudancas complementares para destacar a logo:

### 1. Adicionar glow dourado sutil atras da logo

No `src/components/layout/AppSidebar.tsx`, envolver a imagem da logo com um container que tenha um brilho radial dourado sutil, criando um "halo" que destaca a logo sem parecer artificial.

```text
Antes:  [logo sem fundo] sobre [navy escuro]  -> baixo contraste
Depois: [logo] sobre [glow dourado sutil] sobre [navy escuro]  -> logo se destaca
```

Implementacao: adicionar um `div` wrapper com `bg-gradient-radial` ou `shadow` dourado ao redor da imagem.

### 2. Aumentar levemente a luminosidade do sidebar (opcional)

No `src/index.css`, subir a luminosidade do sidebar de 12% para 15% no modo claro e de 7% para 10% no modo escuro. Isso cria mais espaco tonal entre o fundo e os elementos dourados.

**Modo Claro:**
- `--sidebar-background`: de `225 25% 12%` para `225 25% 15%`

**Modo Escuro:**
- `--sidebar-background`: de `228 30% 7%` para `228 30% 10%`

## Arquivos alterados

1. `src/components/layout/AppSidebar.tsx` - Adicionar glow/halo dourado atras da logo
2. `src/index.css` - Ajustar luminosidade do sidebar background

## Resultado esperado

A logo dourada tera um brilho sutil ao redor, criando separacao visual clara do fundo navy. O efeito sera elegante e premium, sem parecer exagerado.

