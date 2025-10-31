-- Corrigir search_path da função do trigger
CREATE OR REPLACE FUNCTION atualizar_quantidade_alocada_checklist()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar quantidade alocada no checklist
  UPDATE eventos_checklist
  SET alocado = (
    SELECT COALESCE(SUM(quantidade_alocada), 0)
    FROM eventos_materiais_alocados
    WHERE evento_id = COALESCE(NEW.evento_id, OLD.evento_id)
      AND item_id = COALESCE(NEW.item_id, OLD.item_id)
      AND (status_devolucao IS NULL OR status_devolucao != 'devolvido')
  )
  WHERE evento_id = COALESCE(NEW.evento_id, OLD.evento_id)
    AND item_id = COALESCE(NEW.item_id, OLD.item_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;