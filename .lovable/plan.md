

# Fix: Permissao negada nas Materialized Views (403)

## Problema

As 4 materialized views do projeto (`vw_eventos_stats`, `vw_demandas_stats`, `vw_estoque_popular`, `vw_financeiro_eventos`) nao possuem permissao SELECT para o role `authenticated`. Isso causa erros 403 em todas as consultas a essas views, incluindo no Dashboard e na pagina de Eventos.

O erro "ao tentar criar um evento" provavelmente ocorre porque, apos a criacao do evento, o frontend tenta recarregar as stats e recebe 403, exibindo erro ao usuario mesmo que o evento tenha sido criado com sucesso.

## Solucao

Uma unica migracao SQL para conceder SELECT nas 4 materialized views:

```sql
GRANT SELECT ON public.vw_eventos_stats TO authenticated;
GRANT SELECT ON public.vw_demandas_stats TO authenticated;
GRANT SELECT ON public.vw_estoque_popular TO authenticated;
GRANT SELECT ON public.vw_financeiro_eventos TO authenticated;
```

## Detalhes tecnicos

- Materialized views nao herdam RLS policies -- o controle de acesso e feito via GRANT/REVOKE
- As funcoes que populam essas views (como `get_eventos_stats`) ja possuem verificacao de permissao via `has_permission()`, entao os dados ja sao filtrados adequadamente
- Nenhum arquivo de codigo precisa ser alterado
- Apos a migracao, os erros 403 desaparecem e a criacao de eventos volta a funcionar sem erros visuais

## Arquivos alterados

Apenas uma migracao SQL (nenhum arquivo de codigo modificado).

