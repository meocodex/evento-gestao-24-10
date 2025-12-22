-- Corrigir função sincronizar_quantidade_disponivel para resolver ambiguidade de coluna
CREATE OR REPLACE FUNCTION public.sincronizar_quantidade_disponivel(p_material_id text DEFAULT NULL::text)
 RETURNS TABLE(material_id text, quantidade_anterior integer, quantidade_nova integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN QUERY
  WITH atualizados AS (
    UPDATE materiais_estoque me
    SET quantidade_disponivel = (
      SELECT COUNT(*)::integer
      FROM materiais_seriais ms
      WHERE ms.material_id = me.id
        AND ms.status = 'disponivel'
    )
    WHERE me.tipo_controle = 'serial'
      AND (p_material_id IS NULL OR me.id = p_material_id)
      AND quantidade_disponivel != (
        SELECT COUNT(*)::integer
        FROM materiais_seriais ms
        WHERE ms.material_id = me.id
          AND ms.status = 'disponivel'
      )
    RETURNING 
      me.id AS mat_id,
      me.quantidade_disponivel - (
        SELECT COUNT(*)::integer
        FROM materiais_seriais ms
        WHERE ms.material_id = me.id
          AND ms.status = 'disponivel'
      ) AS diff,
      (
        SELECT COUNT(*)::integer
        FROM materiais_seriais ms
        WHERE ms.material_id = me.id
          AND ms.status = 'disponivel'
      ) AS nova_qtd
  )
  SELECT 
    atualizados.mat_id::TEXT,
    (atualizados.nova_qtd - atualizados.diff)::INTEGER,
    atualizados.nova_qtd::INTEGER
  FROM atualizados;
END;
$function$;