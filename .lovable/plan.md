

# Corrigir Categorias Compartilhadas Entre Usuarios

## Problema

As categorias do sistema sao configuracoes globais (despesas, estoque, demandas, funcoes_equipe) que deveriam ser compartilhadas entre todos os usuarios com permissao. Porem, o codigo frontend filtra por `user_id`, fazendo com que cada usuario so veja as categorias que ele mesmo criou.

Exemplo: stevan cria a categoria "Marketing" em despesas. O usuario financeiro nunca a ve porque o frontend busca apenas categorias com `user_id = financeiro_id`.

## Causa Raiz

1. **useCategoriasQueries.ts (linha 17):** `.eq('user_id', userId)` - filtra categorias pelo usuario logado
2. **useCategoriasMutations.ts:** Todas as mutations salvam com `user_id` do usuario logado, criando registros isolados por usuario
3. **Tabela configuracoes_categorias:** Tem constraint UNIQUE em (user_id, tipo), forcando isolamento

## Solucao

Tornar as categorias verdadeiramente compartilhadas. Todos os usuarios com permissao de visualizar um modulo verao as mesmas categorias. Somente usuarios com permissao de `configuracoes.categorias` ou `admin.full_access` poderao gerenciar.

### Mudanca 1: useCategoriasQueries.ts

Remover o filtro `.eq('user_id', userId)`. As categorias serao buscadas por tipo, sem filtrar por usuario. A RLS ja garante que so usuarios com permissao de modulo vejam os dados.

Para evitar duplicatas (caso existam registros de multiplos usuarios), o codigo deve agregar todas as categorias unicas de todos os registros do mesmo tipo.

```text
ANTES:
  .select('*')
  .eq('user_id', userId);

DEPOIS:
  .select('*');
  // + logica para agregar categorias de todos os registros por tipo
```

A query key tambem deve mudar de `['configuracoes_categorias', userId]` para `['configuracoes_categorias']` para que o cache seja compartilhado.

### Mudanca 2: useCategoriasMutations.ts

As mutations precisam buscar e atualizar o registro correto. Ao adicionar/editar/excluir uma categoria:
1. Buscar TODOS os registros do tipo (sem filtro de user_id)
2. Se existir um registro, atualizar ele
3. Se nao existir, criar um novo com o user_id do usuario atual

Para evitar conflitos quando multiplos registros existem para o mesmo tipo (de usuarios diferentes), o codigo deve escolher um unico registro como "fonte de verdade" e atualizar apenas esse.

### Mudanca 3: Migrar dados existentes (SQL)

Criar uma migracao que:
1. Para cada tipo de categoria, mescle todas as categorias de todos os usuarios em um unico registro
2. Remova registros duplicados, mantendo apenas um por tipo
3. Altere a constraint UNIQUE de (user_id, tipo) para apenas (tipo) - ou torne user_id nullable

## Detalhes Tecnicos

### useCategoriasQueries.ts

```text
// Remover dependencia de userId na query
const { data: configuracoes, isLoading } = useQuery({
  queryKey: ['configuracoes_categorias'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('configuracoes_categorias')
      .select('*');
    if (error) throw error;
    return data || [];
  },
  staleTime: 1000 * 60 * 5,
  gcTime: 1000 * 60 * 10,
});

// getCategorias deve agregar categorias de todos os registros do mesmo tipo
const getCategorias = (tipo: TipoCategoria): Categoria[] => {
  const configs = configuracoes?.filter(c => c.tipo === tipo) || [];
  const allCategorias: Categoria[] = [];
  const seen = new Set<string>();
  for (const config of configs) {
    const cats = (config.categorias as unknown as Categoria[]) || [];
    for (const cat of cats) {
      if (!seen.has(cat.value)) {
        seen.add(cat.value);
        allCategorias.push(cat);
      }
    }
  }
  return allCategorias;
};
```

### useCategoriasMutations.ts

Em cada mutation, buscar o primeiro registro do tipo (sem filtro de user_id) para atualizar. Exemplo para `adicionarCategoria`:

```text
// Buscar primeiro registro do tipo (qualquer user_id)
const { data: config } = await supabase
  .from('configuracoes_categorias')
  .select('id, categorias, user_id')
  .eq('tipo', tipo)
  .limit(1)
  .maybeSingle();

// Se existe, atualizar esse registro
// Se nao existe, criar novo com user_id do usuario logado
```

### Migracao SQL

```text
-- Para cada tipo, mesclar categorias em um unico registro e remover duplicatas
-- Alterar constraint UNIQUE para permitir compartilhamento
```

## Sequencia de Implementacao

1. Criar migracao SQL para consolidar registros duplicados por tipo
2. Atualizar useCategoriasQueries.ts para buscar sem filtro de user_id
3. Atualizar useCategoriasMutations.ts para operar no registro compartilhado
4. Atualizar query keys em todos os componentes que referenciam userId

## Arquivos Afetados

| Arquivo | Mudanca |
|---------|---------|
| src/contexts/categorias/useCategoriasQueries.ts | Remover filtro user_id, agregar por tipo |
| src/contexts/categorias/useCategoriasMutations.ts | Buscar/atualizar registro compartilhado |
| Migracao SQL | Consolidar registros e ajustar constraint |

