-- Habilitar realtime para user_permissions e user_roles
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_permissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;