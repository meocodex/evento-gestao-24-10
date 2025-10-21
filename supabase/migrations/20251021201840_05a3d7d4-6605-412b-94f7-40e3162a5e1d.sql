-- =====================================================
-- ETAPA 13.7: OTIMIZAÇÃO DE DATABASE (CORRIGIDO)
-- =====================================================
-- Índices compostos, views materializadas e full-text search
-- para melhorar performance das queries principais

-- Habilitar extensão pg_trgm para busca fuzzy
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- 1. ÍNDICES COMPOSTOS PARA EVENTOS
-- =====================================================

-- Query principal: listar eventos por data e status
CREATE INDEX IF NOT EXISTS idx_eventos_data_status 
ON eventos(data_inicio DESC, status) 
WHERE status != 'cancelado';

-- Query: eventos de um cliente específico
CREATE INDEX IF NOT EXISTS idx_eventos_cliente_data 
ON eventos(cliente_id, data_inicio DESC) 
WHERE cliente_id IS NOT NULL;

-- Query: eventos de um comercial
CREATE INDEX IF NOT EXISTS idx_eventos_comercial 
ON eventos(comercial_id) 
WHERE comercial_id IS NOT NULL;

-- Query: eventos próximos (dashboard) - sem WHERE IMMUTABLE
CREATE INDEX IF NOT EXISTS idx_eventos_data_inicio 
ON eventos(data_inicio DESC);

-- =====================================================
-- 2. ÍNDICES PARA CLIENTES
-- =====================================================

-- Query: busca de clientes (ilike em nome, email, documento)
CREATE INDEX IF NOT EXISTS idx_clientes_nome_trgm 
ON clientes USING gin(nome gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_clientes_email_trgm 
ON clientes USING gin(email gin_trgm_ops);

-- Query: clientes por tipo
CREATE INDEX IF NOT EXISTS idx_clientes_tipo 
ON clientes(tipo);

-- =====================================================
-- 3. FULL-TEXT SEARCH PARA CLIENTES
-- =====================================================

-- Adicionar coluna de search vector
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Função para atualizar search vector
CREATE OR REPLACE FUNCTION clientes_search_vector_update()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('portuguese', COALESCE(NEW.nome, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.email, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.telefone, '')), 'C') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.documento, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para atualização automática
DROP TRIGGER IF EXISTS clientes_search_vector_trigger ON clientes;
CREATE TRIGGER clientes_search_vector_trigger
BEFORE INSERT OR UPDATE ON clientes
FOR EACH ROW EXECUTE FUNCTION clientes_search_vector_update();

-- Índice GIN para busca rápida
CREATE INDEX IF NOT EXISTS idx_clientes_search 
ON clientes USING gin(search_vector);

-- Popular search_vector para registros existentes
UPDATE clientes SET search_vector = 
  setweight(to_tsvector('portuguese', COALESCE(nome, '')), 'A') ||
  setweight(to_tsvector('portuguese', COALESCE(email, '')), 'B') ||
  setweight(to_tsvector('portuguese', COALESCE(telefone, '')), 'C') ||
  setweight(to_tsvector('portuguese', COALESCE(documento, '')), 'D')
WHERE search_vector IS NULL;

-- =====================================================
-- 4. ÍNDICES PARA DEMANDAS
-- =====================================================

-- Query: demandas de um evento
CREATE INDEX IF NOT EXISTS idx_demandas_evento_status 
ON demandas(evento_id, status) 
WHERE evento_id IS NOT NULL;

-- Query: demandas por responsável
CREATE INDEX IF NOT EXISTS idx_demandas_responsavel 
ON demandas(responsavel_id, status) 
WHERE responsavel_id IS NOT NULL;

-- Query: demandas urgentes/atrasadas
CREATE INDEX IF NOT EXISTS idx_demandas_prazo_status 
ON demandas(prazo, status) 
WHERE status != 'concluida' AND prazo IS NOT NULL;

-- Query: demandas por prioridade
CREATE INDEX IF NOT EXISTS idx_demandas_prioridade 
ON demandas(prioridade, status);

-- =====================================================
-- 5. ÍNDICES PARA ESTOQUE
-- =====================================================

-- Query: materiais por categoria
CREATE INDEX IF NOT EXISTS idx_materiais_categoria 
ON materiais_estoque(categoria);

-- Query: seriais por material e status
CREATE INDEX IF NOT EXISTS idx_seriais_material_status 
ON materiais_seriais(material_id, status);

-- Query: seriais disponíveis
CREATE INDEX IF NOT EXISTS idx_seriais_status 
ON materiais_seriais(status) 
WHERE status = 'disponivel';

-- =====================================================
-- 6. ÍNDICES PARA FINANCEIRO
-- =====================================================

-- Query: receitas de um evento
CREATE INDEX IF NOT EXISTS idx_receitas_evento_status 
ON eventos_receitas(evento_id, status, data DESC);

-- Query: receitas por período
CREATE INDEX IF NOT EXISTS idx_receitas_data_status 
ON eventos_receitas(data DESC, status);

-- Query: despesas de um evento
CREATE INDEX IF NOT EXISTS idx_despesas_evento_status 
ON eventos_despesas(evento_id, status, data DESC);

-- Query: despesas por período
CREATE INDEX IF NOT EXISTS idx_despesas_data_status 
ON eventos_despesas(data DESC, status);

-- Query: cobranças pendentes/atrasadas
CREATE INDEX IF NOT EXISTS idx_cobrancas_status_data 
ON eventos_cobrancas(status, created_at DESC) 
WHERE status = 'pendente';

-- =====================================================
-- 7. ÍNDICES PARA MATERIAIS ALOCADOS
-- =====================================================

-- Query: materiais alocados de um evento
CREATE INDEX IF NOT EXISTS idx_materiais_alocados_evento 
ON eventos_materiais_alocados(evento_id, status);

-- Query: materiais atrasados
CREATE INDEX IF NOT EXISTS idx_materiais_alocados_status_data 
ON eventos_materiais_alocados(status, created_at) 
WHERE status IN ('separado', 'em_transito', 'entregue');

-- =====================================================
-- 8. ÍNDICES PARA RLS POLICIES
-- =====================================================

-- Policy: eventos - comercial pode ver seus próprios eventos
CREATE INDEX IF NOT EXISTS idx_eventos_comercial_rls 
ON eventos(comercial_id) 
WHERE comercial_id IS NOT NULL;

-- Policy: user_roles - verificação de role
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role 
ON user_roles(user_id, role);

-- =====================================================
-- 9. ÍNDICES PARA TRANSPORTADORAS E ENVIOS
-- =====================================================

-- Query: envios por transportadora
CREATE INDEX IF NOT EXISTS idx_envios_transportadora 
ON envios(transportadora_id, status);

-- Query: envios por evento
CREATE INDEX IF NOT EXISTS idx_envios_evento 
ON envios(evento_id, status) 
WHERE evento_id IS NOT NULL;

-- Query: rotas de transportadora ativas
CREATE INDEX IF NOT EXISTS idx_rotas_transportadora 
ON transportadoras_rotas(transportadora_id, ativa) 
WHERE ativa = true;

-- =====================================================
-- 10. ÍNDICES PARA EQUIPE OPERACIONAL
-- =====================================================

-- Query: equipe de um evento
CREATE INDEX IF NOT EXISTS idx_eventos_equipe_evento 
ON eventos_equipe(evento_id);

-- Query: operacionais ativos
CREATE INDEX IF NOT EXISTS idx_operacional_status 
ON equipe_operacional(status) 
WHERE status = 'ativo';

-- Query: operacionais por função
CREATE INDEX IF NOT EXISTS idx_operacional_funcao 
ON equipe_operacional(funcao_principal, status);

-- =====================================================
-- 11. ANÁLISE DAS TABELAS PRINCIPAIS
-- =====================================================

-- Atualizar estatísticas das tabelas para otimizar planos de execução
ANALYZE eventos;
ANALYZE clientes;
ANALYZE demandas;
ANALYZE materiais_estoque;
ANALYZE materiais_seriais;
ANALYZE eventos_receitas;
ANALYZE eventos_despesas;
ANALYZE eventos_cobrancas;
ANALYZE eventos_materiais_alocados;