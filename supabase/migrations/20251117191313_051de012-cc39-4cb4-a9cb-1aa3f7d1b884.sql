-- Parte 1: Limpar registro órfão específico
DELETE FROM profiles 
WHERE id = '16a265e7-7779-44c5-9b0a-ef837aeadfb5'
  AND NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = '16a265e7-7779-44c5-9b0a-ef837aeadfb5'
  );

-- Parte 2: Criar função para detectar e limpar órfãos futuros
CREATE OR REPLACE FUNCTION cleanup_orphaned_profiles()
RETURNS TABLE(deleted_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Deletar profiles sem usuário correspondente em auth.users
  WITH deleted AS (
    DELETE FROM profiles
    WHERE NOT EXISTS (
      SELECT 1 FROM auth.users WHERE id = profiles.id
    )
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER INTO v_deleted_count FROM deleted;
  
  RETURN QUERY SELECT v_deleted_count;
END;
$$;

-- Parte 3: Verificar constraint de foreign key atual
-- (apenas para informação, não altera nada)
COMMENT ON FUNCTION cleanup_orphaned_profiles() IS 
'Remove profiles órfãos (sem usuário correspondente em auth.users). Execute periodicamente para manter consistência.';