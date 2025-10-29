-- Criar tabela contas_pagar
CREATE TABLE IF NOT EXISTS contas_pagar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informações Básicas
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  valor NUMERIC NOT NULL CHECK (valor > 0),
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario NUMERIC NOT NULL CHECK (valor_unitario > 0),
  
  -- Recorrência
  recorrencia TEXT NOT NULL CHECK (recorrencia IN ('unico', 'semanal', 'quinzenal', 'mensal', 'anual')),
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  
  -- Status e Pagamento
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido', 'cancelado')),
  forma_pagamento TEXT,
  
  -- Informações Adicionais
  fornecedor TEXT,
  responsavel TEXT,
  observacoes TEXT,
  
  -- Anexos (múltiplos)
  anexos JSONB DEFAULT '[]'::jsonb,
  
  -- Recorrência Automática
  recorrencia_origem_id UUID REFERENCES contas_pagar(id) ON DELETE CASCADE,
  proxima_data_geracao DATE,
  
  -- Metadados
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Criar tabela contas_receber
CREATE TABLE IF NOT EXISTS contas_receber (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informações Básicas
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL,
  valor NUMERIC NOT NULL CHECK (valor > 0),
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario NUMERIC NOT NULL CHECK (valor_unitario > 0),
  
  -- Recorrência
  recorrencia TEXT NOT NULL CHECK (recorrencia IN ('unico', 'semanal', 'quinzenal', 'mensal', 'anual')),
  data_vencimento DATE NOT NULL,
  data_recebimento DATE,
  
  -- Status e Recebimento
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'recebido', 'vencido', 'cancelado')),
  forma_recebimento TEXT,
  
  -- Informações Adicionais
  cliente TEXT,
  responsavel TEXT,
  observacoes TEXT,
  
  -- Anexos (múltiplos)
  anexos JSONB DEFAULT '[]'::jsonb,
  
  -- Recorrência Automática
  recorrencia_origem_id UUID REFERENCES contas_receber(id) ON DELETE CASCADE,
  proxima_data_geracao DATE,
  
  -- Metadados
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para contas_pagar
CREATE INDEX IF NOT EXISTS idx_contas_pagar_status ON contas_pagar(status);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_recorrencia ON contas_pagar(recorrencia);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_categoria ON contas_pagar(categoria);

-- Índices para contas_receber
CREATE INDEX IF NOT EXISTS idx_contas_receber_status ON contas_receber(status);
CREATE INDEX IF NOT EXISTS idx_contas_receber_vencimento ON contas_receber(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_receber_recorrencia ON contas_receber(recorrencia);
CREATE INDEX IF NOT EXISTS idx_contas_receber_tipo ON contas_receber(tipo);

-- RLS Policies para contas_pagar
ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users with permission can view contas_pagar"
ON contas_pagar FOR SELECT
USING (has_permission(auth.uid(), 'financeiro.visualizar'));

CREATE POLICY "Users with permission can manage contas_pagar"
ON contas_pagar FOR ALL
USING (has_permission(auth.uid(), 'financeiro.editar'))
WITH CHECK (has_permission(auth.uid(), 'financeiro.editar'));

-- RLS Policies para contas_receber
ALTER TABLE contas_receber ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users with permission can view contas_receber"
ON contas_receber FOR SELECT
USING (has_permission(auth.uid(), 'financeiro.visualizar'));

CREATE POLICY "Users with permission can manage contas_receber"
ON contas_receber FOR ALL
USING (has_permission(auth.uid(), 'financeiro.editar'))
WITH CHECK (has_permission(auth.uid(), 'financeiro.editar'));

-- Triggers para updated_at
CREATE TRIGGER update_contas_pagar_updated_at
BEFORE UPDATE ON contas_pagar
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contas_receber_updated_at
BEFORE UPDATE ON contas_receber
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar próxima recorrência (contas_pagar)
CREATE OR REPLACE FUNCTION gerar_proxima_recorrencia_pagar()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  proxima_data DATE;
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
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_gerar_proxima_recorrencia_pagar
AFTER UPDATE ON contas_pagar
FOR EACH ROW
EXECUTE FUNCTION gerar_proxima_recorrencia_pagar();

-- Função para gerar próxima recorrência (contas_receber)
CREATE OR REPLACE FUNCTION gerar_proxima_recorrencia_receber()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  proxima_data DATE;
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
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_gerar_proxima_recorrencia_receber
AFTER UPDATE ON contas_receber
FOR EACH ROW
EXECUTE FUNCTION gerar_proxima_recorrencia_receber();

-- Função para marcar contas vencidas
CREATE OR REPLACE FUNCTION marcar_contas_vencidas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE contas_pagar
  SET status = 'vencido'
  WHERE status = 'pendente'
    AND data_vencimento < CURRENT_DATE;
  
  UPDATE contas_receber
  SET status = 'vencido'
  WHERE status = 'pendente'
    AND data_vencimento < CURRENT_DATE;
END;
$$;

-- Criar bucket para anexos financeiros
INSERT INTO storage.buckets (id, name, public)
VALUES ('financeiro-anexos', 'financeiro-anexos', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para o bucket
CREATE POLICY "Users with permission can upload financeiro anexos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'financeiro-anexos' AND
  has_permission(auth.uid(), 'financeiro.editar')
);

CREATE POLICY "Users with permission can view financeiro anexos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'financeiro-anexos' AND
  has_permission(auth.uid(), 'financeiro.visualizar')
);

CREATE POLICY "Users with permission can delete financeiro anexos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'financeiro-anexos' AND
  has_permission(auth.uid(), 'financeiro.editar')
);