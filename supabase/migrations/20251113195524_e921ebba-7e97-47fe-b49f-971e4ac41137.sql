-- Criar tabela de configuração de fechamento
CREATE TABLE IF NOT EXISTS configuracoes_fechamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  papel_timbrado TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE configuracoes_fechamento ENABLE ROW LEVEL SECURITY;

-- Policy: Todos podem visualizar
CREATE POLICY "Authenticated users can view fechamento config"
  ON configuracoes_fechamento
  FOR SELECT
  USING (true);

-- Policy: Admins podem gerenciar
CREATE POLICY "Admins can manage fechamento config"
  ON configuracoes_fechamento
  FOR ALL
  USING (has_permission(auth.uid(), 'admin.full_access'))
  WITH CHECK (has_permission(auth.uid(), 'admin.full_access'));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_configuracoes_fechamento_updated_at
  BEFORE UPDATE ON configuracoes_fechamento
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();