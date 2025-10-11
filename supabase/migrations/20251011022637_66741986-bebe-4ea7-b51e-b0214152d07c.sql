-- Função para incrementar a quantidade alocada no checklist
CREATE OR REPLACE FUNCTION public.increment_checklist_alocado(
  p_evento_id UUID,
  p_item_id TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE eventos_checklist
  SET alocado = alocado + 1
  WHERE evento_id = p_evento_id AND item_id = p_item_id;
END;
$$;

-- Função para decrementar a quantidade alocada no checklist
CREATE OR REPLACE FUNCTION public.decrement_checklist_alocado(
  p_evento_id UUID,
  p_item_id TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE eventos_checklist
  SET alocado = GREATEST(0, alocado - 1)
  WHERE evento_id = p_evento_id AND item_id = p_item_id;
END;
$$;