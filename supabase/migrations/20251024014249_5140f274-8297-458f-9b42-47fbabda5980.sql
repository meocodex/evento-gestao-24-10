-- Criar função de busca full-text para clientes
CREATE OR REPLACE FUNCTION public.search_clientes(
  query_text TEXT,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  nome TEXT,
  email TEXT,
  telefone TEXT,
  documento TEXT,
  tipo TEXT,
  rank REAL
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
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