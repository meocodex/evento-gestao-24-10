-- Parte 1: Corrigir quantidade_disponivel atual do MAT1
UPDATE materiais_estoque 
SET quantidade_disponivel = (
  SELECT COUNT(*) 
  FROM materiais_seriais 
  WHERE material_id = 'MAT1' AND status = 'disponivel'
)
WHERE id = 'MAT1';

-- Parte 2: Criar função de sincronização preventiva
CREATE OR REPLACE FUNCTION public.sincronizar_quantidade_disponivel(p_material_id TEXT DEFAULT NULL)
RETURNS TABLE(material_id TEXT, valor_anterior INT, valor_novo INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_material RECORD;
  v_count_disponivel INT;
BEGIN
  -- Para cada material de controle serial (ou específico)
  FOR v_material IN 
    SELECT id, quantidade_disponivel 
    FROM materiais_estoque 
    WHERE tipo_controle = 'serial'
      AND (p_material_id IS NULL OR id = p_material_id)
  LOOP
    -- Contar seriais realmente disponíveis
    SELECT COUNT(*) INTO v_count_disponivel
    FROM materiais_seriais 
    WHERE material_id = v_material.id 
      AND status = 'disponivel';
    
    -- Se diferente, atualizar e retornar resultado
    IF v_material.quantidade_disponivel != v_count_disponivel THEN
      UPDATE materiais_estoque 
      SET quantidade_disponivel = v_count_disponivel
      WHERE id = v_material.id;
      
      RETURN QUERY SELECT 
        v_material.id::TEXT, 
        v_material.quantidade_disponivel::INT, 
        v_count_disponivel::INT;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$;