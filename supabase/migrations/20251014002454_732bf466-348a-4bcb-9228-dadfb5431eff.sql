-- Criar tabela de histórico de localização de materiais
CREATE TABLE materiais_historico_localizacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_numero TEXT NOT NULL,
  material_id TEXT NOT NULL,
  evento_id UUID REFERENCES eventos(id) ON DELETE SET NULL,
  localizacao_anterior TEXT,
  localizacao_nova TEXT NOT NULL,
  usuario_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  data_movimentacao TIMESTAMPTZ DEFAULT NOW(),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para busca rápida
CREATE INDEX idx_historico_localizacao_serial ON materiais_historico_localizacao(serial_numero);
CREATE INDEX idx_historico_localizacao_material ON materiais_historico_localizacao(material_id);
CREATE INDEX idx_historico_localizacao_evento ON materiais_historico_localizacao(evento_id);

-- RLS para histórico de localização
ALTER TABLE materiais_historico_localizacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view location history"
ON materiais_historico_localizacao FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "System can insert location history"
ON materiais_historico_localizacao FOR INSERT
TO authenticated
WITH CHECK (true);

-- Adicionar colunas de cardápio na tabela eventos
ALTER TABLE eventos
ADD COLUMN cardapio_arquivo TEXT,
ADD COLUMN cardapio_tipo TEXT;

-- Criar tabela de histórico de configurações do evento
CREATE TABLE eventos_configuracao_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  campo_alterado TEXT NOT NULL,
  valor_anterior TEXT,
  valor_novo TEXT NOT NULL,
  motivo TEXT NOT NULL,
  usuario_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  data_alteracao TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para busca rápida
CREATE INDEX idx_config_historico_evento ON eventos_configuracao_historico(evento_id);
CREATE INDEX idx_config_historico_data ON eventos_configuracao_historico(data_alteracao DESC);

-- RLS para histórico de configurações
ALTER TABLE eventos_configuracao_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view config history"
ON eventos_configuracao_historico FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin and Suporte can insert config history"
ON eventos_configuracao_historico FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'suporte') OR
  has_role(auth.uid(), 'comercial')
);