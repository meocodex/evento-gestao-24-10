-- Permitir que usuários com a permissão "equipe.visualizar" consigam ver perfis, roles e permissões dos usuários
-- Sem alterar INSERT/UPDATE/DELETE

-- 1) Perfis: adicionar política de SELECT para quem tem a permissão
create policy "Users with permission can view profiles"
on public.profiles
for select
using (has_permission(auth.uid(), 'equipe.visualizar'::text));

-- 2) User roles: permitir SELECT para quem tem a mesma permissão
create policy "Users with permission can view user roles"
on public.user_roles
for select
using (has_permission(auth.uid(), 'equipe.visualizar'::text));

-- 3) User permissions: permitir SELECT para quem tem a mesma permissão
create policy "Users with permission can view user permissions"
on public.user_permissions
for select
using (has_permission(auth.uid(), 'equipe.visualizar'::text));