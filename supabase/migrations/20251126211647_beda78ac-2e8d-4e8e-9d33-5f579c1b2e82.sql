-- =====================================================
-- PLANO DE SEGURANÇA: Adicionar search_path às funções
-- =====================================================

-- 1. Adicionar search_path às funções restantes
-- =====================================================

-- Função: processar_devolucao_material
CREATE OR REPLACE FUNCTION public.processar_devolucao_material()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_evento_nome TEXT;
  v_tipo_operacao TEXT;
BEGIN
  -- Buscar nome do evento
  SELECT nome INTO v_evento_nome FROM eventos WHERE id = NEW.evento_id;
  
  -- Determinar tipo de operação baseado no status de devolução
  CASE NEW.status_devolucao
    WHEN 'devolvido_ok' THEN
      v_tipo_operacao := 'devolucao_ok';
      
      -- Atualizar status do serial (se existir)
      IF NEW.serial IS NOT NULL THEN
        UPDATE materiais_seriais
        SET status = 'disponivel',
            localizacao = 'Estoque'
        WHERE numero = NEW.serial AND material_id = NEW.item_id;
      END IF;
      
      -- Incrementar disponível
      UPDATE materiais_estoque
      SET quantidade_disponivel = quantidade_disponivel + COALESCE(NEW.quantidade_alocada, 1)
      WHERE id = NEW.item_id;
      
    WHEN 'devolvido_danificado' THEN
      v_tipo_operacao := 'devolucao_danificado';
      
      -- Enviar para manutenção
      IF NEW.serial IS NOT NULL THEN
        UPDATE materiais_seriais
        SET status = 'manutencao',
            localizacao = 'Manutenção'
        WHERE numero = NEW.serial AND material_id = NEW.item_id;
      END IF;
      
    WHEN 'perdido' THEN
      v_tipo_operacao := 'perda';
      
      -- Marcar serial como perdido
      IF NEW.serial IS NOT NULL THEN
        UPDATE materiais_seriais
        SET status = 'perdido',
            perdido_em = NEW.evento_id,
            data_perda = NEW.data_devolucao,
            motivo_perda = NEW.observacoes_devolucao,
            fotos_perda = NEW.fotos_devolucao
        WHERE numero = NEW.serial AND material_id = NEW.item_id;
      END IF;
      
      -- Decrementar total do estoque
      UPDATE materiais_estoque
      SET quantidade_total = GREATEST(0, quantidade_total - COALESCE(NEW.quantidade_alocada, 1))
      WHERE id = NEW.item_id;
      
    WHEN 'consumido' THEN
      v_tipo_operacao := 'consumo';
      
      -- Baixar do estoque
      UPDATE materiais_estoque
      SET quantidade_total = GREATEST(0, quantidade_total - COALESCE(NEW.quantidade_alocada, 1)),
          quantidade_disponivel = GREATEST(0, quantidade_disponivel - COALESCE(NEW.quantidade_alocada, 1))
      WHERE id = NEW.item_id;
  END CASE;
  
  -- Registrar no histórico
  INSERT INTO materiais_historico_movimentacao (
    material_id,
    serial_numero,
    evento_id,
    evento_nome,
    tipo_operacao,
    quantidade,
    motivo,
    observacoes,
    fotos_comprovantes,
    usuario_id
  ) VALUES (
    NEW.item_id,
    NEW.serial,
    NEW.evento_id,
    v_evento_nome,
    v_tipo_operacao,
    NEW.quantidade_alocada,
    NEW.observacoes_devolucao,
    NEW.observacoes_devolucao,
    NEW.fotos_devolucao,
    NEW.responsavel_devolucao
  );
  
  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.processar_devolucao_material() IS 'Processa devolução de material com search_path seguro';

-- Função: registrar_alocacao_no_historico
CREATE OR REPLACE FUNCTION public.registrar_alocacao_no_historico()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_evento_nome TEXT;
BEGIN
  -- Buscar nome do evento
  SELECT nome INTO v_evento_nome FROM eventos WHERE id = NEW.evento_id;
  
  -- Registrar no histórico
  INSERT INTO materiais_historico_movimentacao (
    material_id,
    serial_numero,
    evento_id,
    evento_nome,
    tipo_operacao,
    quantidade,
    tipo_envio,
    transportadora,
    responsavel,
    observacoes
  ) VALUES (
    NEW.item_id,
    NEW.serial,
    NEW.evento_id,
    v_evento_nome,
    'alocacao',
    NEW.quantidade_alocada,
    NEW.tipo_envio,
    NEW.transportadora,
    NEW.responsavel,
    'Material alocado para o evento'
  );
  
  RETURN NEW;
END;
$function$;