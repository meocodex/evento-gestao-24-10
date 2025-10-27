-- FASE 1.1: Adicionar tipo de controle aos materiais
-- Permite diferenciar materiais com serial individual vs quantidade agregada
ALTER TABLE materiais_estoque 
ADD COLUMN IF NOT EXISTS tipo_controle TEXT NOT NULL DEFAULT 'serial' 
CHECK (tipo_controle IN ('serial', 'quantidade'));

COMMENT ON COLUMN materiais_estoque.tipo_controle IS 
'serial: controle por número único (Cabo, Máquina de Cartão) | quantidade: controle agregado (Bobinas, Parafusos)';

-- FASE 1.2: Expandir status de seriais para incluir perdido e consumido
DO $$ BEGIN
  ALTER TYPE status_serial ADD VALUE IF NOT EXISTS 'perdido';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE status_serial ADD VALUE IF NOT EXISTS 'consumido';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Adicionar campos para rastreabilidade de perdas
ALTER TABLE materiais_seriais
ADD COLUMN IF NOT EXISTS perdido_em UUID REFERENCES eventos(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS data_perda TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS motivo_perda TEXT,
ADD COLUMN IF NOT EXISTS fotos_perda TEXT[];

COMMENT ON COLUMN materiais_seriais.perdido_em IS 'Evento onde o material foi perdido';
COMMENT ON COLUMN materiais_seriais.fotos_perda IS 'URLs de fotos comprobatórias da perda';

-- FASE 1.3: Expandir tabela de alocação para suportar devoluções e quantidades
ALTER TABLE eventos_materiais_alocados
ADD COLUMN IF NOT EXISTS quantidade_alocada INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS quantidade_devolvida INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status_devolucao TEXT DEFAULT 'pendente' 
  CHECK (status_devolucao IN ('pendente', 'devolvido_ok', 'devolvido_danificado', 'perdido', 'consumido')),
ADD COLUMN IF NOT EXISTS data_devolucao TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS responsavel_devolucao UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS observacoes_devolucao TEXT,
ADD COLUMN IF NOT EXISTS fotos_devolucao TEXT[];

-- Serial passa a ser opcional (NULL para materiais de quantidade)
ALTER TABLE eventos_materiais_alocados
ALTER COLUMN serial DROP NOT NULL;

COMMENT ON COLUMN eventos_materiais_alocados.quantidade_alocada IS 'Quantidade alocada (usado para materiais de quantidade)';
COMMENT ON COLUMN eventos_materiais_alocados.status_devolucao IS 'Status da devolução pós-evento';

-- FASE 1.4: Criar tabela unificada de histórico de movimentações
CREATE TABLE IF NOT EXISTS materiais_historico_movimentacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação do Material
  material_id TEXT NOT NULL REFERENCES materiais_estoque(id) ON DELETE CASCADE,
  serial_numero TEXT, -- NULL para materiais de quantidade
  
  -- Evento Relacionado
  evento_id UUID REFERENCES eventos(id) ON DELETE SET NULL,
  evento_nome TEXT, -- Desnormalizado para histórico
  
  -- Tipo de Movimentação
  tipo_operacao TEXT NOT NULL CHECK (tipo_operacao IN (
    'alocacao',           -- Material foi alocado para evento
    'devolucao_ok',       -- Voltou em perfeito estado
    'devolucao_danificado', -- Voltou danificado (vai para manutenção)
    'perda',              -- Perdido no evento (baixa definitiva)
    'consumo',            -- Consumido/usado (não retorna)
    'entrada_estoque',    -- Entrada nova no estoque
    'ajuste_inventario',  -- Ajuste manual
    'manutencao_iniciada', -- Enviado para manutenção
    'manutencao_concluida' -- Retornou da manutenção
  )),
  
  -- Quantidades (para materiais de quantidade)
  quantidade INTEGER, -- NULL para materiais com serial
  
  -- Detalhes da Movimentação
  tipo_envio TEXT CHECK (tipo_envio IN ('antecipado', 'com_tecnicos')),
  transportadora TEXT,
  responsavel TEXT, -- Nome do responsável
  localizacao_origem TEXT,
  localizacao_destino TEXT,
  
  -- Rastreabilidade
  usuario_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  data_movimentacao TIMESTAMPTZ DEFAULT NOW(),
  
  -- Observações e Documentação
  motivo TEXT, -- Obrigatório para perdas/danos
  observacoes TEXT,
  fotos_comprovantes TEXT[], -- URLs de fotos
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para Performance
CREATE INDEX IF NOT EXISTS idx_historico_material ON materiais_historico_movimentacao(material_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_historico_evento ON materiais_historico_movimentacao(evento_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_historico_serial ON materiais_historico_movimentacao(serial_numero, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_historico_tipo ON materiais_historico_movimentacao(tipo_operacao);

-- RLS Policies
ALTER TABLE materiais_historico_movimentacao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view history" ON materiais_historico_movimentacao;
CREATE POLICY "Authenticated users can view history"
  ON materiais_historico_movimentacao FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "System can insert history" ON materiais_historico_movimentacao;
CREATE POLICY "System can insert history"
  ON materiais_historico_movimentacao FOR INSERT
  TO authenticated WITH CHECK (true);

COMMENT ON TABLE materiais_historico_movimentacao IS 'Histórico unificado de todas as movimentações de materiais (seriais e quantidades)';

-- FASE 2: Triggers Automáticos para Histórico
-- 2.1 Trigger para registrar ALOCAÇÃO
CREATE OR REPLACE FUNCTION registrar_alocacao_no_historico()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_registrar_alocacao ON eventos_materiais_alocados;
CREATE TRIGGER trigger_registrar_alocacao
AFTER INSERT ON eventos_materiais_alocados
FOR EACH ROW
EXECUTE FUNCTION registrar_alocacao_no_historico();

-- 2.2 Trigger para processar DEVOLUÇÃO
CREATE OR REPLACE FUNCTION processar_devolucao_material()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_processar_devolucao ON eventos_materiais_alocados;
CREATE TRIGGER trigger_processar_devolucao
AFTER UPDATE OF status_devolucao ON eventos_materiais_alocados
FOR EACH ROW
WHEN (OLD.status_devolucao = 'pendente' AND NEW.status_devolucao != 'pendente')
EXECUTE FUNCTION processar_devolucao_material();

-- Habilitar realtime para histórico
ALTER TABLE materiais_historico_movimentacao REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE materiais_historico_movimentacao;