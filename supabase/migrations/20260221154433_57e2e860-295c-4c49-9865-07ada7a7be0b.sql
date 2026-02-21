
-- Adicionar colunas para observações e comprovante de pagamento
ALTER TABLE public.contas_pagar 
  ADD COLUMN IF NOT EXISTS observacoes_pagamento text,
  ADD COLUMN IF NOT EXISTS comprovante_pagamento text;

ALTER TABLE public.contas_receber 
  ADD COLUMN IF NOT EXISTS observacoes_pagamento text,
  ADD COLUMN IF NOT EXISTS comprovante_pagamento text;

-- Reescrever trigger de recorrência para contas_pagar
-- Agora gera a próxima fatura baseada na data_vencimento (não na data de pagamento)
-- E verifica se já não existe uma fatura futura para evitar duplicatas
CREATE OR REPLACE FUNCTION public.gerar_proxima_recorrencia_pagar()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  proxima_data DATE;
  ja_existe BOOLEAN;
BEGIN
  IF NEW.status = 'pago' AND OLD.status != 'pago' AND NEW.recorrencia != 'unico' THEN
    CASE NEW.recorrencia
      WHEN 'semanal' THEN
        proxima_data := NEW.data_vencimento + INTERVAL '7 days';
      WHEN 'quinzenal' THEN
        proxima_data := NEW.data_vencimento + INTERVAL '14 days';
      WHEN 'mensal' THEN
        proxima_data := NEW.data_vencimento + INTERVAL '1 month';
      WHEN 'anual' THEN
        proxima_data := NEW.data_vencimento + INTERVAL '1 year';
    END CASE;

    -- Verificar se já existe fatura com essa data de vencimento para essa recorrência
    SELECT EXISTS(
      SELECT 1 FROM contas_pagar
      WHERE recorrencia_origem_id = COALESCE(NEW.recorrencia_origem_id, NEW.id)
        AND data_vencimento = proxima_data
        AND status != 'cancelado'
    ) INTO ja_existe;

    IF NOT ja_existe THEN
      INSERT INTO contas_pagar (
        descricao, categoria, valor, quantidade, valor_unitario,
        recorrencia, data_vencimento, status, forma_pagamento,
        fornecedor, responsavel, observacoes,
        recorrencia_origem_id, created_by
      ) VALUES (
        NEW.descricao, NEW.categoria, NEW.valor, NEW.quantidade, NEW.valor_unitario,
        NEW.recorrencia, proxima_data, 'pendente', NEW.forma_pagamento,
        NEW.fornecedor, NEW.responsavel, NEW.observacoes,
        COALESCE(NEW.recorrencia_origem_id, NEW.id), NEW.created_by
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Reescrever trigger de recorrência para contas_receber
CREATE OR REPLACE FUNCTION public.gerar_proxima_recorrencia_receber()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  proxima_data DATE;
  ja_existe BOOLEAN;
BEGIN
  IF NEW.status = 'recebido' AND OLD.status != 'recebido' AND NEW.recorrencia != 'unico' THEN
    CASE NEW.recorrencia
      WHEN 'semanal' THEN
        proxima_data := NEW.data_vencimento + INTERVAL '7 days';
      WHEN 'quinzenal' THEN
        proxima_data := NEW.data_vencimento + INTERVAL '14 days';
      WHEN 'mensal' THEN
        proxima_data := NEW.data_vencimento + INTERVAL '1 month';
      WHEN 'anual' THEN
        proxima_data := NEW.data_vencimento + INTERVAL '1 year';
    END CASE;

    -- Verificar se já existe fatura com essa data de vencimento para essa recorrência
    SELECT EXISTS(
      SELECT 1 FROM contas_receber
      WHERE recorrencia_origem_id = COALESCE(NEW.recorrencia_origem_id, NEW.id)
        AND data_vencimento = proxima_data
        AND status != 'cancelado'
    ) INTO ja_existe;

    IF NOT ja_existe THEN
      INSERT INTO contas_receber (
        descricao, tipo, valor, quantidade, valor_unitario,
        recorrencia, data_vencimento, status, forma_recebimento,
        cliente, responsavel, observacoes,
        recorrencia_origem_id, created_by
      ) VALUES (
        NEW.descricao, NEW.tipo, NEW.valor, NEW.quantidade, NEW.valor_unitario,
        NEW.recorrencia, proxima_data, 'pendente', NEW.forma_recebimento,
        NEW.cliente, NEW.responsavel, NEW.observacoes,
        COALESCE(NEW.recorrencia_origem_id, NEW.id), NEW.created_by
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;
