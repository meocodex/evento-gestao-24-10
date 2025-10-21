-- Criar tabela equipe_operacional (sem campos financeiros)
CREATE TABLE equipe_operacional (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE,
  telefone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  
  -- Função e Tipo
  funcao_principal TEXT NOT NULL,
  funcoes_secundarias TEXT[],
  tipo_vinculo TEXT NOT NULL, -- 'clt', 'freelancer', 'pj'
  
  -- Documentos e Status
  foto TEXT,
  documentos TEXT[], -- URLs de CNH, certificados, etc
  status TEXT DEFAULT 'ativo', -- 'ativo', 'inativo', 'bloqueado'
  
  -- Avaliação e observações
  avaliacao NUMERIC DEFAULT 5.0,
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_equipe_operacional_status ON equipe_operacional(status);
CREATE INDEX idx_equipe_operacional_funcao ON equipe_operacional(funcao_principal);
CREATE INDEX idx_equipe_operacional_tipo ON equipe_operacional(tipo_vinculo);
CREATE INDEX idx_equipe_operacional_nome ON equipe_operacional(nome);

-- Atualizar tabela eventos_equipe
ALTER TABLE eventos_equipe
  ADD COLUMN operacional_id UUID REFERENCES equipe_operacional(id) ON DELETE SET NULL,
  ADD COLUMN whatsapp TEXT,
  ADD COLUMN data_inicio DATE,
  ADD COLUMN data_fim DATE,
  ADD COLUMN observacoes TEXT;

-- Trigger para updated_at
CREATE TRIGGER update_equipe_operacional_updated_at
BEFORE UPDATE ON equipe_operacional
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies para equipe_operacional
ALTER TABLE equipe_operacional ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and Suporte can manage equipe_operacional"
ON equipe_operacional FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'suporte'));

CREATE POLICY "Comercial can view active equipe_operacional"
ON equipe_operacional FOR SELECT
USING (
  (has_role(auth.uid(), 'comercial') AND status = 'ativo')
  OR has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'suporte')
);