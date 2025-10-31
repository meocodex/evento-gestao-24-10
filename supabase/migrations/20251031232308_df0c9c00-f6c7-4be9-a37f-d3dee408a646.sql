-- Corrigir função do trigger para lidar com NULL em status_devolucao
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Corrigir dados existentes no checklist
UPDATE eventos_checklist c
SET alocado = (
  SELECT COALESCE(SUM(ema.quantidade_alocada), 0)
  FROM eventos_materiais_alocados ema
  WHERE ema.evento_id = c.evento_id
    AND ema.item_id = c.item_id
    AND (ema.status_devolucao IS NULL OR ema.status_devolucao != 'devolvido')
)
WHERE EXISTS (
  SELECT 1
  FROM eventos_materiais_alocados ema
  WHERE ema.evento_id = c.evento_id
    AND ema.item_id = c.item_id
);