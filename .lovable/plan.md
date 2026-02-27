

# Fix: Erro ao criar novo usuario - constraint duplicada em configuracoes_categorias

## Problema

O erro "Database error creating new user" ocorre porque:

1. A edge function `criar-operador` chama `auth.admin.createUser()`
2. Isso dispara o trigger `handle_new_user()` que cria um profile
3. O profile criado dispara o trigger `criar_categorias_padrao()` que tenta inserir categorias com tipos 'demandas', 'estoque', 'despesas', 'funcoes_equipe'
4. A tabela `configuracoes_categorias` tem uma constraint `UNIQUE (tipo)` -- ou seja, apenas UMA linha por tipo no sistema inteiro
5. Como ja existem categorias do primeiro usuario, a insercao falha com "duplicate key value violates unique constraint"

## Solucao

A constraint unica deveria ser `UNIQUE (user_id, tipo)` em vez de `UNIQUE (tipo)`, pois cada usuario precisa ter seu proprio conjunto de categorias.

### Migracao SQL

1. Remover a constraint existente `configuracoes_categorias_tipo_key`
2. Criar nova constraint `UNIQUE (user_id, tipo)`

```sql
ALTER TABLE configuracoes_categorias 
  DROP CONSTRAINT configuracoes_categorias_tipo_key;

ALTER TABLE configuracoes_categorias 
  ADD CONSTRAINT configuracoes_categorias_user_tipo_key UNIQUE (user_id, tipo);
```

## Detalhes tecnicos

- Nenhum arquivo de codigo precisa ser alterado
- A edge function `criar-operador` ja funciona corretamente; o erro vem exclusivamente da constraint no banco
- Apos a migracao, novos usuarios poderao ser criados normalmente, cada um com suas proprias categorias

## Arquivos alterados

Apenas uma migracao SQL (nenhum arquivo de codigo modificado).

