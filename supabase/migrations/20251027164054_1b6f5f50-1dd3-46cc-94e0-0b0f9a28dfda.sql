-- Criar função para incrementar quantidade total
CREATE OR REPLACE FUNCTION public.increment_estoque_total(p_material_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE materiais_estoque
  SET quantidade_total = quantidade_total + 1
  WHERE id = p_material_id;
END;
$function$;

-- Criar função para decrementar quantidade total
CREATE OR REPLACE FUNCTION public.decrement_estoque_total(p_material_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE materiais_estoque
  SET quantidade_total = GREATEST(quantidade_total - 1, 0)
  WHERE id = p_material_id;
END;
$function$;

-- Corrigir dados existentes baseado nos seriais atuais
UPDATE materiais_estoque me
SET 
  quantidade_total = (
    SELECT COUNT(*) 
    FROM materiais_seriais ms 
    WHERE ms.material_id = me.id
  ),
  quantidade_disponivel = (
    SELECT COUNT(*) 
    FROM materiais_seriais ms 
    WHERE ms.material_id = me.id 
    AND ms.status = 'disponivel'
  );