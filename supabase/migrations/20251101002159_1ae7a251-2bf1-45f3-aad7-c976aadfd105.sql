-- 1) Remover trigger e função legados que usam COUNT(*)
DROP TRIGGER IF EXISTS trigger_atualizar_contador_alocados ON eventos_materiais_alocados;
DROP FUNCTION IF EXISTS atualizar_contador_materiais_alocados();

-- 2) Recriar função correta com filtro consistente (apenas pendentes)
CREATE OR REPLACE FUNCTION atualizar_quantidade_alocada_checklist()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE eventos_checklist
  SET alocado = (
    SELECT COALESCE(SUM(COALESCE(quantidade_alocada, 1)), 0)
    FROM eventos_materiais_alocados
    WHERE evento_id = COALESCE(NEW.evento_id, OLD.evento_id)
      AND item_id   = COALESCE(NEW.item_id, OLD.item_id)
      AND status_devolucao = 'pendente'
  )
  WHERE evento_id = COALESCE(NEW.evento_id, OLD.evento_id)
    AND item_id   = COALESCE(NEW.item_id, OLD.item_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3) Garantir que só existam os triggers corretos
DROP TRIGGER IF EXISTS trigger_atualizar_alocado_checklist_insert ON eventos_materiais_alocados;
CREATE TRIGGER trigger_atualizar_alocado_checklist_insert
  AFTER INSERT ON eventos_materiais_alocados
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_quantidade_alocada_checklist();

DROP TRIGGER IF EXISTS trigger_atualizar_alocado_checklist_update ON eventos_materiais_alocados;
CREATE TRIGGER trigger_atualizar_alocado_checklist_update
  AFTER UPDATE ON eventos_materiais_alocados
  FOR EACH ROW
  WHEN (OLD.status_devolucao IS DISTINCT FROM NEW.status_devolucao OR
        OLD.quantidade_alocada IS DISTINCT FROM NEW.quantidade_alocada OR
        OLD.item_id IS DISTINCT FROM NEW.item_id OR
        OLD.evento_id IS DISTINCT FROM NEW.evento_id)
  EXECUTE FUNCTION atualizar_quantidade_alocada_checklist();

DROP TRIGGER IF EXISTS trigger_atualizar_alocado_checklist_delete ON eventos_materiais_alocados;
CREATE TRIGGER trigger_atualizar_alocado_checklist_delete
  AFTER DELETE ON eventos_materiais_alocados
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_quantidade_alocada_checklist();

-- 4) Correção de dados existentes (backfill)
UPDATE eventos_checklist c
SET alocado = (
  SELECT COALESCE(SUM(COALESCE(ema.quantidade_alocada, 1)), 0)
  FROM eventos_materiais_alocados ema
  WHERE ema.evento_id = c.evento_id
    AND ema.item_id   = c.item_id
    AND ema.status_devolucao = 'pendente'
)
WHERE EXISTS (
  SELECT 1
  FROM eventos_materiais_alocados ema
  WHERE ema.evento_id = c.evento_id
    AND ema.item_id   = c.item_id
);

-- 5) Índice de performance
CREATE INDEX IF NOT EXISTS idx_ema_evento_item_status
ON eventos_materiais_alocados (evento_id, item_id, status_devolucao);