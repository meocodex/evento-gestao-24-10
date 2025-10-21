-- Tabela para rate limiting de autenticação
CREATE TABLE IF NOT EXISTS public.auth_rate_limit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- email ou IP
  attempt_type TEXT NOT NULL CHECK (attempt_type IN ('login', 'signup')),
  attempts INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index para busca rápida
CREATE INDEX IF NOT EXISTS idx_auth_rate_limit_identifier 
ON public.auth_rate_limit(identifier, attempt_type, window_start);

-- Habilitar RLS
ALTER TABLE public.auth_rate_limit ENABLE ROW LEVEL SECURITY;

-- Política: Apenas funções internas podem acessar
CREATE POLICY "Service role can manage rate limits"
ON public.auth_rate_limit
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Função para limpar rate limits antigos (janela de 15 minutos)
CREATE OR REPLACE FUNCTION public.cleanup_auth_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.auth_rate_limit
  WHERE window_start < NOW() - INTERVAL '15 minutes'
  AND (blocked_until IS NULL OR blocked_until < NOW());
END;
$$;

-- Função para verificar e registrar tentativas de autenticação
CREATE OR REPLACE FUNCTION public.check_auth_rate_limit(
  p_identifier TEXT,
  p_attempt_type TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15,
  p_block_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_attempts INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_blocked_until TIMESTAMP WITH TIME ZONE;
  v_record_exists BOOLEAN;
BEGIN
  -- Limpar rate limits antigos
  PERFORM public.cleanup_auth_rate_limits();

  -- Verificar se existe registro ativo
  SELECT 
    attempts, 
    window_start, 
    blocked_until,
    true
  INTO 
    v_current_attempts, 
    v_window_start, 
    v_blocked_until,
    v_record_exists
  FROM public.auth_rate_limit
  WHERE identifier = p_identifier
    AND attempt_type = p_attempt_type
    AND window_start > NOW() - (p_window_minutes || ' minutes')::INTERVAL
  ORDER BY window_start DESC
  LIMIT 1;

  -- Se estiver bloqueado, retornar false
  IF v_blocked_until IS NOT NULL AND v_blocked_until > NOW() THEN
    RETURN false;
  END IF;

  -- Se não existe registro ou a janela expirou, criar novo
  IF NOT v_record_exists OR v_window_start < NOW() - (p_window_minutes || ' minutes')::INTERVAL THEN
    INSERT INTO public.auth_rate_limit (identifier, attempt_type, attempts, window_start)
    VALUES (p_identifier, p_attempt_type, 1, NOW());
    RETURN true;
  END IF;

  -- Se já atingiu o máximo de tentativas, bloquear
  IF v_current_attempts >= p_max_attempts THEN
    UPDATE public.auth_rate_limit
    SET blocked_until = NOW() + (p_block_minutes || ' minutes')::INTERVAL
    WHERE identifier = p_identifier
      AND attempt_type = p_attempt_type
      AND window_start = v_window_start;
    RETURN false;
  END IF;

  -- Incrementar contador de tentativas
  UPDATE public.auth_rate_limit
  SET attempts = attempts + 1
  WHERE identifier = p_identifier
    AND attempt_type = p_attempt_type
    AND window_start = v_window_start;

  RETURN true;
END;
$$;

-- Comentários
COMMENT ON TABLE public.auth_rate_limit IS 'Rate limiting para tentativas de login e signup';
COMMENT ON FUNCTION public.check_auth_rate_limit IS 'Verifica e registra tentativas de autenticação. Retorna false se bloqueado.';
COMMENT ON FUNCTION public.cleanup_auth_rate_limits IS 'Remove registros de rate limiting expirados';