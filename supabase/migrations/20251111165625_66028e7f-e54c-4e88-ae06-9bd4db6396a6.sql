-- =============================================
-- CORREÇÕES DE SEGURANÇA - FASE 1 & 3
-- =============================================

-- 1.2 Remover Materialized Views da API
REVOKE ALL ON vw_eventos_stats FROM anon, authenticated;
REVOKE ALL ON vw_demandas_stats FROM anon, authenticated;
REVOKE ALL ON vw_estoque_popular FROM anon, authenticated;
REVOKE ALL ON vw_financeiro_eventos FROM anon, authenticated;

-- Funções seguras para stats
CREATE OR REPLACE FUNCTION get_eventos_stats()
RETURNS TABLE (total_eventos BIGINT, eventos_ativos BIGINT, eventos_mes_atual BIGINT, eventos_proximos BIGINT)
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT 
    COUNT(*) as total_eventos,
    COUNT(*) FILTER (WHERE status = 'confirmado') as eventos_ativos,
    COUNT(*) FILTER (WHERE EXTRACT(MONTH FROM data_inicio) = EXTRACT(MONTH FROM CURRENT_DATE) 
                     AND EXTRACT(YEAR FROM data_inicio) = EXTRACT(YEAR FROM CURRENT_DATE)) as eventos_mes_atual,
    COUNT(*) FILTER (WHERE data_inicio BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days') as eventos_proximos
  FROM eventos
  WHERE has_permission(auth.uid(), 'eventos.visualizar') OR has_permission(auth.uid(), 'admin.full_access');
$$;

CREATE OR REPLACE FUNCTION get_demandas_stats()
RETURNS TABLE (total_demandas BIGINT, demandas_abertas BIGINT, demandas_urgentes BIGINT, demandas_vencidas BIGINT)
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT 
    COUNT(*) as total_demandas,
    COUNT(*) FILTER (WHERE status = 'aberta') as demandas_abertas,
    COUNT(*) FILTER (WHERE prioridade = 'urgente') as demandas_urgentes,
    COUNT(*) FILTER (WHERE prazo < CURRENT_DATE) as demandas_vencidas
  FROM demandas
  WHERE NOT arquivada;
$$;

CREATE OR REPLACE FUNCTION get_estoque_popular(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (material_id TEXT, nome TEXT, categoria TEXT, total_alocacoes BIGINT)
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT me.id, me.nome, me.categoria, COUNT(ema.id) as total_alocacoes
  FROM materiais_estoque me
  LEFT JOIN eventos_materiais_alocados ema ON ema.item_id = me.id
  WHERE has_permission(auth.uid(), 'estoque.visualizar') OR has_permission(auth.uid(), 'admin.full_access')
  GROUP BY me.id, me.nome, me.categoria
  ORDER BY total_alocacoes DESC LIMIT limit_count;
$$;

CREATE OR REPLACE FUNCTION get_financeiro_eventos(p_evento_id UUID DEFAULT NULL)
RETURNS TABLE (evento_id UUID, evento_nome TEXT, total_receitas NUMERIC, total_despesas NUMERIC, saldo NUMERIC)
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT e.id, e.nome, COALESCE(SUM(er.valor), 0), COALESCE(SUM(ed.valor), 0),
         COALESCE(SUM(er.valor), 0) - COALESCE(SUM(ed.valor), 0)
  FROM eventos e
  LEFT JOIN eventos_receitas er ON er.evento_id = e.id
  LEFT JOIN eventos_despesas ed ON ed.evento_id = e.id
  WHERE (p_evento_id IS NULL OR e.id = p_evento_id)
    AND (has_permission(auth.uid(), 'financeiro.visualizar') OR has_permission(auth.uid(), 'admin.full_access') 
         OR (has_permission(auth.uid(), 'financeiro.visualizar_proprios') AND e.comercial_id = auth.uid()))
  GROUP BY e.id, e.nome;
$$;

-- 1.3 Fixar search_path
ALTER FUNCTION public.refresh_eventos_stats() SET search_path = public;
ALTER FUNCTION public.refresh_demandas_stats() SET search_path = public;
ALTER FUNCTION public.refresh_estoque_popular() SET search_path = public;
ALTER FUNCTION public.refresh_financeiro_eventos() SET search_path = public;

-- 3.2 Criar Audit Log (apenas se não existir)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated
USING (has_permission(auth.uid(), 'admin.full_access'));

CREATE OR REPLACE FUNCTION log_sensitive_changes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS audit_user_roles_changes ON public.user_roles;
CREATE TRIGGER audit_user_roles_changes AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_changes();

DROP TRIGGER IF EXISTS audit_user_permissions_changes ON public.user_permissions;
CREATE TRIGGER audit_user_permissions_changes AFTER INSERT OR UPDATE OR DELETE ON public.user_permissions
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_changes();

DROP TRIGGER IF EXISTS audit_profiles_changes ON public.profiles;
CREATE TRIGGER audit_profiles_changes AFTER UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_changes();