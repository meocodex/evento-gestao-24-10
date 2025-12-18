-- Mover extensão pg_trgm para schema dedicado 'extensions'
-- Isso previne ataques de SQL injection via search_path

-- 1. Criar schema extensions se não existir
CREATE SCHEMA IF NOT EXISTS extensions;

-- 2. Mover pg_trgm para o schema extensions
DROP EXTENSION IF EXISTS pg_trgm CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- 3. Atualizar as funções de busca para usar extensions.pg_trgm
-- As funções já usam to_tsvector que é nativo do PostgreSQL,
-- não dependem diretamente das funções do pg_trgm expostas publicamente

-- 4. Atualizar search_path das funções de busca para incluir extensions
CREATE OR REPLACE FUNCTION public.search_eventos(query_text text, limit_count integer DEFAULT 50)
RETURNS TABLE(id uuid, nome text, local text, cidade text, estado text, data_inicio date, data_fim date, status status_evento, cliente_id uuid, comercial_id uuid, rank real)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'extensions'
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
$$;

CREATE OR REPLACE FUNCTION public.search_demandas(query_text text, limit_count integer DEFAULT 50)
RETURNS TABLE(id uuid, titulo text, descricao text, status status_demanda, prioridade prioridade_demanda, categoria categoria_demanda, solicitante text, responsavel text, prazo date, rank real)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'extensions'
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
$$;

CREATE OR REPLACE FUNCTION public.search_clientes(query_text text, limit_count integer DEFAULT 50)
RETURNS TABLE(id uuid, nome text, email text, telefone text, documento text, tipo text, rank real)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.nome,
    c.email,
    c.telefone,
    c.documento,
    c.tipo,
    ts_rank(c.search_vector, websearch_to_tsquery('portuguese', query_text)) as rank
  FROM clientes c
  WHERE c.search_vector @@ websearch_to_tsquery('portuguese', query_text)
  ORDER BY rank DESC, c.nome ASC
  LIMIT limit_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.search_equipe_operacional(query_text text, limit_count integer DEFAULT 50)
RETURNS TABLE(id uuid, nome text, funcao_principal text, telefone text, email text, tipo_vinculo text, status text, rank real)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'extensions'
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
$$;