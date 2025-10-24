-- =====================================================
-- FASE 2: OTIMIZAÇÃO DE DATABASE
-- =====================================================

-- ==================== PARTE 1: ÍNDICES COMPOSTOS ====================

-- Eventos: filtros comuns por data e status
CREATE INDEX IF NOT EXISTS idx_eventos_data_status 
ON eventos(data_inicio DESC, status) 
WHERE status != 'cancelado';

-- Eventos: por cliente
CREATE INDEX IF NOT EXISTS idx_eventos_cliente 
ON eventos(cliente_id, data_inicio DESC);

-- Eventos: por comercial
CREATE INDEX IF NOT EXISTS idx_eventos_comercial 
ON eventos(comercial_id, status, data_inicio DESC);

-- Demandas: workflow comum por responsável
CREATE INDEX IF NOT EXISTS idx_demandas_responsavel_status 
ON demandas(responsavel_id, status, prazo);

-- Demandas: por solicitante
CREATE INDEX IF NOT EXISTS idx_demandas_solicitante 
ON demandas(solicitante_id, created_at DESC);

-- Demandas: urgentes e não arquivadas
CREATE INDEX IF NOT EXISTS idx_demandas_urgentes 
ON demandas(prioridade, status, prazo) 
WHERE NOT arquivada AND prioridade = 'urgente';

-- Estoque: disponibilidade por categoria
CREATE INDEX IF NOT EXISTS idx_estoque_disponivel 
ON materiais_estoque(categoria, quantidade_disponivel) 
WHERE quantidade_disponivel > 0;

-- Timeline: ordenação por evento
CREATE INDEX IF NOT EXISTS idx_timeline_evento 
ON eventos_timeline(evento_id, created_at DESC);

-- Materiais alocados: por evento e status
CREATE INDEX IF NOT EXISTS idx_materiais_evento_status 
ON eventos_materiais_alocados(evento_id, status);

-- Equipe: por evento
CREATE INDEX IF NOT EXISTS idx_equipe_evento 
ON eventos_equipe(evento_id, data_inicio);

-- Receitas: por evento e status
CREATE INDEX IF NOT EXISTS idx_receitas_evento_status 
ON eventos_receitas(evento_id, status, data);

-- Despesas: por evento e status
CREATE INDEX IF NOT EXISTS idx_despesas_evento_status 
ON eventos_despesas(evento_id, status, data);


-- ==================== PARTE 2: FULL-TEXT SEARCH ====================

-- EVENTOS: Adicionar coluna search_vector
ALTER TABLE eventos 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Função e trigger para atualizar search_vector em eventos
CREATE OR REPLACE FUNCTION eventos_search_trigger()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('portuguese', COALESCE(NEW.nome, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.local, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.cidade, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.estado, '')), 'C') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.observacoes, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS eventos_search_update ON eventos;
CREATE TRIGGER eventos_search_update
BEFORE INSERT OR UPDATE ON eventos
FOR EACH ROW
EXECUTE FUNCTION eventos_search_trigger();

-- Índice GIN para busca em eventos
CREATE INDEX IF NOT EXISTS idx_eventos_search 
ON eventos USING GIN(search_vector);

-- Atualizar registros existentes de eventos
UPDATE eventos SET search_vector = 
  setweight(to_tsvector('portuguese', COALESCE(nome, '')), 'A') ||
  setweight(to_tsvector('portuguese', COALESCE(local, '')), 'B') ||
  setweight(to_tsvector('portuguese', COALESCE(cidade, '')), 'B') ||
  setweight(to_tsvector('portuguese', COALESCE(estado, '')), 'C') ||
  setweight(to_tsvector('portuguese', COALESCE(observacoes, '')), 'D')
WHERE search_vector IS NULL;


-- DEMANDAS: Adicionar coluna search_vector
ALTER TABLE demandas 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Função e trigger para demandas
CREATE OR REPLACE FUNCTION demandas_search_trigger()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('portuguese', COALESCE(NEW.titulo, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.descricao, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.solicitante, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS demandas_search_update ON demandas;
CREATE TRIGGER demandas_search_update
BEFORE INSERT OR UPDATE ON demandas
FOR EACH ROW
EXECUTE FUNCTION demandas_search_trigger();

CREATE INDEX IF NOT EXISTS idx_demandas_search 
ON demandas USING GIN(search_vector);

-- Atualizar registros existentes de demandas
UPDATE demandas SET search_vector = 
  setweight(to_tsvector('portuguese', COALESCE(titulo, '')), 'A') ||
  setweight(to_tsvector('portuguese', COALESCE(descricao, '')), 'B') ||
  setweight(to_tsvector('portuguese', COALESCE(solicitante, '')), 'C')
WHERE search_vector IS NULL;


-- EQUIPE OPERACIONAL: Adicionar coluna search_vector
ALTER TABLE equipe_operacional 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Função e trigger para equipe operacional
CREATE OR REPLACE FUNCTION equipe_operacional_search_trigger()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('portuguese', COALESCE(NEW.nome, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.funcao_principal, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.telefone, '')), 'C') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.email, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS equipe_operacional_search_update ON equipe_operacional;
CREATE TRIGGER equipe_operacional_search_update
BEFORE INSERT OR UPDATE ON equipe_operacional
FOR EACH ROW
EXECUTE FUNCTION equipe_operacional_search_trigger();

CREATE INDEX IF NOT EXISTS idx_equipe_operacional_search 
ON equipe_operacional USING GIN(search_vector);

-- Atualizar registros existentes de equipe operacional
UPDATE equipe_operacional SET search_vector = 
  setweight(to_tsvector('portuguese', COALESCE(nome, '')), 'A') ||
  setweight(to_tsvector('portuguese', COALESCE(funcao_principal, '')), 'B') ||
  setweight(to_tsvector('portuguese', COALESCE(telefone, '')), 'C') ||
  setweight(to_tsvector('portuguese', COALESCE(email, '')), 'C')
WHERE search_vector IS NULL;


-- FUNÇÕES DE BUSCA OTIMIZADAS

-- Função de busca para eventos
CREATE OR REPLACE FUNCTION search_eventos(
  query_text text,
  limit_count int DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  nome text,
  local text,
  cidade text,
  estado text,
  data_inicio date,
  data_fim date,
  status status_evento,
  cliente_id uuid,
  comercial_id uuid,
  rank real
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.nome,
    e.local,
    e.cidade,
    e.estado,
    e.data_inicio,
    e.data_fim,
    e.status,
    e.cliente_id,
    e.comercial_id,
    ts_rank(e.search_vector, websearch_to_tsquery('portuguese', query_text)) as rank
  FROM eventos e
  WHERE e.search_vector @@ websearch_to_tsquery('portuguese', query_text)
  ORDER BY rank DESC, e.data_inicio DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Função de busca para demandas
CREATE OR REPLACE FUNCTION search_demandas(
  query_text text,
  limit_count int DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  titulo text,
  descricao text,
  status status_demanda,
  prioridade prioridade_demanda,
  categoria categoria_demanda,
  solicitante text,
  responsavel text,
  prazo date,
  rank real
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.titulo,
    d.descricao,
    d.status,
    d.prioridade,
    d.categoria,
    d.solicitante,
    d.responsavel,
    d.prazo,
    ts_rank(d.search_vector, websearch_to_tsquery('portuguese', query_text)) as rank
  FROM demandas d
  WHERE d.search_vector @@ websearch_to_tsquery('portuguese', query_text)
    AND NOT d.arquivada
  ORDER BY rank DESC, d.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Função de busca para equipe operacional
CREATE OR REPLACE FUNCTION search_equipe_operacional(
  query_text text,
  limit_count int DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  nome text,
  funcao_principal text,
  telefone text,
  email text,
  tipo_vinculo text,
  status text,
  rank real
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.nome,
    e.funcao_principal,
    e.telefone,
    e.email,
    e.tipo_vinculo,
    e.status,
    ts_rank(e.search_vector, websearch_to_tsquery('portuguese', query_text)) as rank
  FROM equipe_operacional e
  WHERE e.search_vector @@ websearch_to_tsquery('portuguese', query_text)
  ORDER BY rank DESC, e.nome ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;


-- ==================== PARTE 3: VIEWS MATERIALIZADAS ====================

-- View: Stats de eventos para dashboard
DROP MATERIALIZED VIEW IF EXISTS vw_eventos_stats;
CREATE MATERIALIZED VIEW vw_eventos_stats AS
SELECT 
  status,
  COUNT(*) as total,
  DATE_TRUNC('month', data_inicio) as mes,
  DATE_TRUNC('week', data_inicio) as semana
FROM eventos
GROUP BY status, DATE_TRUNC('month', data_inicio), DATE_TRUNC('week', data_inicio);

CREATE UNIQUE INDEX idx_vw_eventos_stats ON vw_eventos_stats(status, mes, semana);

-- View: Stats de demandas
DROP MATERIALIZED VIEW IF EXISTS vw_demandas_stats;
CREATE MATERIALIZED VIEW vw_demandas_stats AS
SELECT
  status,
  prioridade,
  COUNT(*) as total,
  COUNT(CASE WHEN prazo IS NOT NULL AND prazo < CURRENT_DATE THEN 1 END) as atrasadas
FROM demandas
WHERE NOT arquivada
GROUP BY status, prioridade;

CREATE UNIQUE INDEX idx_vw_demandas_stats ON vw_demandas_stats(status, prioridade);

-- View: Estoque - materiais mais usados
DROP MATERIALIZED VIEW IF EXISTS vw_estoque_popular;
CREATE MATERIALIZED VIEW vw_estoque_popular AS
SELECT
  m.id,
  m.nome,
  m.categoria,
  COUNT(ma.id) as total_alocacoes,
  m.quantidade_total,
  m.quantidade_disponivel
FROM materiais_estoque m
LEFT JOIN eventos_materiais_alocados ma ON ma.item_id = m.id
GROUP BY m.id, m.nome, m.categoria, m.quantidade_total, m.quantidade_disponivel
ORDER BY total_alocacoes DESC;

CREATE UNIQUE INDEX idx_vw_estoque_popular ON vw_estoque_popular(id);

-- View: Stats financeiras por evento
DROP MATERIALIZED VIEW IF EXISTS vw_financeiro_eventos;
CREATE MATERIALIZED VIEW vw_financeiro_eventos AS
SELECT
  e.id as evento_id,
  e.nome as evento_nome,
  e.status,
  COALESCE(SUM(r.valor), 0) as total_receitas,
  COALESCE(SUM(d.valor), 0) as total_despesas,
  COALESCE(SUM(r.valor), 0) - COALESCE(SUM(d.valor), 0) as lucro,
  COUNT(DISTINCT r.id) as qtd_receitas,
  COUNT(DISTINCT d.id) as qtd_despesas
FROM eventos e
LEFT JOIN eventos_receitas r ON r.evento_id = e.id
LEFT JOIN eventos_despesas d ON d.evento_id = e.id
GROUP BY e.id, e.nome, e.status;

CREATE UNIQUE INDEX idx_vw_financeiro_eventos ON vw_financeiro_eventos(evento_id);


-- TRIGGERS PARA REFRESH AUTOMÁTICO DAS VIEWS

-- Trigger: refresh stats de eventos
CREATE OR REPLACE FUNCTION refresh_eventos_stats()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY vw_eventos_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_refresh_eventos_stats ON eventos;
CREATE TRIGGER tr_refresh_eventos_stats
AFTER INSERT OR UPDATE OR DELETE ON eventos
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_eventos_stats();

-- Trigger: refresh stats de demandas
CREATE OR REPLACE FUNCTION refresh_demandas_stats()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY vw_demandas_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_refresh_demandas_stats ON demandas;
CREATE TRIGGER tr_refresh_demandas_stats
AFTER INSERT OR UPDATE OR DELETE ON demandas
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_demandas_stats();

-- Trigger: refresh stats de estoque
CREATE OR REPLACE FUNCTION refresh_estoque_popular()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY vw_estoque_popular;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_refresh_estoque_materiais ON materiais_estoque;
CREATE TRIGGER tr_refresh_estoque_materiais
AFTER INSERT OR UPDATE OR DELETE ON materiais_estoque
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_estoque_popular();

DROP TRIGGER IF EXISTS tr_refresh_estoque_alocados ON eventos_materiais_alocados;
CREATE TRIGGER tr_refresh_estoque_alocados
AFTER INSERT OR UPDATE OR DELETE ON eventos_materiais_alocados
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_estoque_popular();

-- Trigger: refresh stats financeiras
CREATE OR REPLACE FUNCTION refresh_financeiro_eventos()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY vw_financeiro_eventos;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_refresh_financeiro_receitas ON eventos_receitas;
CREATE TRIGGER tr_refresh_financeiro_receitas
AFTER INSERT OR UPDATE OR DELETE ON eventos_receitas
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_financeiro_eventos();

DROP TRIGGER IF EXISTS tr_refresh_financeiro_despesas ON eventos_despesas;
CREATE TRIGGER tr_refresh_financeiro_despesas
AFTER INSERT OR UPDATE OR DELETE ON eventos_despesas
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_financeiro_eventos();

DROP TRIGGER IF EXISTS tr_refresh_financeiro_eventos ON eventos;
CREATE TRIGGER tr_refresh_financeiro_eventos
AFTER INSERT OR UPDATE OR DELETE ON eventos
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_financeiro_eventos();