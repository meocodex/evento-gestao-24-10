-- Função para atualizar quantidade alocada no checklist
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
      AND status_devolucao != 'devolvido'
  )
  WHERE evento_id = COALESCE(NEW.evento_id, OLD.evento_id)
    AND item_id = COALESCE(NEW.item_id, OLD.item_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger em INSERT
DROP TRIGGER IF EXISTS trigger_atualizar_alocado_checklist_insert ON eventos_materiais_alocados;
CREATE TRIGGER trigger_atualizar_alocado_checklist_insert
  AFTER INSERT ON eventos_materiais_alocados
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_quantidade_alocada_checklist();

-- Aplicar trigger em UPDATE (quando muda status ou quantidade)
DROP TRIGGER IF EXISTS trigger_atualizar_alocado_checklist_update ON eventos_materiais_alocados;
CREATE TRIGGER trigger_atualizar_alocado_checklist_update
  AFTER UPDATE ON eventos_materiais_alocados
  FOR EACH ROW
  WHEN (OLD.status_devolucao IS DISTINCT FROM NEW.status_devolucao OR OLD.quantidade_alocada IS DISTINCT FROM NEW.quantidade_alocada)
  EXECUTE FUNCTION atualizar_quantidade_alocada_checklist();

-- Aplicar trigger em DELETE
DROP TRIGGER IF EXISTS trigger_atualizar_alocado_checklist_delete ON eventos_materiais_alocados;
CREATE TRIGGER trigger_atualizar_alocado_checklist_delete
  AFTER DELETE ON eventos_materiais_alocados
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_quantidade_alocada_checklist();