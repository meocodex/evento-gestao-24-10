-- Corrigir trigger para NÃO inserir role automática (exceto primeiro admin)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Criar perfil
  INSERT INTO profiles (id, nome, email, telefone, cpf)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    NEW.email,
    NEW.raw_user_meta_data->>'telefone',
    NEW.raw_user_meta_data->>'cpf'
  );
  
  -- Apenas o primeiro usuário do sistema é admin automaticamente
  -- Todos os outros NÃO recebem role automática
  -- (roles serão inseridas pela edge function criar-operador)
  IF (SELECT COUNT(*) FROM user_roles) = 0 THEN
    INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  
  RETURN NEW;
END;
$function$;