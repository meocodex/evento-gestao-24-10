
# Limpeza de Codigo Morto e Melhorias de Performance

## Resumo
Analise completa do codebase identificou **10 itens de codigo morto** e **3 melhorias de performance** que podem ser aplicados.

---

## 1. Arquivos Mortos para Remover

### 1.1 `src/lib/optimizations/iconImports.ts`
- Re-exporta icones do lucide-react mas **nenhum arquivo importa dele**
- Lucide-react ja faz tree-shaking nativamente via imports diretos
- **Acao**: Remover arquivo e diretorio `src/lib/optimizations/`

### 1.2 `src/hooks/useEventoPermissions.ts` + teste
- Marcado como **DEPRECATED** com documentacao extensa
- **Nenhum componente ou pagina importa este hook** (apenas seu proprio teste)
- Substituido por `usePermissions` em todo o sistema
- **Acao**: Remover `src/hooks/useEventoPermissions.ts` e `src/hooks/__tests__/useEventoPermissions.test.ts`

### 1.3 `src/hooks/useEstoqueValidation.ts`
- Hook completo com 237 linhas
- **Nenhum arquivo importa este hook** em nenhum lugar do projeto
- **Acao**: Remover arquivo

### 1.4 `src/components/shared/OptimizedImage.tsx`
- Componente de imagem otimizada com lazy loading
- **Nenhum componente importa ele** em nenhum lugar do projeto
- **Acao**: Remover arquivo

### 1.5 `src/components/shared/InfoGrid.md`
- Documentacao markdown dentro do diretorio de componentes
- Nao e importado nem referenciado por nenhum arquivo
- **Acao**: Remover (a documentacao do componente esta nos JSDoc do proprio InfoGrid.tsx)

### 1.6 `src/components/shared/sheets/__examples__/` (diretorio inteiro)
- `FormSheetWithZodExamples.tsx` - exemplos de uso com console.logs
- `TESTING_GUIDE.md` - guia de testes
- **Nenhum arquivo importa nada deste diretorio**
- **Acao**: Remover diretorio `__examples__/`

### 1.7 `src/lib/imageOptimization.ts` - funcoes nao utilizadas
- `generateSrcSet()` e `generateSizes()` - **nunca importadas** por nenhum componente (o OptimizedImage tem sua propria implementacao interna, e ele proprio sera removido)
- `convertToWebP()` e `generateBlurDataURL()` - usadas indiretamente via `optimizeImage()` que e importada em `useEventosArquivos.ts`
- **Acao**: Remover `generateSrcSet` e `generateSizes` do arquivo (manter `optimizeImage`, `isImageFile`, `validateFileSize`)

## 2. Import Morto para Limpar

### 2.1 `src/contexts/equipe/useProfilesQueries.ts`
- Importa `useEffect` do React mas **nao o utiliza** (o canal realtime duplicado foi removido mas o import ficou)
- **Acao**: Remover `import { useEffect } from 'react';` da linha 3

## 3. Melhorias de Performance

### 3.1 Remover `performanceMonitor` do QueryCache em producao
- O `performanceMonitor` em `AppProviders.tsx` roda em **cada query e mutation** (onSuccess/onError), criando objetos e armazenando ate 1000 metricas em memoria
- So e util na pagina `/performance` (ferramenta de dev)
- **Acao**: Envolver os callbacks do QueryCache/MutationCache com checagem `process.env.NODE_ENV === 'development'` para evitar overhead em producao

### 3.2 Remover `console.warn` de queries lentas em producao
- `src/lib/performance/metrics.ts` linha 60 faz `console.warn` para queries > 1s
- **Acao**: Proteger com checagem de ambiente de desenvolvimento

---

## Arquivos a Modificar
| Arquivo | Acao |
|---------|------|
| `src/lib/optimizations/iconImports.ts` | Remover |
| `src/hooks/useEventoPermissions.ts` | Remover |
| `src/hooks/__tests__/useEventoPermissions.test.ts` | Remover |
| `src/hooks/useEstoqueValidation.ts` | Remover |
| `src/components/shared/OptimizedImage.tsx` | Remover |
| `src/components/shared/InfoGrid.md` | Remover |
| `src/components/shared/sheets/__examples__/` | Remover diretorio |
| `src/lib/imageOptimization.ts` | Remover funcoes nao usadas |
| `src/contexts/equipe/useProfilesQueries.ts` | Remover import morto |
| `src/providers/AppProviders.tsx` | Otimizar performance monitor |
| `src/lib/performance/metrics.ts` | Proteger console.warn |

## Impacto Estimado
- **~600 linhas de codigo morto removidas**
- **Reducao de overhead em producao** (performance monitor nao roda desnecessariamente)
- **Bundle menor** (tree-shaking mais eficiente sem re-exports inuteis)
