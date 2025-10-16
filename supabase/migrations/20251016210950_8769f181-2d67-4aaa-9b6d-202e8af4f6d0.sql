-- Adicionar coluna CPF na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Adicionar constraint de unicidade
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_cpf_unique'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_cpf_unique UNIQUE (cpf);
  END IF;
END $$;

-- Adicionar validação de formato CPF (11 dígitos)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_cpf_format'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_cpf_format 
    CHECK (cpf IS NULL OR length(regexp_replace(cpf, '\D', '', 'g')) = 11);
  END IF;
END $$;

-- Atualizar trigger handle_new_user para incluir CPF e telefone
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO profiles (id, nome, email, telefone, cpf)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    NEW.email,
    NEW.raw_user_meta_data->>'telefone',
    NEW.raw_user_meta_data->>'cpf'
  );
  
  -- Primeiro usuário é admin
  IF (SELECT COUNT(*) FROM user_roles) = 0 THEN
    INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    -- Usuários seguintes são comercial por padrão
    INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'comercial');
  END IF;
  
  RETURN NEW;
END;
$function$;