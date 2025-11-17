-- Remover o profile órfão específico que não foi deletado pela função antiga
DELETE FROM public.profiles 
WHERE id = '16a265e7-7779-44c5-9b0a-ef837aeadfb5'
  AND email = 'dj_hulk54@hotmail.com';

-- Confirmar remoção
DO $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = '16a265e7-7779-44c5-9b0a-ef837aeadfb5'
  ) INTO v_exists;
  
  IF NOT v_exists THEN
    RAISE NOTICE '✅ Profile órfão removido com sucesso';
  ELSE
    RAISE WARNING '⚠️ Profile ainda existe no banco';
  END IF;
END $$;