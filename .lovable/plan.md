

# Limpeza Completa do Sistema

## O que sera feito

Apagar **todos os dados** de todas as tabelas do banco de dados, incluindo usuarios e autenticacao. Apos a limpeza, o sistema estara completamente vazio e sera necessario executar a funcao `setup-first-admin` para criar o primeiro administrador novamente.

## Ordem de execucao

A limpeza deve respeitar as dependencias entre tabelas (foreign keys). A ordem sera:

### Fase 1 - Dados dependentes (tabelas filhas)
1. `eventos_materiais_alocados`
2. `eventos_equipe`
3. `eventos_receitas`
4. `eventos_despesas`
5. `eventos_cobrancas`
6. `eventos_checklist`
7. `eventos_timeline`
8. `eventos_configuracao_historico`
9. `eventos_contratos`
10. `demandas_anexos`
11. `demandas_comentarios`
12. `materiais_historico_movimentacao` (se existir)
13. `materiais_seriais`
14. `envios`

### Fase 2 - Dados principais
15. `demandas`
16. `eventos`
17. `materiais_estoque`
18. `clientes`
19. `equipe_operacional`
20. `contratos`
21. `contratos_templates`
22. `contas_pagar`
23. `contas_receber`
24. `cadastros_publicos`
25. `transportadoras` (se existir)

### Fase 3 - Configuracoes e sistema
26. `notificacoes`
27. `configuracoes_categorias`
28. `configuracoes_usuario`
29. `configuracoes_empresa`
30. `configuracoes_fechamento`
31. `configuracoes_taxas_pagamento`
32. `audit_logs`
33. `auth_rate_limit`
34. `cadastro_rate_limit`

### Fase 4 - Usuarios e permissoes
35. `user_permissions`
36. `user_roles`
37. `profiles`
38. Deletar todos os usuarios de `auth.users` (via funcao administrativa)

## Implementacao tecnica

- Sera criada uma **edge function** chamada `limpar-sistema` que executa todas as operacoes usando `service_role` (necessario para deletar auth.users)
- A funcao sera protegida por verificacao de admin
- Apos execucao, o sistema ficara limpo e pronto para setup inicial via `setup-first-admin`

## Apos a limpeza

1. Chamar a edge function `setup-first-admin` para criar o primeiro administrador
2. Fazer login com as credenciais do novo admin
3. Comecar a cadastrar dados novamente

## Riscos

- **Acao irreversivel** - todos os dados serao permanentemente excluidos
- Arquivos no storage (avatars, documentos, etc.) tambem podem ser limpos opcionalmente
- O usuario precisara confirmar antes da execucao
