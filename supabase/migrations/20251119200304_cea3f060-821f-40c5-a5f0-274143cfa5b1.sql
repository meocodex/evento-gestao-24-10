-- Passo 1: Deletar profile órfão específico e suas associações
DELETE FROM user_permissions 
WHERE user_id = '16a265e7-7779-44c5-9b0a-ef837aeadfb5';

DELETE FROM user_roles 
WHERE user_id = '16a265e7-7779-44c5-9b0a-ef837aeadfb5';

DELETE FROM profiles 
WHERE id = '16a265e7-7779-44c5-9b0a-ef837aeadfb5' 
  AND NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = profiles.id
  );

-- Passo 2: Atualizar função handle_new_user para detectar e reutilizar profiles órfãos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _cpf TEXT;
  _existing_profile_id UUID;
BEGIN
  -- Extrair CPF do metadata
  _cpf := NEW.raw_user_meta_data->>'cpf';
  
  -- Se CPF existe, verificar se há profile órfão com esse CPF
  IF _cpf IS NOT NULL THEN
    SELECT id INTO _existing_profile_id
    FROM profiles
    WHERE cpf = _cpf
      AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = profiles.id)
    LIMIT 1;
    
    -- Se encontrou profile órfão, atualizar ao invés de inserir
    IF _existing_profile_id IS NOT NULL THEN
      UPDATE profiles
      SET 
        id = NEW.id,
        nome = COALESCE(NEW.raw_user_meta_data->>'nome', nome),
        email = NEW.email,
        telefone = COALESCE(NEW.raw_user_meta_data->>'telefone', telefone),
        updated_at = NOW()
      WHERE id = _existing_profile_id;
      
      -- Atualizar referências de roles e permissions
      UPDATE user_roles SET user_id = NEW.id WHERE user_id = _existing_profile_id;
      UPDATE user_permissions SET user_id = NEW.id WHERE user_id = _existing_profile_id;
      
      RETURN NEW;
    END IF;
  END IF;
  
  -- Se não há profile órfão, criar novo normalmente
  INSERT INTO profiles (id, nome, email, telefone, cpf)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    NEW.email,
    NEW.raw_user_meta_data->>'telefone',
    _cpf
  )
  ON CONFLICT (cpf) DO UPDATE
  SET 
    id = EXCLUDED.id,
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    telefone = EXCLUDED.telefone,
    updated_at = NOW();
  
  -- Apenas o primeiro usuário do sistema é admin automaticamente
  IF (SELECT COUNT(*) FROM user_roles) = 0 THEN
    INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  
  RETURN NEW;
END;
$function$;