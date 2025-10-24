-- Função para conceder todas as permissões a admins automaticamente
CREATE OR REPLACE FUNCTION public.grant_all_permissions_to_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Só executa se a role for 'admin'
  IF NEW.role = 'admin' THEN
    -- Deletar permissões existentes para evitar conflitos
    DELETE FROM public.user_permissions WHERE user_id = NEW.user_id;
    
    -- Inserir TODAS as permissões disponíveis no sistema
    INSERT INTO public.user_permissions (user_id, permission_id)
    SELECT NEW.user_id, id FROM public.permissions
    ON CONFLICT (user_id, permission_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger que executa quando uma role é inserida ou atualizada
DROP TRIGGER IF EXISTS on_admin_role_assigned ON public.user_roles;
CREATE TRIGGER on_admin_role_assigned
  AFTER INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  WHEN (NEW.role = 'admin')
  EXECUTE FUNCTION public.grant_all_permissions_to_admin();

-- Corrigir o admin atual que já existe no sistema
-- Buscar todos os usuários com role admin e garantir que tenham todas as permissões
INSERT INTO public.user_permissions (user_id, permission_id)
SELECT ur.user_id, p.id
FROM public.user_roles ur
CROSS JOIN public.permissions p
WHERE ur.role = 'admin'
ON CONFLICT (user_id, permission_id) DO NOTHING;