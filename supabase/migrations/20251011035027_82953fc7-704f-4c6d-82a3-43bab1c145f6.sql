-- Criar tabela de notificações
CREATE TABLE notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  link TEXT,
  lida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- Policy: usuários veem apenas suas notificações
CREATE POLICY "Users can view own notifications"
ON notificacoes
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: usuários podem atualizar suas notificações (marcar como lida)
CREATE POLICY "Users can update own notifications"
ON notificacoes
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: sistema pode criar notificações
CREATE POLICY "System can create notifications"
ON notificacoes
FOR INSERT
WITH CHECK (true);

-- Índice para performance
CREATE INDEX idx_notificacoes_user_id ON notificacoes(user_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes(user_id, lida);

-- Função auxiliar para criar notificação
CREATE OR REPLACE FUNCTION criar_notificacao(
  p_user_id UUID,
  p_tipo TEXT,
  p_titulo TEXT,
  p_mensagem TEXT,
  p_link TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se notificações estão habilitadas nas preferências do usuário
  IF EXISTS (
    SELECT 1 FROM configuracoes_usuario
    WHERE user_id = p_user_id
    AND (notificacoes->>'push')::boolean = true
  ) THEN
    INSERT INTO notificacoes (user_id, tipo, titulo, mensagem, link)
    VALUES (p_user_id, p_tipo, p_titulo, p_mensagem, p_link);
  END IF;
END;
$$;

-- TRIGGER 1: Nova demanda atribuída
CREATE OR REPLACE FUNCTION notificar_demanda_atribuida()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.responsavel_id IS NOT NULL AND (OLD.responsavel_id IS NULL OR OLD.responsavel_id != NEW.responsavel_id) THEN
    PERFORM criar_notificacao(
      NEW.responsavel_id,
      'demanda_atribuida',
      'Nova demanda atribuída',
      'Você foi atribuído à demanda: ' || NEW.titulo,
      '/demandas'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notificar_demanda_atribuida
AFTER UPDATE ON demandas
FOR EACH ROW
EXECUTE FUNCTION notificar_demanda_atribuida();

-- TRIGGER 2: Demanda urgente próxima do prazo (executa diariamente via cron job ou edge function)
CREATE OR REPLACE FUNCTION notificar_demandas_urgentes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  demanda RECORD;
BEGIN
  FOR demanda IN
    SELECT id, titulo, responsavel_id, prazo
    FROM demandas
    WHERE status IN ('aberta', 'em-andamento')
    AND prioridade = 'urgente'
    AND prazo IS NOT NULL
    AND prazo BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '2 days'
    AND responsavel_id IS NOT NULL
  LOOP
    PERFORM criar_notificacao(
      demanda.responsavel_id,
      'demanda_urgente',
      'Demanda urgente próxima do prazo',
      'A demanda "' || demanda.titulo || '" vence em ' || (demanda.prazo - CURRENT_DATE) || ' dia(s)',
      '/demandas'
    );
  END LOOP;
END;
$$;

-- TRIGGER 3: Aprovação/recusa de reembolso
CREATE OR REPLACE FUNCTION notificar_reembolso_processado()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.dados_reembolso IS NOT NULL AND OLD.dados_reembolso IS NULL THEN
    PERFORM criar_notificacao(
      NEW.solicitante_id,
      'reembolso_processado',
      CASE 
        WHEN (NEW.dados_reembolso->>'aprovado')::boolean THEN 'Reembolso aprovado'
        ELSE 'Reembolso recusado'
      END,
      CASE 
        WHEN (NEW.dados_reembolso->>'aprovado')::boolean THEN 
          'Seu reembolso de R$ ' || (NEW.dados_reembolso->>'valor') || ' foi aprovado'
        ELSE 
          'Seu reembolso foi recusado. Motivo: ' || COALESCE(NEW.dados_reembolso->>'motivo_recusa', 'Não informado')
      END,
      '/demandas'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notificar_reembolso_processado
AFTER UPDATE ON demandas
FOR EACH ROW
EXECUTE FUNCTION notificar_reembolso_processado();

-- TRIGGER 4: Status de evento alterado para confirmado
CREATE OR REPLACE FUNCTION notificar_evento_confirmado()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'confirmado' AND OLD.status != 'confirmado' THEN
    -- Notificar comercial responsável
    IF NEW.comercial_id IS NOT NULL THEN
      PERFORM criar_notificacao(
        NEW.comercial_id,
        'evento_confirmado',
        'Evento confirmado',
        'O evento "' || NEW.nome || '" foi confirmado',
        '/eventos'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notificar_evento_confirmado
AFTER UPDATE ON eventos
FOR EACH ROW
EXECUTE FUNCTION notificar_evento_confirmado();

-- TRIGGER 5: Material com retorno atrasado
CREATE OR REPLACE FUNCTION notificar_materiais_atrasados()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  material RECORD;
  evento RECORD;
BEGIN
  FOR material IN
    SELECT ma.*, e.nome as evento_nome, e.data_fim, e.comercial_id
    FROM eventos_materiais_alocados ma
    JOIN eventos e ON ma.evento_id = e.id
    WHERE ma.status IN ('separado', 'em_transito', 'entregue')
    AND e.status = 'finalizado'
    AND e.data_fim < CURRENT_DATE - INTERVAL '3 days'
  LOOP
    IF material.comercial_id IS NOT NULL THEN
      PERFORM criar_notificacao(
        material.comercial_id,
        'material_atrasado',
        'Material com retorno atrasado',
        'Material "' || material.nome || '" do evento "' || material.evento_nome || '" não foi devolvido',
        '/eventos'
      );
    END IF;
  END LOOP;
END;
$$;

-- TRIGGER 6: Cobranças pendentes há mais de 15 dias
CREATE OR REPLACE FUNCTION notificar_cobrancas_atrasadas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cobranca RECORD;
  evento RECORD;
  admin RECORD;
BEGIN
  FOR cobranca IN
    SELECT c.*, e.nome as evento_nome, e.comercial_id
    FROM eventos_cobrancas c
    JOIN eventos e ON c.evento_id = e.id
    WHERE c.status = 'pendente'
    AND c.created_at < NOW() - INTERVAL '15 days'
  LOOP
    -- Notificar admins
    FOR admin IN
      SELECT user_id FROM user_roles WHERE role = 'admin'
    LOOP
      PERFORM criar_notificacao(
        admin.user_id,
        'cobranca_atrasada',
        'Cobrança atrasada',
        'Cobrança de R$ ' || cobranca.valor || ' do evento "' || cobranca.evento_nome || '" pendente há mais de 15 dias',
        '/eventos'
      );
    END LOOP;
  END LOOP;
END;
$$;