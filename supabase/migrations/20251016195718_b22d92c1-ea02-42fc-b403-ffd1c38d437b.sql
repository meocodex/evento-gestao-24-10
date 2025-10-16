-- Confirmar email do usuário admin existente
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'admin@admin.com'
  AND email_confirmed_at IS NULL;