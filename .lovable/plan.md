
# Plano: Adicionar Logo + Analise de Performance Frontend

## 1. Adicionar a Logo ao Sistema

A imagem `base_logo_transparent_background2.png` sera copiada para `src/assets/logo-ticket-up.png` e utilizada em todos os locais que atualmente usam o icone gradiente com a letra "T".

### Locais a atualizar (4 arquivos):

**a) `src/components/layout/AppSidebar.tsx` (linha 125-127)**
- Substituir o `<div>` gradiente com "T" por um `<img>` importado do asset
- Sidebar colapsada: logo menor (32-40px)
- Sidebar aberta: logo com texto ao lado

**b) `src/pages/Auth.tsx` (linhas 190-193 e 347-350)**
- Tela de login: substituir icone "T" pela logo real
- Tela de setup inicial: mesma substituicao
- Manter o texto "Ticket Up" ao lado

**c) `src/components/cadastro/CadastroEventoHeader.tsx` (linhas 8-11)**
- Substituir icone "T" pela logo real na pagina publica de cadastro

**d) `public/favicon.svg`**
- Nao sera alterado (favicon continua com "T" estilizado pois a logo complexa nao funciona bem em 32x32)

---

## 2. Analise de Performance e Transicoes do Frontend

### O que ja esta BEM implementado:

1. **Code Splitting** - Todas as 15+ paginas usam `React.lazy()` com `Suspense`
2. **Bundle Chunking** - `vite.config.ts` com `manualChunks` separando vendor, ui, data, charts, pdf, forms, dates, dnd
3. **Compressao** - Brotli + Gzip em producao
4. **Cache** - `staleTime: 5min`, `gcTime: 30min`, persistencia em localStorage
5. **Virtualizacao** - Listas longas usam `@tanstack/react-virtual`
6. **Animacoes** - Keyframes usando apenas `opacity` e `transform` (GPU-accelerated)
7. **Prefetch inteligente** - `usePrefetchPages` com delay
8. **Skeleton loaders** - `LoadingSkeleton` com shimmer effect
9. **Navigation loading bar** - Barra de progresso baseada em queries reais

### Problemas identificados e correcoes:

**Problema 1: Transicao global em TODOS os elementos (CRITICO)**
```css
/* index.css linha 131-137 - Aplica transicao a TODOS os elementos */
* {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-duration: 300ms;
}
```
Isso causa **jank** em scroll e interacoes rapidas porque o navegador calcula transicoes para centenas de elementos simultaneamente. Deve ser removido e aplicado apenas onde necessario (tema toggle).

**Problema 2: Transicao duplicada em cards/borders**
```css
/* index.css linha 179-183 - Seletor muito amplo */
[class*="card"], [class*="bg-"], [class*="border"] { ... }
```
Este seletor captura praticamente todos os elementos da pagina. Deve ser removido.

**Problema 3: `NavigationLoadingBar` duplicada**
- Renderizada em `App.tsx` (linha 153) E em `MainLayout.tsx` (linha 29)
- Causa duas barras de loading simultaneas
- Remover a instancia de `App.tsx`

**Problema 4: `PageTransition` nao utilizado**
- O componente `PageTransition.tsx` existe mas nao e usado em nenhum lugar
- O `MainLayout` usa apenas `animate-page-enter` diretamente
- Pode ser removido para reduzir bundle

**Problema 5: Performance monitor tracking impreciso**
- Em `AppProviders.tsx` linha 29: `Date.now() - query.state.dataUpdatedAt` nao mede duracao real da query, mede tempo desde ultima atualizacao
- Nao impacta o usuario mas gera metricas incorretas

### Correcoes a implementar:

| Correcao | Impacto |
|----------|---------|
| Remover `transition` do seletor `*` | Alto - elimina jank em scroll |
| Remover seletor `[class*="bg-"]` | Alto - reduz recalculos de estilo |
| Remover `NavigationLoadingBar` duplicada | Medio - evita renders duplicados |
| Remover `PageTransition.tsx` nao usado | Baixo - reduz bundle |
| Adicionar `will-change: transform` em animacoes de pagina | Baixo - hint para GPU |

---

## Resumo de alteracoes

### Arquivos a modificar:
1. **Copiar logo** para `src/assets/logo-ticket-up.png`
2. **`src/components/layout/AppSidebar.tsx`** - usar logo real
3. **`src/pages/Auth.tsx`** - usar logo real (2 locais)
4. **`src/components/cadastro/CadastroEventoHeader.tsx`** - usar logo real
5. **`src/index.css`** - remover transicoes globais pesadas
6. **`src/App.tsx`** - remover `NavigationLoadingBar` duplicada

### Arquivo a deletar:
7. **`src/components/shared/PageTransition.tsx`** - componente nao utilizado

### Secao tecnica - CSS otimizado

O seletor `*` com transicoes sera substituido por transicoes direcionadas apenas no toggle de tema:

```css
/* Antes (RUIM) - aplica a TODOS os elementos */
* { transition: background-color 300ms, border-color 300ms, color 300ms; }

/* Depois (BOM) - apenas no toggle de tema */
html.transitioning * { transition: background-color 200ms, color 200ms; }
```

E o seletor `[class*="bg-"]` sera removido completamente, pois o Tailwind ja gera classes utilitarias com transicoes quando necessario via `transition-colors`.
