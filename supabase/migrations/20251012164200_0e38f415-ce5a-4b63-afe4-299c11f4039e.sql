-- Função para decrementar estoque disponível
CREATE OR REPLACE FUNCTION public.decrement_estoque_disponivel(p_material_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE materiais_estoque
  SET quantidade_disponivel = GREATEST(0, quantidade_disponivel - 1)
  WHERE id = p_material_id;
END;
$$;

-- Função para incrementar estoque disponível
CREATE OR REPLACE FUNCTION public.increment_estoque_disponivel(p_material_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE materiais_estoque
  SET quantidade_disponivel = LEAST(quantidade_total, quantidade_disponivel + 1)
  WHERE id = p_material_id;
END;
$$;