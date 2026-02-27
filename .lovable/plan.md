
# Adicionar Realtime em Todo o Sistema

## Problema Atual
O sistema tem um hub centralizado de realtime (`useRealtimeHub.ts`) que monitora 25 tabelas, mas:
1. **Varias tabelas importantes nao estao na publicacao realtime** do banco de dados, entao o hub nao recebe eventos delas
2. **Canais duplicados** existem em 3 arquivos (`useProfilesQueries`, `useEstoqueSeriais`, `useNotificacoes`), desperdicando conexoes WebSocket
3. **Tabelas faltando no hub**: `notificacoes`, `base_conhecimento_artigos`, `cadastros_publicos`, `eventos_cobrancas`, `contratos`, `contratos_templates`, `user_roles`, `configuracoes_empresa`, `configuracoes_taxas_pagamento`, `configuracoes_fechamento`, `materiais_historico_movimentacao`

## Solucao

### 1. Migracao SQL - Habilitar Realtime nas Tabelas Faltantes

Adicionar todas as tabelas que o sistema usa a publicacao `supabase_realtime`:

```text
ALTER PUBLICATION supabase_realtime ADD TABLE public.eventos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.demandas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.demandas_comentarios;
ALTER PUBLICATION supabase_realtime ADD TABLE public.demandas_anexos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.clientes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.equipe_operacional;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contas_pagar;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contas_receber;
ALTER PUBLICATION supabase_realtime ADD TABLE public.eventos_contratos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.eventos_despesas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.eventos_receitas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.eventos_equipe;
ALTER PUBLICATION supabase_realtime ADD TABLE public.eventos_timeline;
ALTER PUBLICATION supabase_realtime ADD TABLE public.eventos_cobrancas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transportadoras;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transportadoras_rotas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.base_conhecimento_artigos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cadastros_publicos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contratos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contratos_templates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.configuracoes_empresa;
ALTER PUBLICATION supabase_realtime ADD TABLE public.configuracoes_taxas_pagamento;
ALTER PUBLICATION supabase_realtime ADD TABLE public.configuracoes_fechamento;
ALTER PUBLICATION supabase_realtime ADD TABLE public.envios;
```

### 2. Atualizar useRealtimeHub.ts - Adicionar Tabelas Faltantes

Adicionar ao `TableName` e ao `TABLE_QUERY_MAP`:

| Tabela | Query Keys Invalidadas |
|--------|----------------------|
| `notificacoes` | `['notificacoes']` |
| `base_conhecimento_artigos` | `['base-conhecimento-artigos']`, `['base-conhecimento-categorias']` |
| `cadastros_publicos` | `['cadastros-publicos']` |
| `eventos_cobrancas` | `['eventos-cobrancas']` |
| `contratos` | `['contratos']`, `['dashboard-stats']` |
| `contratos_templates` | `['contratos-templates']` |
| `user_roles` | `['profiles-equipe']`, `['usuarios']` |
| `configuracoes_empresa` | `['configuracoes_empresa']` |
| `configuracoes_taxas_pagamento` | `['configuracoes-taxas-pagamento']` |
| `configuracoes_fechamento` | `['configuracoes_fechamento']` |
| `materiais_historico_movimentacao` | `['materiais-historico']` |

### 3. Remover Canais Duplicados

Remover os `useEffect` com `supabase.channel()` duplicados de:

- **`src/contexts/equipe/useProfilesQueries.ts`** - Remove canal `profiles-equipe-changes` (profiles, user_roles e user_permissions ja estao no hub)
- **`src/contexts/estoque/useEstoqueSeriais.ts`** - Remove canal `materiais-seriais-{id}` (materiais_seriais ja esta no hub)
- **`src/hooks/useNotificacoes.ts`** - Remove canal `notificacoes-realtime` (sera adicionado ao hub)

### Detalhes Tecnicos

**Arquivos a criar:**
- Migracao SQL para habilitar realtime

**Arquivos a modificar:**
- `src/hooks/useRealtimeHub.ts` - Adicionar 11 novas tabelas ao TypeName e TABLE_QUERY_MAP
- `src/contexts/equipe/useProfilesQueries.ts` - Remover useEffect com canal duplicado
- `src/contexts/estoque/useEstoqueSeriais.ts` - Remover useEffect com canal duplicado
- `src/hooks/useNotificacoes.ts` - Remover useEffect com canal duplicado

**Sequencia:**
1. Criar migracao SQL
2. Atualizar hub com todas as tabelas faltantes
3. Remover canais duplicados dos 3 arquivos

**Nota sobre notificacoes:** O canal de notificacoes atual usa filtro `user_id=eq.{id}` para receber apenas as do usuario logado. No hub centralizado, ele recebera eventos de todos os usuarios, mas a query ja filtra por `user_id` no `queryFn`, entao o resultado final sera o mesmo - apenas com uma invalidacao a mais que e compensada pela reducao de conexoes WebSocket.
