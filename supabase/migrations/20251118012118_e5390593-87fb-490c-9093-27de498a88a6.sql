-- Remove a constraint única de email em profiles
-- Permite coexistirem perfis operacionais e perfis de usuário com o mesmo email
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_email_key;

-- Índice case-insensitive para buscas por email com performance
CREATE INDEX IF NOT EXISTS idx_profiles_email_ci ON public.profiles (lower(email));