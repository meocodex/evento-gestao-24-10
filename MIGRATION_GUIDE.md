# Guia de Migração: Contexts → Hooks Diretos

## Fase 1.2 - Etapa Concluída ✅

### Padrão de Migração

#### ANTES (usando Context):
```tsx
import { useEventos } from '@/contexts/EventosContext';

function MeuComponente() {
  const { eventos, criarEvento } = useEventos();
  // ...
}
```

#### DEPOIS (usando hooks diretos):
```tsx
import { useEventosQueries, useEventosMutations } from '@/hooks/eventos';

function MeuComponente() {
  const { eventos } = useEventosQueries(1, 50);
  const { criarEvento } = useEventosMutations();
  // ...
}
```

## Hooks Disponíveis por Módulo

### Eventos
- `useEventosQueries(page, pageSize)` - Lista de eventos
- `useEventoDetalhes(eventoId)` - Detalhes de um evento
- `useEventosMutations()` - Criar, editar, deletar
- `useEventosChecklist()` - Checklist de materiais
- `useEventosMateriaisAlocados()` - Materiais alocados
- `useEventosEquipe()` - Equipe do evento
- `useEventosFinanceiro()` - Receitas e despesas
- `useEventosObservacoes()` - Observações operacionais
- `useEventosArquivos()` - Upload de arquivos
- `useEventosPropostas()` - Propostas e contratos

### Clientes
- `useClientesQueries(page, pageSize, busca)` - Lista de clientes
- `useClientesMutations()` - Criar, editar, excluir

### Demandas
- `useDemandasQueries(page, pageSize)` - Lista de demandas
- `useDemandasMutations()` - Criar, editar, excluir
- `useDemandasComentarios()` - Comentários
- `useDemandasAnexos()` - Anexos
- `useDemandasReembolsos()` - Reembolsos

### Estoque
- `useEstoqueQueries(page, pageSize, filtros)` - Lista de materiais
- `useEstoqueMutations()` - Criar, editar, excluir
- `useEstoqueSeriais()` - Gerenciar seriais

### Equipe
- `useOperacionalQueries(page, pageSize, filtros)` - Operacionais
- `useOperacionalMutations()` - Criar, editar, deletar
- `useConflitosEquipe()` - Verificar conflitos de datas
- `useProfilesQueries()` - Profiles do sistema

### Transportadoras
- `useTransportadorasQueries(page, pageSize, filtros)` - Transportadoras
- `useEnviosQueries(page, pageSize, filtros)` - Envios

### Financeiro
- `useContasPagar()` - Contas a pagar (CRUD + marcar pago)
- `useContasReceber()` - Contas a receber (CRUD + marcar recebido)
- `useUploadAnexos()` - Upload de anexos financeiros

---

## Trabalho de Tipagem - Batches 1-32 ✅

### Resumo Executivo

| Métrica | Valor |
|---------|-------|
| **Total de Batches** | 32 |
| **Ocorrências de `any` substituídas** | ~260+ |
| **Arquivos modificados** | ~80 |
| **Interfaces/Tipos criados** | ~40 |
| **Regra ESLint adicionada** | `@typescript-eslint/no-explicit-any: 'error'` |

### Interfaces e Tipos Criados

#### Eventos (`src/types/eventos.ts`)
```typescript
// PDF/AutoTable
interface AutoTableOutput { finalY: number; }
interface AutoTableDocument extends jsPDF {
  lastAutoTable: AutoTableOutput;
  autoTable: (options: AutoTableOptions) => void;
}

// Configurações de empresa
interface EmpresaConfig {
  nome?: string;
  endereco?: EnderecoEmpresa;
  telefone?: string;
  email?: string;
  cnpj?: string;
}

// Conflitos de equipe
interface EventoConflitoJoin {
  id: string;
  nome: string;
  data_inicio: string;
  data_fim: string;
}

// Alocação com dados do evento
interface AlocacaoComEvento {
  id: string;
  evento_id: string;
  item_id: string;
  status: string;
  quantidade_alocada: number | null;
  eventos: { nome: string } | null;
}

// Endereços
interface EnderecoCliente {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

interface EnderecoEmpresa {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}
```

#### Financeiro (`src/types/financeiro.ts`)
```typescript
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

interface StatusBadgeConfig {
  variant: BadgeVariant;
  label: string;
}
```

#### Demandas (`src/types/demandas.ts`)
```typescript
interface DemandasQueryData {
  demandas: Demanda[];
  total: number;
}
```

#### Equipe (`src/types/equipe.ts`)
```typescript
interface MembroParaOperacional {
  id: string;
  nome: string;
  telefone: string;
  funcao: string;
  whatsapp?: string;
}

interface EquipeEventoMembro {
  id: string;
  nome: string;
  telefone: string;
  funcao: string;
  whatsapp?: string | null;
  operacional_id?: string | null;
}
```

#### Estoque (`src/types/estoque.ts`)
```typescript
interface MaterialValidado {
  id: string;
  nome: string;
  categoria: string;
  tipo_controle: string;
  quantidade_total: number;
  quantidade_disponivel: number;
  valor_unitario?: number | null;
  descricao?: string | null;
  foto?: string | null;
}

interface EstoqueContextType {
  materiais: MaterialEstoque[];
  isLoading: boolean;
  adicionarMaterial: UseMutationResult<...>;
  // ... outras mutations
}

type TipoOperacaoEstoque = 'entrada' | 'saida' | 'ajuste' | 'alocacao' | 'devolucao' | 'transferencia';
```

#### Utilitários (`src/types/utils.ts`)
```typescript
interface DatabaseError {
  message?: string;
  code?: string;
  details?: string;
}

function getErrorMessage(error: DatabaseError | unknown): string;
```

#### Error Handler (`src/lib/errors/errorHandler.ts`)
```typescript
interface SupabaseError {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
}
```

#### Status de Estoque (`src/lib/estoqueStatus.ts`)
```typescript
type StatusSerialDB = 'disponivel' | 'alocado' | 'em_manutencao' | 'baixado';
```

---

### Padrões de Tipagem Adotados

#### 1. Error Handling com Type Guards
```typescript
// ❌ ANTES
} catch (error: any) {
  toast.error(error.message);
}

// ✅ DEPOIS
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Erro desconhecido';
  toast.error(message);
}
```

#### 2. Callbacks com Tipagem Explícita
```typescript
// ❌ ANTES
items.map((item) => item.value)
items.filter((item) => item.active)
items.reduce((acc, item) => acc + item.value, 0)

// ✅ DEPOIS
items.map((item: ItemType) => item.value)
items.filter((item: ItemType) => item.active)
items.reduce((acc: number, item: ItemType) => acc + item.value, 0)
```

#### 3. Query Data com Interfaces Específicas
```typescript
// ❌ ANTES
queryClient.setQueriesData(['demandas'], (old: any) => {
  return { ...old, demandas: [...old.demandas, newDemanda] };
});

// ✅ DEPOIS
interface DemandasQueryData {
  demandas: Demanda[];
  total: number;
}

queryClient.setQueriesData<DemandasQueryData>(['demandas'], (old) => {
  if (!old) return old;
  return { ...old, demandas: [...old.demandas, newDemanda] };
});
```

#### 4. Wrapper para Bibliotecas Externas
```typescript
// Para jsPDF com autoTable plugin
interface AutoTableDocument extends jsPDF {
  lastAutoTable: { finalY: number };
  autoTable: (options: AutoTableOptions) => void;
}

const doc = new jsPDF() as AutoTableDocument;
```

#### 5. Union Types para Valores Restritos
```typescript
// ❌ ANTES
const tipoOperacao: string = 'entrada';

// ✅ DEPOIS
type TipoOperacao = 'entrada' | 'saida' | 'ajuste' | 'alocacao' | 'devolucao';
const tipoOperacao: TipoOperacao = 'entrada';
```

#### 6. Tipagem de Event Handlers
```typescript
// ❌ ANTES
const handleChange = (e) => setValue(e.target.value);

// ✅ DEPOIS
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};
```

#### 7. Tipagem de Refs
```typescript
// ❌ ANTES
const inputRef = useRef(null);

// ✅ DEPOIS
const inputRef = useRef<HTMLInputElement>(null);
```

---

### Regras ESLint Configuradas

```javascript
// eslint.config.js

// Produção - Bloqueia uso de 'any'
{
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
  },
}

// Testes - Permite 'any' para flexibilidade
{
  files: [
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "**/tests/**/*",
    "**/__tests__/**/*"
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
  },
}
```

---

### Exceções Conhecidas

#### Arquivo de Override do Supabase
O arquivo `src/types/supabase-override.d.ts` contém uma declaração de módulo que requer `any`:

```typescript
declare module '@supabase/supabase-js' {
  interface SupabaseClient<...> {
    from<T extends keyof Database['public']['Tables']>(
      table: T
    ): any; // Necessário para compatibilidade
  }
}
```

**Justificativa**: Este `any` é necessário para o funcionamento correto da tipagem dinâmica do Supabase client e não pode ser substituído sem quebrar a integração.

---

### Arquivos de Teste

Os arquivos de teste (~1.200 ocorrências de `any`) foram **excluídos** da regra ESLint por design:
- Testes frequentemente precisam de mocks flexíveis
- Tipar completamente todos os mocks seria desproporcional ao benefício
- A regra `"off"` permite manutenção mais ágil dos testes

---

## Status da Migração

- ✅ Barrel exports criados para todos os módulos
- ✅ Contexts deletados
- ✅ Componentes atualizados
- ✅ Trabalho de tipagem concluído (Batches 1-32)
- ✅ ESLint configurado para prevenir novos `any`

## Boas Práticas

1. **Sempre use interfaces** para objetos complexos
2. **Prefira union types** a strings genéricas
3. **Use type guards** para narrowing de tipos
4. **Crie tipos utilitários** para padrões repetidos
5. **Documente exceções** quando `any` for inevitável
6. **Execute ESLint** antes de commits para garantir conformidade
