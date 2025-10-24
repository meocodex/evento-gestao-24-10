-- Criar trigger para conceder automaticamente todas as permissões quando um usuário recebe role=admin
-- Isso garante que futuros admins terão acesso completo sem necessidade de configuração manual

CREATE OR REPLACE TRIGGER trg_grant_admin_perms
  AFTER INSERT OR UPDATE OF role ON public.user_roles
  FOR EACH ROW
  WHEN (NEW.role = 'admin')
  EXECUTE FUNCTION public.grant_all_permissions_to_admin();
