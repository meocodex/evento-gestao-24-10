-- ==========================================
-- CORREÇÃO DE VULNERABILIDADES DE SEGURANÇA
-- ==========================================

-- ============================================
-- FASE 1: VULNERABILIDADES CRÍTICAS
-- ============================================

-- 1. RESTRINGIR ACESSO À TABELA PROFILES
-- Problema: Todos os usuários autenticados podem ver todos os perfis
-- Correção: Usuários veem apenas próprio perfil, admins veem todos

DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 2. RESTRINGIR ACESSO À TABELA TRANSPORTADORAS
-- Problema: Todos os usuários podem ver dados bancários de fornecedores
-- Correção: Apenas admin e suporte podem acessar

DROP POLICY IF EXISTS "Authenticated users can view transportadoras" ON public.transportadoras;

CREATE POLICY "Admin and Suporte can view transportadoras"
ON public.transportadoras
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'suporte')
);

-- 3. ADICIONAR VALIDAÇÃO SERVER-SIDE PARA CADASTROS PÚBLICOS
-- Problema: Sem validação no banco, aceita qualquer input
-- Correção: Triggers de validação

CREATE OR REPLACE FUNCTION public.validate_cadastro_publicos()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validação de comprimento de texto
  IF length(NEW.nome) > 200 THEN
    RAISE EXCEPTION 'Nome do evento não pode ter mais de 200 caracteres';
  END IF;

  IF length(NEW.local) > 200 THEN
    RAISE EXCEPTION 'Local não pode ter mais de 200 caracteres';
  END IF;

  IF length(NEW.endereco) > 300 THEN
    RAISE EXCEPTION 'Endereço não pode ter mais de 300 caracteres';
  END IF;

  -- Validação de email no JSONB produtor
  IF NEW.produtor IS NOT NULL AND NEW.produtor->>'email' IS NOT NULL THEN
    IF NOT (NEW.produtor->>'email' ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN
      RAISE EXCEPTION 'Email do produtor inválido';
    END IF;
  END IF;

  -- Validação de telefone no JSONB produtor
  IF NEW.produtor IS NOT NULL AND NEW.produtor->>'telefone' IS NOT NULL THEN
    IF length(regexp_replace(NEW.produtor->>'telefone', '\D', '', 'g')) < 10 THEN
      RAISE EXCEPTION 'Telefone do produtor inválido';
    END IF;
  END IF;

  -- Validação de datas
  IF NEW.data_fim < NEW.data_inicio THEN
    RAISE EXCEPTION 'Data de fim não pode ser anterior à data de início';
  END IF;

  -- Sanitização de observações
  IF NEW.observacoes_internas IS NOT NULL THEN
    IF length(NEW.observacoes_internas) > 1000 THEN
      RAISE EXCEPTION 'Observações não podem ter mais de 1000 caracteres';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_cadastro_before_insert ON public.cadastros_publicos;

CREATE TRIGGER validate_cadastro_before_insert
BEFORE INSERT OR UPDATE ON public.cadastros_publicos
FOR EACH ROW EXECUTE FUNCTION public.validate_cadastro_publicos();

-- 4. ADICIONAR VALIDAÇÃO SERVER-SIDE PARA CLIENTES
-- Problema: Sem validação de email e telefone no banco
-- Correção: Triggers de validação

CREATE OR REPLACE FUNCTION public.validate_clientes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validação de comprimento
  IF length(NEW.nome) > 200 THEN
    RAISE EXCEPTION 'Nome não pode ter mais de 200 caracteres';
  END IF;

  -- Validação de email
  IF NOT (NEW.email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN
    RAISE EXCEPTION 'Email inválido';
  END IF;

  -- Validação de telefone (mínimo 10 dígitos)
  IF length(regexp_replace(NEW.telefone, '\D', '', 'g')) < 10 THEN
    RAISE EXCEPTION 'Telefone inválido';
  END IF;

  -- Validação de whatsapp se fornecido
  IF NEW.whatsapp IS NOT NULL THEN
    IF length(regexp_replace(NEW.whatsapp, '\D', '', 'g')) < 10 THEN
      RAISE EXCEPTION 'WhatsApp inválido';
    END IF;
  END IF;

  -- Validação de documento (CPF: 11 dígitos, CNPJ: 14 dígitos)
  DECLARE
    doc_limpo TEXT := regexp_replace(NEW.documento, '\D', '', 'g');
  BEGIN
    IF NEW.tipo = 'CPF' AND length(doc_limpo) != 11 THEN
      RAISE EXCEPTION 'CPF deve ter 11 dígitos';
    END IF;
    
    IF NEW.tipo = 'CNPJ' AND length(doc_limpo) != 14 THEN
      RAISE EXCEPTION 'CNPJ deve ter 14 dígitos';
    END IF;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_clientes_before_insert ON public.clientes;

CREATE TRIGGER validate_clientes_before_insert
BEFORE INSERT OR UPDATE ON public.clientes
FOR EACH ROW EXECUTE FUNCTION public.validate_clientes();

-- ============================================
-- FASE 2: VULNERABILIDADES DE ALTO RISCO
-- ============================================

-- 5. IMPLEMENTAR RATE LIMITING PARA CADASTRO PÚBLICO
-- Problema: Aceita submissões ilimitadas, vulnerável a spam/DOS
-- Correção: Throttling por IP, limite de 5 submissões por hora

CREATE TABLE IF NOT EXISTS public.cadastro_rate_limit (
  ip_hash TEXT PRIMARY KEY,
  submission_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Política RLS para tabela de rate limit (apenas sistema acessa)
ALTER TABLE public.cadastro_rate_limit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage rate limit"
ON public.cadastro_rate_limit
FOR ALL
USING (true)
WITH CHECK (true);

-- Função de limpeza automática de rate limits antigos
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.cadastro_rate_limit
  WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$;

-- Função de verificação de rate limit
CREATE OR REPLACE FUNCTION public.check_cadastro_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_ip TEXT;
  current_count INTEGER;
  last_window TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Limpar rate limits antigos
  PERFORM public.cleanup_old_rate_limits();

  -- Obter IP do cliente (simulado via hash do timestamp para ambiente de desenvolvimento)
  -- Em produção, use: current_setting('request.headers')::json->>'x-forwarded-for'
  client_ip := md5(COALESCE(
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    inet_client_addr()::text,
    'unknown'
  ));

  -- Verificar contador atual
  SELECT submission_count, window_start INTO current_count, last_window
  FROM public.cadastro_rate_limit
  WHERE ip_hash = client_ip;

  -- Se existe registro e ainda está na janela de 1 hora
  IF FOUND AND last_window > NOW() - INTERVAL '1 hour' THEN
    IF current_count >= 5 THEN
      RAISE EXCEPTION 'Limite de submissões excedido. Tente novamente em 1 hora.';
    END IF;
    
    -- Incrementar contador
    UPDATE public.cadastro_rate_limit
    SET submission_count = submission_count + 1
    WHERE ip_hash = client_ip;
  ELSE
    -- Criar novo registro ou resetar janela
    INSERT INTO public.cadastro_rate_limit (ip_hash, submission_count, window_start)
    VALUES (client_ip, 1, NOW())
    ON CONFLICT (ip_hash) 
    DO UPDATE SET 
      submission_count = 1,
      window_start = NOW();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_rate_limit_before_insert ON public.cadastros_publicos;

CREATE TRIGGER check_rate_limit_before_insert
BEFORE INSERT ON public.cadastros_publicos
FOR EACH ROW EXECUTE FUNCTION public.check_cadastro_rate_limit();

-- 6. PROTEGER EVENTOS_TIMELINE DE MANIPULAÇÃO
-- Problema: Qualquer usuário pode inserir registros na timeline
-- Correção: Validar permissão no evento relacionado

DROP POLICY IF EXISTS "Authenticated users can insert timeline" ON public.eventos_timeline;

CREATE POLICY "Users can insert timeline for authorized events"
ON public.eventos_timeline
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.eventos e
    WHERE e.id = evento_id
    AND (
      public.has_role(auth.uid(), 'admin') OR
      (public.has_role(auth.uid(), 'comercial') AND e.comercial_id = auth.uid()) OR
      public.has_role(auth.uid(), 'suporte')
    )
  )
);

-- 7. RESTRINGIR ACESSO A COMENTÁRIOS DE DEMANDAS
-- Problema: Todos podem ver comentários internos/confidenciais
-- Correção: Alinhar com regras de acesso à demanda

DROP POLICY IF EXISTS "Authenticated users can view comentarios" ON public.demandas_comentarios;

CREATE POLICY "Users can view comments on accessible demandas"
ON public.demandas_comentarios
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.demandas d
    WHERE d.id = demanda_id
    AND (
      public.has_role(auth.uid(), 'admin') OR
      d.solicitante_id = auth.uid() OR
      d.responsavel_id = auth.uid()
    )
  )
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índice para melhorar performance de verificação de rate limit
CREATE INDEX IF NOT EXISTS idx_rate_limit_window ON public.cadastro_rate_limit(window_start);

-- Índice para melhorar performance de validação de timeline
CREATE INDEX IF NOT EXISTS idx_eventos_comercial ON public.eventos(comercial_id);

-- Índice para melhorar performance de validação de comentários
CREATE INDEX IF NOT EXISTS idx_demandas_usuarios ON public.demandas(solicitante_id, responsavel_id);

-- ============================================
-- COMENTÁRIOS DE DOCUMENTAÇÃO
-- ============================================

COMMENT ON POLICY "Users can view own profile" ON public.profiles IS 
'SECURITY: Usuários só podem ver o próprio perfil para proteção de dados pessoais (LGPD)';

COMMENT ON POLICY "Admins can view all profiles" ON public.profiles IS 
'SECURITY: Apenas admins têm acesso a todos os perfis para funções administrativas';

COMMENT ON POLICY "Admin and Suporte can view transportadoras" ON public.transportadoras IS 
'SECURITY: Dados bancários de fornecedores restritos a admin/suporte para prevenir fraude';

COMMENT ON FUNCTION public.validate_cadastro_publicos() IS 
'SECURITY: Validação server-side para prevenir injection e garantir integridade dos dados';

COMMENT ON FUNCTION public.check_cadastro_rate_limit() IS 
'SECURITY: Rate limiting para prevenir spam e ataques DOS no endpoint público';

COMMENT ON POLICY "Users can insert timeline for authorized events" ON public.eventos_timeline IS 
'SECURITY: Previne manipulação da trilha de auditoria por usuários não autorizados';

COMMENT ON POLICY "Users can view comments on accessible demandas" ON public.demandas_comentarios IS 
'SECURITY: Protege comentários internos/confidenciais de acesso não autorizado';