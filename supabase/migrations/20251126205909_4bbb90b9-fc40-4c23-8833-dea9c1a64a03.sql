-- Migration para corrigir alertas de segurança do banco de dados

-- 1. Definir search_path seguro em funções existentes
-- Listar funções que não possuem search_path definido e adicionar

-- Função update_updated_at_column
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Função sincronizar_quantidade_disponivel
DROP FUNCTION IF EXISTS public.sincronizar_quantidade_disponivel(TEXT) CASCADE;
CREATE OR REPLACE FUNCTION public.sincronizar_quantidade_disponivel(p_material_id TEXT DEFAULT NULL)
RETURNS TABLE(
  material_id TEXT,
  quantidade_anterior INTEGER,
  quantidade_nova INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  WITH atualizados AS (
    UPDATE materiais_estoque me
    SET quantidade_disponivel = (
      SELECT COUNT(*)
      FROM materiais_seriais ms
      WHERE ms.material_id = me.id
        AND ms.status = 'disponivel'
    )
    WHERE me.tipo_controle = 'serial'
      AND (p_material_id IS NULL OR me.id = p_material_id)
      AND quantidade_disponivel != (
        SELECT COUNT(*)
        FROM materiais_seriais ms
        WHERE ms.material_id = me.id
          AND ms.status = 'disponivel'
      )
    RETURNING 
      me.id AS material_id,
      me.quantidade_disponivel - (
        SELECT COUNT(*)
        FROM materiais_seriais ms
        WHERE ms.material_id = me.id
          AND ms.status = 'disponivel'
      ) AS diff,
      (
        SELECT COUNT(*)
        FROM materiais_seriais ms
        WHERE ms.material_id = me.id
          AND ms.status = 'disponivel'
      ) AS nova_qtd
  )
  SELECT 
    material_id::TEXT,
    (nova_qtd - diff)::INTEGER AS quantidade_anterior,
    nova_qtd::INTEGER AS quantidade_nova
  FROM atualizados;
END;
$$;

-- 2. Habilitar proteção contra senhas vazadas no auth
-- Esta configuração é gerenciada pelo Supabase e não pode ser alterada via SQL
-- Documentando que deve ser habilitada via Dashboard do Supabase em:
-- Authentication -> Policies -> Password Protection

-- 3. Recriar triggers com funções atualizadas
-- Drop e recriar triggers para usar as funções com search_path seguro

-- Trigger para atualizar updated_at em profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para atualizar updated_at em clientes
DROP TRIGGER IF EXISTS update_clientes_updated_at ON public.clientes;
CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para atualizar updated_at em eventos
DROP TRIGGER IF EXISTS update_eventos_updated_at ON public.eventos;
CREATE TRIGGER update_eventos_updated_at
  BEFORE UPDATE ON public.eventos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para atualizar updated_at em materiais_estoque
DROP TRIGGER IF EXISTS update_materiais_estoque_updated_at ON public.materiais_estoque;
CREATE TRIGGER update_materiais_estoque_updated_at
  BEFORE UPDATE ON public.materiais_estoque
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para atualizar updated_at em demandas
DROP TRIGGER IF EXISTS update_demandas_updated_at ON public.demandas;
CREATE TRIGGER update_demandas_updated_at
  BEFORE UPDATE ON public.demandas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para atualizar updated_at em equipe_operacional
DROP TRIGGER IF EXISTS update_equipe_operacional_updated_at ON public.equipe_operacional;
CREATE TRIGGER update_equipe_operacional_updated_at
  BEFORE UPDATE ON public.equipe_operacional
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para atualizar updated_at em contratos
DROP TRIGGER IF EXISTS update_contratos_updated_at ON public.contratos;
CREATE TRIGGER update_contratos_updated_at
  BEFORE UPDATE ON public.contratos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários de documentação
COMMENT ON FUNCTION public.update_updated_at_column() IS 
'Função segura para atualizar automaticamente o campo updated_at. Usa search_path restrito para prevenir ataques de injection.';

COMMENT ON FUNCTION public.sincronizar_quantidade_disponivel(TEXT) IS 
'Sincroniza quantidade_disponivel de materiais com controle por serial. Usa search_path restrito para segurança.';