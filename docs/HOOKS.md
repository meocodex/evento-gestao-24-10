# 🔧 Guia de Arquitetura de Hooks

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Padrão de Arquitetura](#padrão-de-arquitetura)
- [Hook Unificado](#hook-unificado-padrão-principal)
- [Hooks Especializados](#hooks-especializados)
- [Convenções](#convenções)
- [Recursos Disponíveis](#recursos-disponíveis)
- [Performance e Cache](#performance-e-cache)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

Este projeto segue um padrão unificado de hooks para gerenciar dados e operações. Todos os módulos de recursos (Eventos, Clientes, Demandas, etc.) seguem a mesma arquitetura consistente.

### Objetivos do Padrão

✅ **API Consistente** - Todos os hooks seguem a mesma interface  
✅ **Fácil Manutenção** - Um lugar para atualizar comportamento  
✅ **Type Safety** - TypeScript valida uso correto  
✅ **Performance** - TanStack Query gerencia cache automaticamente  
✅ **Testabilidade** - Mocks simples de criar  
✅ **Onboarding** - Novos devs aprendem um padrão só

---

## 🏗️ Padrão de Arquitetura

### Estrutura de Pastas

```
src/
├── contexts/               # Implementações de queries e mutations
│   ├── eventos/
│   │   ├── useEventosQueries.ts      # TanStack Query - leitura
│   │   ├── useEventosMutations.ts    # TanStack Query - escrita
│   │   ├── useEventoDetalhes.ts      # Query especializada
│   │   └── transformEvento.ts        # Transformações de dados
│   ├── clientes/
│   │   ├── useClientesQueries.ts
│   │   ├── useClientesMutations.ts
│   │   └── ...
│   └── ...
│
├── hooks/                 # Wrappers unificados (API pública)
│   ├── eventos/
│   │   └── index.ts       # Hook unificado useEventos()
│   ├── clientes/
│   │   └── index.ts       # Hook unificado useClientes()
│   └── ...
```

### Separação de Responsabilidades

- **`contexts/`**: Implementação técnica com TanStack Query
- **`hooks/`**: API pública simplificada e consistente
- **Componentes**: Usam apenas hooks de `/hooks/`, nunca de `/contexts/`

---

## 🚀 Hook Unificado (Padrão Principal)

Todos os recursos seguem o mesmo padrão:

```typescript
import { useEventos } from '@/hooks/eventos';

function MeuComponente() {
  const {
    // Queries (dados)
    eventos,
    totalCount,
    loading,
    
    // Mutations (operações)
    criarEvento,
    editarEvento,
    excluirEvento,
  } = useEventos(page, pageSize, filtros);
  
  // Uso de mutations
  const handleCriar = async (dados) => {
    await criarEvento.mutateAsync(dados);
  };
  
  // Estado de loading da mutation
  if (criarEvento.isPending) {
    return <p>Salvando...</p>;
  }
  
  return <div>{/* ... */}</div>;
}
```

### Anatomia do Hook Unificado

```typescript
// src/hooks/recursos/index.ts

export function useRecursos(page?: number, pageSize?: number, filtros?: Filtros) {
  const queries = useRecursosQueries(page, pageSize, filtros);
  const mutations = useRecursosMutations();
  
  return {
    // Queries (dados)
    recursos: queries.recursos,
    totalCount: queries.totalCount,
    loading: queries.isLoading,
    error: queries.error,
    refetch: queries.refetch,
    
    // Mutations (objetos completos com mutateAsync, isPending, etc)
    criarRecurso: mutations.criarRecurso,
    editarRecurso: mutations.editarRecurso,
    excluirRecurso: mutations.excluirRecurso,
  };
}
```

### Por que Mutations são Objetos?

```typescript
// ❌ ERRADO - Mutation como função direta
const { criarEvento } = useEventos();
await criarEvento(dados); // Não expõe isPending, error, etc

// ✅ CORRETO - Mutation como objeto
const { criarEvento } = useEventos();
await criarEvento.mutateAsync(dados);
if (criarEvento.isPending) { /* mostrar loading */ }
if (criarEvento.error) { /* mostrar erro */ }
```

---

## 🎯 Hooks Especializados

Para operações específicas ou otimizações de performance, use hooks especializados.

### Eventos

```typescript
import { 
  useEventos,           // Lista paginada de eventos
  useEventoDetalhes,    // Detalhes de UM evento específico (otimizado)
  useEventosFinanceiro, // Operações financeiras de um evento
  useEventosEquipe,     // Gestão de equipe de um evento
  useEventosMateriaisAlocados, // Materiais alocados
  useEventosObservacoes,       // Observações/notas
  useEventosChecklist,         // Checklist operacional
  useEventosArquivos,          // Upload/gestão de arquivos
} from '@/hooks/eventos';

// Para listagem
const { eventos, totalCount } = useEventos(page, pageSize);

// Para detalhes (otimizado - carrega apenas 1 evento com relações)
const { data: evento, isLoading } = useEventoDetalhes(eventoId);

// Para operações financeiras
const { receitas, despesas, adicionarReceita } = useEventosFinanceiro(eventoId);
```

### Demandas

```typescript
import {
  useDemandas,            // Principal - lista de demandas
  useDemandasComentarios, // Comentários de uma demanda
  useDemandasAnexos,      // Anexos de uma demanda
  useDemandasReembolsos,  // Reembolsos de uma demanda
} from '@/hooks/demandas';

const { demandas, criarDemanda } = useDemandas();
const { comentarios, adicionarComentario } = useDemandasComentarios(demandaId);
```

### Estoque

```typescript
import {
  useEstoque,        // Principal - lista de materiais
  useEstoqueSeriais, // Números de série de materiais
} from '@/hooks/estoque';

const { materiais, adicionarMaterial } = useEstoque();
const { seriais, adicionarSerial } = useEstoqueSeriais(materialId);
```

### Equipe

```typescript
import {
  useEquipe,           // Principal - lista de operacionais
  useConflitosEquipe,  // Verificação de conflitos de agenda
} from '@/hooks/equipe';

const { operacionais, criarOperacional } = useEquipe();
const { verificarConflito } = useConflitosEquipe();
```

---

## 📐 Convenções

### ✅ DO (Fazer)

```typescript
// 1. Importar hook unificado
import { useEventos } from '@/hooks/eventos';

// 2. Usar mutation como objeto
const { criarEvento } = useEventos();
await criarEvento.mutateAsync(dados);

// 3. Verificar loading state
if (criarEvento.isPending) {
  return <Spinner />;
}

// 4. Tratar erros
if (criarEvento.error) {
  return <Error message={criarEvento.error.message} />;
}

// 5. Usar hooks especializados quando necessário
const { data: evento } = useEventoDetalhes(id); // Otimizado
```

### ❌ DON'T (Não Fazer)

```typescript
// 1. ❌ Importar queries/mutations separadas
import { useEventosQueries, useEventosMutations } from '...';

// 2. ❌ Chamar mutation como função direta
await criarEvento(dados); // ERRADO! Não expõe estados

// 3. ❌ Importar direto de contexts
import { useEventosQueries } from '@/contexts/eventos/useEventosQueries';

// 4. ❌ Usar hook genérico quando há especializado
const { eventos } = useEventos();
const evento = eventos.find(e => e.id === id); // LENTO!
// ✅ Use: useEventoDetalhes(id)

// 5. ❌ Duplicar lógica de transformação nos componentes
const formatado = formatarEvento(evento); // ERRADO!
// ✅ Transformações devem estar em /contexts/*/transform*.ts
```

---

## 📊 Recursos Disponíveis

| Recurso | Hook Principal | Hooks Especializados |
|---------|---------------|---------------------|
| **Eventos** | `useEventos()` | `useEventoDetalhes()`, `useEventosFinanceiro()`, `useEventosEquipe()`, `useEventosMateriaisAlocados()`, `useEventosObservacoes()`, `useEventosChecklist()`, `useEventosArquivos()` |
| **Demandas** | `useDemandas()` | `useDemandasComentarios()`, `useDemandasAnexos()`, `useDemandasReembolsos()` |
| **Clientes** | `useClientes()` | - |
| **Contratos** | `useContratos()` | - |
| **Estoque** | `useEstoque()` | `useEstoqueSeriais()` |
| **Equipe** | `useEquipe()` | `useConflitosEquipe()` |
| **Transportadoras** | `useTransportadoras()` | - |
| **Categorias** | `useCategorias()` | - |
| **Configurações** | `useConfiguracoes()` | - |
| **Cadastros Públicos** | `useCadastros()` | - |

---

## ⚡ Performance e Cache

TanStack Query gerencia cache automaticamente:

```typescript
// Configurado em cada hook de queries
queryKey: ['eventos', page, pageSize, filtros],
staleTime: 1000 * 60 * 5,  // 5 minutos - dados considerados "frescos"
gcTime: 1000 * 60 * 30,    // 30 minutos - tempo no cache inativo
```

### Quando o Cache é Invalidado

```typescript
// Automaticamente após mutations
const { criarEvento } = useEventos();
await criarEvento.mutateAsync(dados);
// ✅ Cache de ['eventos'] é automaticamente invalidado

// Manualmente quando necessário
const { refetch } = useEventos();
await refetch();
```

### Otimização: Hooks Especializados

```typescript
// ❌ LENTO - Carrega TODOS os eventos
const { eventos } = useEventos();
const evento = eventos.find(e => e.id === eventoId);

// ✅ RÁPIDO - Query específica com todas as relações
const { data: evento } = useEventoDetalhes(eventoId);
// SELECT * FROM eventos
// WHERE id = 'eventoId'
// JOIN timeline, checklist, equipe, materiais, receitas, despesas
```

---

## 🐛 Troubleshooting

### Problema: Mutation não está funcionando

```typescript
// ❌ Erro comum
const { criarEvento } = useEventos();
await criarEvento(dados); // TypeError: criarEvento is not a function

// ✅ Solução
await criarEvento.mutateAsync(dados);
```

### Problema: Dados desatualizados após criar/editar

```typescript
// Verificar se a mutation invalida o cache
// Em /contexts/recursos/useRecursosMutations.ts:
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['recursos'] });
}
```

### Problema: Loading infinito

```typescript
// Verificar se query está habilitada corretamente
const { data } = useEventoDetalhes(id);
// Internamente: enabled: !!id
```

### Problema: TypeScript reclamando de tipos

```typescript
// Verificar se está importando do lugar certo
import { useEventos } from '@/hooks/eventos'; // ✅ CORRETO
import { useEventos } from '@/contexts/eventos'; // ❌ ERRADO
```

### Problema: "Cannot access before initialization"

```typescript
// Verificar ordem de imports no barrel file
// ❌ Importação circular
export * from './useEventos';
export * from './useEventoDetalhes'; // Usa useEventos

// ✅ Ordem correta
export { useEventos } from './useEventos';
export { useEventoDetalhes } from './useEventoDetalhes';
```

---

## 📚 Exemplos Práticos

### Exemplo 1: Listar e Criar Eventos

```typescript
import { useEventos } from '@/hooks/eventos';

function EventosPage() {
  const { eventos, totalCount, loading, criarEvento } = useEventos(1, 20);
  
  const handleCriar = async (dados: NovoEvento) => {
    try {
      await criarEvento.mutateAsync(dados);
      toast({ title: 'Evento criado!' });
    } catch (error) {
      toast({ title: 'Erro ao criar evento', variant: 'destructive' });
    }
  };
  
  if (loading) return <Skeleton />;
  
  return (
    <div>
      <Button onClick={() => setDialogOpen(true)}>
        Criar Evento
      </Button>
      {eventos.map(evento => (
        <EventoCard key={evento.id} evento={evento} />
      ))}
    </div>
  );
}
```

### Exemplo 2: Detalhes de Evento (Otimizado)

```typescript
import { useEventoDetalhes } from '@/hooks/eventos';

function EventoDetalhesPage() {
  const { id } = useParams();
  const { data: evento, isLoading } = useEventoDetalhes(id);
  
  if (isLoading) return <LoadingSkeleton />;
  if (!evento) return <NotFound />;
  
  return (
    <div>
      <h1>{evento.nome}</h1>
      <Timeline items={evento.timeline} />
      <Checklist items={evento.checklist} />
      <Equipe membros={evento.equipe} />
      <Materiais materiais={evento.materiaisAlocados} />
      <Financeiro 
        receitas={evento.receitas}
        despesas={evento.despesas}
      />
    </div>
  );
}
```

### Exemplo 3: Operações Financeiras

```typescript
import { useEventosFinanceiro } from '@/hooks/eventos';

function FinanceiroEvento({ eventoId }: { eventoId: string }) {
  const {
    receitas,
    despesas,
    adicionarReceita,
    adicionarDespesa,
    loading,
  } = useEventosFinanceiro(eventoId);
  
  const handleAdicionarReceita = async (dados: NovaReceita) => {
    await adicionarReceita.mutateAsync(dados);
  };
  
  if (loading) return <Skeleton />;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financeiro</CardTitle>
      </CardHeader>
      <CardContent>
        <Receitas 
          receitas={receitas}
          onAdicionar={handleAdicionarReceita}
          isAdding={adicionarReceita.isPending}
        />
        <Despesas 
          despesas={despesas}
          onAdicionar={adicionarDespesa.mutateAsync}
          isAdding={adicionarDespesa.isPending}
        />
      </CardContent>
    </Card>
  );
}
```

---

## 🔄 Migração de Código Antigo

Se você encontrar código usando o padrão antigo, migre assim:

```typescript
// ❌ ANTES
import { useEventosQueries, useEventosMutations } from '@/contexts/eventos';

function MeuComponente() {
  const { eventos } = useEventosQueries();
  const { criarEvento } = useEventosMutations();
  
  await criarEvento.mutateAsync(dados);
}

// ✅ DEPOIS
import { useEventos } from '@/hooks/eventos';

function MeuComponente() {
  const { eventos, criarEvento } = useEventos();
  
  await criarEvento.mutateAsync(dados);
}
```

---

## 📝 Notas Finais

- **Sempre use hooks unificados** - Nunca importe direto de `/contexts/`
- **Mutations são objetos** - Sempre use `.mutateAsync()`
- **Use hooks especializados** - Quando precisar de performance ou features específicas
- **Confie no cache** - TanStack Query gerencia automaticamente
- **Siga as convenções** - Código consistente é código mantível

---

**Última atualização:** 2025-01-23  
**Versão:** 1.0
