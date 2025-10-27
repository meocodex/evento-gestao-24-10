-- PARTE 1: Limpar triggers duplicados
DROP TRIGGER IF EXISTS on_admin_role_assigned ON public.user_roles;
DROP TRIGGER IF EXISTS grant_admin_permissions_trigger ON public.user_roles;
DROP TRIGGER IF EXISTS trg_grant_admin_perms ON public.user_roles;

-- PARTE 2: Criar função consolidada (idempotente)
CREATE OR REPLACE FUNCTION public.grant_all_permissions_to_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Só executa se a role for 'admin'
  IF NEW.role = 'admin' THEN
    -- Inserir todas as permissões (ON CONFLICT faz nada se já existir)
    INSERT INTO public.user_permissions (user_id, permission_id)
    SELECT NEW.user_id, p.id
    FROM public.permissions p
    ON CONFLICT (user_id, permission_id) DO NOTHING;
    
    -- Log opcional para debug
    RAISE NOTICE '✅ Concedidas permissões ao admin: %', NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- PARTE 3: Criar trigger único e definitivo
CREATE TRIGGER trg_auto_grant_admin_permissions
  AFTER INSERT OR UPDATE OF role ON public.user_roles
  FOR EACH ROW
  WHEN (NEW.role = 'admin')
  EXECUTE FUNCTION public.grant_all_permissions_to_admin();

-- PARTE 4: Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id 
  ON public.user_permissions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id 
  ON public.user_roles(user_id);

CREATE INDEX IF NOT EXISTS idx_user_permissions_lookup 
  ON public.user_permissions(user_id, permission_id);

-- PARTE 5: Backfill - garantir que todos os admins existentes tenham todas as permissões
INSERT INTO public.user_permissions (user_id, permission_id)
SELECT ur.user_id, p.id
FROM public.user_roles ur
CROSS JOIN public.permissions p
WHERE ur.role = 'admin'
ON CONFLICT (user_id, permission_id) DO NOTHING;