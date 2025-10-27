-- ============================================================
-- TRIGGERS DE SINCRONIZAÇÃO AUTOMÁTICA DE ESTOQUE
-- ============================================================

-- ============================================================
-- TRIGGER 1: Atualizar status ao ALOCAR material
-- ============================================================
CREATE OR REPLACE FUNCTION atualizar_status_alocacao()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.serial IS NOT NULL THEN
    UPDATE materiais_seriais
    SET status = 'em-uso'::status_serial
    WHERE material_id = NEW.item_id
      AND numero = NEW.serial;
    
    UPDATE materiais_estoque
    SET quantidade_disponivel = GREATEST(0, quantidade_disponivel - 1)
    WHERE id = NEW.item_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_alocacao_material ON eventos_materiais_alocados;

CREATE TRIGGER trigger_alocacao_material
AFTER INSERT ON eventos_materiais_alocados
FOR EACH ROW
EXECUTE FUNCTION atualizar_status_alocacao();

-- ============================================================
-- TRIGGER 2: Atualizar status ao DEVOLVER material
-- ============================================================
CREATE OR REPLACE FUNCTION atualizar_status_devolucao()
RETURNS TRIGGER AS $$
DECLARE
  novo_status status_serial;
BEGIN
  IF NEW.status_devolucao IS DISTINCT FROM OLD.status_devolucao 
     AND NEW.status_devolucao != 'pendente'
     AND NEW.serial IS NOT NULL THEN
    
    novo_status := CASE NEW.status_devolucao
      WHEN 'devolvido_ok' THEN 'disponivel'::status_serial
      WHEN 'devolvido_danificado' THEN 'manutencao'::status_serial
      WHEN 'perdido' THEN 'perdido'::status_serial
      WHEN 'consumido' THEN 'consumido'::status_serial
      ELSE 'disponivel'::status_serial
    END;
    
    UPDATE materiais_seriais
    SET status = novo_status
    WHERE material_id = NEW.item_id
      AND numero = NEW.serial;
    
    IF NEW.status_devolucao = 'devolvido_ok' THEN
      UPDATE materiais_estoque
      SET quantidade_disponivel = LEAST(quantidade_total, quantidade_disponivel + 1)
      WHERE id = NEW.item_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_devolucao_material ON eventos_materiais_alocados;

CREATE TRIGGER trigger_devolucao_material
AFTER UPDATE ON eventos_materiais_alocados
FOR EACH ROW
EXECUTE FUNCTION atualizar_status_devolucao();

-- ============================================================
-- TRIGGER 3: Reverter ao REMOVER alocação
-- ============================================================
CREATE OR REPLACE FUNCTION reverter_alocacao()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status_devolucao = 'pendente' AND OLD.serial IS NOT NULL THEN
    UPDATE materiais_seriais
    SET status = 'disponivel'::status_serial
    WHERE material_id = OLD.item_id
      AND numero = OLD.serial;
    
    UPDATE materiais_estoque
    SET quantidade_disponivel = LEAST(quantidade_total, quantidade_disponivel + 1)
    WHERE id = OLD.item_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_remover_alocacao ON eventos_materiais_alocados;

CREATE TRIGGER trigger_remover_alocacao
BEFORE DELETE ON eventos_materiais_alocados
FOR EACH ROW
EXECUTE FUNCTION reverter_alocacao();

-- ============================================================
-- CORREÇÃO DE DADOS EXISTENTES
-- ============================================================

UPDATE materiais_estoque me
SET quantidade_disponivel = (
  SELECT COUNT(*)
  FROM materiais_seriais ms
  WHERE ms.material_id = me.id
    AND ms.status = 'disponivel'::status_serial
);

UPDATE materiais_seriais ms
SET status = 'em-uso'::status_serial
WHERE ms.status = 'disponivel'::status_serial
  AND EXISTS (
    SELECT 1
    FROM eventos_materiais_alocados ema
    WHERE ema.item_id = ms.material_id
      AND ema.serial = ms.numero
      AND ema.status_devolucao = 'pendente'
  );

UPDATE materiais_seriais ms
SET status = CASE 
  WHEN ema.status_devolucao = 'devolvido_ok' THEN 'disponivel'::status_serial
  WHEN ema.status_devolucao = 'devolvido_danificado' THEN 'manutencao'::status_serial
  WHEN ema.status_devolucao = 'perdido' THEN 'perdido'::status_serial
  WHEN ema.status_devolucao = 'consumido' THEN 'consumido'::status_serial
END
FROM eventos_materiais_alocados ema
WHERE ema.item_id = ms.material_id
  AND ema.serial = ms.numero
  AND ema.status_devolucao != 'pendente'
  AND ms.status = 'em-uso'::status_serial;