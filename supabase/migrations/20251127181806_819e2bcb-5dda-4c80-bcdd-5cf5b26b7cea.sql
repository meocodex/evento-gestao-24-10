-- FASE 1: Adicionar coluna evento_id na tabela materiais_seriais
ALTER TABLE materiais_seriais 
ADD COLUMN evento_id UUID REFERENCES eventos(id) ON DELETE SET NULL;

CREATE INDEX idx_materiais_seriais_evento_id ON materiais_seriais(evento_id);

-- FASE 2: Atualizar trigger atualizar_status_alocacao
CREATE OR REPLACE FUNCTION public.atualizar_status_alocacao()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.serial IS NOT NULL THEN
    UPDATE materiais_seriais
    SET status = 'em-uso'::status_serial,
        localizacao = 'Em evento',
        evento_id = NEW.evento_id
    WHERE material_id = NEW.item_id
      AND numero = NEW.serial;
    
    UPDATE materiais_estoque
    SET quantidade_disponivel = GREATEST(0, quantidade_disponivel - 1)
    WHERE id = NEW.item_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- FASE 3: Atualizar função processar_devolucao_material
CREATE OR REPLACE FUNCTION public.processar_devolucao_material()
RETURNS TRIGGER AS $$
DECLARE
  v_evento_nome TEXT;
  v_tipo_operacao TEXT;
BEGIN
  -- Só processar se o status mudou de 'pendente' para outro valor
  IF OLD.status_devolucao != 'pendente' OR NEW.status_devolucao = 'pendente' THEN
    RETURN NEW;
  END IF;

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
            localizacao = 'Empresa',
            evento_id = NULL
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
            localizacao = 'Manutenção',
            evento_id = NULL
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
            fotos_perda = NEW.fotos_devolucao,
            localizacao = 'Perdido',
            evento_id = NULL
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- FASE 4: Sincronizar dados existentes
-- 4.1: Atualizar seriais em uso para 'Em evento' com evento_id correto
UPDATE materiais_seriais ms
SET localizacao = 'Em evento',
    evento_id = (
      SELECT evento_id 
      FROM eventos_materiais_alocados 
      WHERE item_id = ms.material_id 
        AND serial = ms.numero 
        AND status_devolucao = 'pendente'
      LIMIT 1
    )
WHERE ms.status = 'em-uso';

-- 4.2: Mudar 'Estoque' para 'Empresa' em seriais disponíveis
UPDATE materiais_seriais
SET localizacao = 'Empresa'
WHERE status = 'disponivel' AND localizacao = 'Estoque';