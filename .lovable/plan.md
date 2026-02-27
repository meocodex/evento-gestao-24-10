

# Corrigir bug de categorias que desaparecem ao editar

## Problema Identificado

A tabela `configuracoes_categorias` tem uma constraint UNIQUE em `(user_id, tipo)`, mas o codigo das mutations e queries **nao filtra por `user_id`**. Isso causa:

1. **Queries**: Buscam categorias de TODOS os usuarios, misturando dados
2. **Mutations (editar/toggle/excluir)**: Usam `.eq('tipo', tipo).single()` sem filtrar por usuario -- com dois usuarios no sistema, o `.single()` falha ou retorna a linha errada
3. **Upsert (adicionar)**: Usa `onConflict: 'tipo'` mas a constraint e `(user_id, tipo)`, causando conflito incorreto

Resultado: ao editar uma categoria de estoque, a mutation pegou a linha errada, sobrescreveu os dados, e ambas as linhas de estoque ficaram com `categorias: []`.

## Correcoes

### 1. Restaurar categorias de estoque no banco (dados perdidos)

Restaurar as categorias padrao de estoque para os dois usuarios afetados via UPDATE direto no banco.

### 2. Corrigir `useCategoriasQueries.ts`

Adicionar filtro por `user_id` na query para buscar apenas as categorias do usuario logado:

- Usar `.eq('user_id', userId)` na query do Supabase
- Obter o `userId` do contexto de autenticacao

### 3. Corrigir `useCategoriasMutations.ts`

Em todas as mutations:

- **adicionarCategoria**: Trocar `onConflict: 'tipo'` por `onConflict: 'user_id,tipo'` e incluir `user_id` no upsert
- **editarCategoria**: Adicionar `.eq('user_id', userId)` no SELECT e UPDATE
- **toggleCategoria**: Adicionar `.eq('user_id', userId)` no SELECT e UPDATE  
- **excluirCategoria**: Adicionar `.eq('user_id', userId)` no SELECT e UPDATE
- **atualizarCategorias**: Incluir `user_id` no upsert e corrigir `onConflict`

### 4. Obter `user_id` nas mutations

Importar `useAuth` para obter o ID do usuario logado e usar em todas as operacoes de banco.

## Sequencia

1. Restaurar dados perdidos no banco
2. Corrigir queries (filtro por user_id)
3. Corrigir mutations (filtro por user_id + onConflict correto)
4. Testar criacao e edicao de categorias

