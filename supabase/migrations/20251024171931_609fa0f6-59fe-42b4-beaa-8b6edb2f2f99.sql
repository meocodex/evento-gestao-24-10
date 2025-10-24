-- Garantir que o trigger aplique todas as permissões quando um usuário receber papel admin
-- 1) Dropar trigger antigo (se existir) e criar trigger novo
DROP TRIGGER IF EXISTS grant_admin_permissions_trigger ON public.user_roles;

CREATE TRIGGER grant_admin_permissions_trigger
AFTER INSERT OR UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.grant_all_permissions_to_admin();

-- 2) Backfill: reprocessar os registros atuais de admin para garantir todas as permissões
-- Isso disparará o trigger e sincronizará user_permissions
UPDATE public.user_roles
SET role = role
WHERE role = 'admin';

-- 3) Verificação opcional (comentada):
-- -- SELECT ur.user_id, COUNT(up.permission_id) AS total
-- -- FROM public.user_roles ur
-- -- LEFT JOIN public.user_permissions up ON up.user_id = ur.user_id
-- -- WHERE ur.role = 'admin'
-- -- GROUP BY ur.user_id;