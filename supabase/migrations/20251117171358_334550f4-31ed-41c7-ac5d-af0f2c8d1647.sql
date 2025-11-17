-- Corrigir search_path da função protect_main_admin
CREATE OR REPLACE FUNCTION protect_main_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Bloquear exclusão/edição do admin@admin.com por outros usuários
  IF OLD.email = 'admin@admin.com' AND auth.uid() != OLD.id THEN
    RAISE EXCEPTION 'O administrador principal não pode ser modificado por outros usuários';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;