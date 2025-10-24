-- =====================================================
-- CORREÇÃO DE SEGURANÇA: Fase 2 Otimizações
-- =====================================================

-- Corrigir search_path nas funções de trigger
CREATE OR REPLACE FUNCTION eventos_search_trigger()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('portuguese', COALESCE(NEW.nome, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.local, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.cidade, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.estado, '')), 'C') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.observacoes, '')), 'D');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION demandas_search_trigger()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('portuguese', COALESCE(NEW.titulo, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.descricao, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.solicitante, '')), 'C');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION equipe_operacional_search_trigger()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('portuguese', COALESCE(NEW.nome, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.funcao_principal, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.telefone, '')), 'C') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.email, '')), 'C');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION refresh_eventos_stats()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY vw_eventos_stats;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION refresh_demandas_stats()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY vw_demandas_stats;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION refresh_estoque_popular()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY vw_estoque_popular;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION refresh_financeiro_eventos()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY vw_financeiro_eventos;
  RETURN NULL;
END;
$$;

-- Adicionar RLS nas views materializadas
ALTER MATERIALIZED VIEW vw_eventos_stats OWNER TO postgres;
ALTER MATERIALIZED VIEW vw_demandas_stats OWNER TO postgres;
ALTER MATERIALIZED VIEW vw_estoque_popular OWNER TO postgres;
ALTER MATERIALIZED VIEW vw_financeiro_eventos OWNER TO postgres;

-- Revogar acesso público das views materializadas
REVOKE ALL ON vw_eventos_stats FROM PUBLIC;
REVOKE ALL ON vw_demandas_stats FROM PUBLIC;
REVOKE ALL ON vw_estoque_popular FROM PUBLIC;
REVOKE ALL ON vw_financeiro_eventos FROM PUBLIC;

-- Conceder acesso apenas para usuários autenticados via authenticator
GRANT SELECT ON vw_eventos_stats TO authenticator;
GRANT SELECT ON vw_demandas_stats TO authenticator;
GRANT SELECT ON vw_estoque_popular TO authenticator;
GRANT SELECT ON vw_financeiro_eventos TO authenticator;