-- 1. Adicionar novos valores ao enum app_role
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'operacional';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'financeiro';

-- 2. Criar função para proteger admin principal
CREATE OR REPLACE FUNCTION protect_main_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Bloquear exclusão/edição do admin@admin.com por outros usuários
  IF OLD.email = 'admin@admin.com' AND auth.uid() != OLD.id THEN
    RAISE EXCEPTION 'O administrador principal não pode ser modificado por outros usuários';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Aplicar trigger no profiles
DROP TRIGGER IF EXISTS protect_main_admin_trigger ON profiles;
CREATE TRIGGER protect_main_admin_trigger
  BEFORE UPDATE OR DELETE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION protect_main_admin();

-- 4. Comentários para documentação
COMMENT ON FUNCTION protect_main_admin() IS 'Protege o usuário admin@admin.com de ser modificado ou excluído por outros usuários';
COMMENT ON TRIGGER protect_main_admin_trigger ON profiles IS 'Aciona proteção do admin principal antes de UPDATE ou DELETE';