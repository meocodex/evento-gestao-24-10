-- Função que recalcula o contador de materiais alocados
CREATE OR REPLACE FUNCTION atualizar_contador_materiais_alocados()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar o contador para o evento e item_id afetado
  UPDATE eventos_checklist
  SET 
    alocado = (
      SELECT COUNT(*)
      FROM eventos_materiais_alocados
      WHERE evento_id = COALESCE(NEW.evento_id, OLD.evento_id)
        AND item_id = COALESCE(NEW.item_id, OLD.item_id)
    ),
    updated_at = now()
  WHERE evento_id = COALESCE(NEW.evento_id, OLD.evento_id)
    AND item_id = COALESCE(NEW.item_id, OLD.item_id);
    
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger que executa após INSERT, UPDATE ou DELETE
DROP TRIGGER IF EXISTS trigger_atualizar_contador_alocados ON eventos_materiais_alocados;

CREATE TRIGGER trigger_atualizar_contador_alocados
AFTER INSERT OR UPDATE OR DELETE ON eventos_materiais_alocados
FOR EACH ROW
EXECUTE FUNCTION atualizar_contador_materiais_alocados();

-- Adicionar constraint unique para impedir mesmo serial em múltiplos eventos simultaneamente
ALTER TABLE eventos_materiais_alocados
DROP CONSTRAINT IF EXISTS eventos_materiais_alocados_serial_unico;

ALTER TABLE eventos_materiais_alocados
ADD CONSTRAINT eventos_materiais_alocados_serial_unico
UNIQUE (serial);

-- Corrigir contadores existentes (one-time fix)
UPDATE eventos_checklist ec
SET alocado = (
  SELECT COUNT(*)
  FROM eventos_materiais_alocados ema
  WHERE ema.evento_id = ec.evento_id
    AND ema.item_id = ec.item_id
);