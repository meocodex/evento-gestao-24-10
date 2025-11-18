-- Remove unique constraint from profiles.email to allow multiple profiles with same email
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_email_key;

-- Add case-insensitive index to keep lookups fast
CREATE INDEX IF NOT EXISTS idx_profiles_email_ci ON public.profiles (lower(email));