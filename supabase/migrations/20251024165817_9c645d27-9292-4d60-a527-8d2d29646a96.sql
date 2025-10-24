-- Criar função RPC para verificar se existem usuários no sistema
-- SECURITY DEFINER permite que anon execute sem passar por RLS
CREATE OR REPLACE FUNCTION public.system_has_users()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles LIMIT 1);
$$;

-- Conceder permissão para anon e authenticated executarem a função
GRANT EXECUTE ON FUNCTION public.system_has_users() TO anon, authenticated;

-- Ajustar policies que ficaram abertas para PUBLIC
-- Recriar policies limitando acesso apenas para authenticated

-- 1. Policy para profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 2. Policy para user_roles
DROP POLICY IF EXISTS "Users with permission can view user roles" ON public.user_roles;
CREATE POLICY "Users with permission can view user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_permission(auth.uid(), 'equipe.visualizar'));

-- 3. Policy para user_permissions
DROP POLICY IF EXISTS "Users with permission can view user permissions" ON public.user_permissions;
CREATE POLICY "Users with permission can view user permissions"
ON public.user_permissions
FOR SELECT
TO authenticated
USING (has_permission(auth.uid(), 'equipe.visualizar'));