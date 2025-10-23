# Guia de Migração: Contexts → Hooks Diretos

## Fase 1.2 - Etapa em Andamento

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

## Status da Migração

- ✅ Barrel exports criados
- ✅ Contexts deletados
- ⏳ Componentes pendentes de atualização (~60 arquivos)

## Próximos Passos

1. Atualizar páginas principais (Eventos, Clientes, Demandas, etc.)
2. Atualizar componentes de formulário
3. Atualizar componentes secundários
4. Remover console.logs de debug
