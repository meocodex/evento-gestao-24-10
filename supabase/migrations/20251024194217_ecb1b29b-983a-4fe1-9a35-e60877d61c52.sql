-- 1. Atualizar system_has_users() para consultar auth.users diretamente
CREATE OR REPLACE FUNCTION public.system_has_users()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM auth.users LIMIT 1);
$$;

-- Garantir permissões de execução
GRANT EXECUTE ON FUNCTION public.system_has_users() TO anon;
GRANT EXECUTE ON FUNCTION public.system_has_users() TO authenticated;

-- 2. Limpar registros órfãos em user_permissions
DELETE FROM public.user_permissions up
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = up.user_id);

-- 3. Limpar registros órfãos em user_roles
DELETE FROM public.user_roles ur
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = ur.user_id);

-- 4. Limpar registros órfãos em profiles
DELETE FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id);