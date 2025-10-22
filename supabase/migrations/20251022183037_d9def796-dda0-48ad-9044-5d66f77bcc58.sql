-- RESET COMPLETO DO BANCO DE DADOS
-- ATENÇÃO: Esta operação é IRREVERSÍVEL e deleta TODOS os dados

-- 1. Deletar dados dependentes de eventos
DELETE FROM eventos_timeline;
DELETE FROM eventos_equipe;
DELETE FROM eventos_materiais_alocados;
DELETE FROM eventos_checklist;
DELETE FROM eventos_despesas;
DELETE FROM eventos_receitas;
DELETE FROM eventos_cobrancas;
DELETE FROM eventos_configuracao_historico;

-- 2. Deletar dados operacionais principais
DELETE FROM eventos;
DELETE FROM demandas_comentarios;
DELETE FROM demandas_anexos;
DELETE FROM demandas;
DELETE FROM envios;
DELETE FROM transportadoras_rotas;
DELETE FROM transportadoras;
DELETE FROM materiais_historico_localizacao;
DELETE FROM materiais_seriais;
DELETE FROM materiais_estoque;
DELETE FROM contratos;
DELETE FROM contratos_templates;
DELETE FROM cadastros_publicos;
DELETE FROM clientes;
DELETE FROM equipe_operacional;

-- 3. Deletar notificações
DELETE FROM notificacoes;

-- 4. Deletar configurações de usuário
DELETE FROM configuracoes_categorias;
DELETE FROM configuracoes_usuario;

-- 5. Deletar permissões e roles
DELETE FROM user_permissions;
DELETE FROM user_roles;

-- 6. Deletar profiles (isso vai cascatear para auth.users)
DELETE FROM profiles;

-- 7. Limpar rate limits
DELETE FROM auth_rate_limit;
DELETE FROM cadastro_rate_limit;