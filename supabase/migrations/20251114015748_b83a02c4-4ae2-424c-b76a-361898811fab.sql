-- Adicionar colunas para controle de taxas em eventos_receitas
ALTER TABLE eventos_receitas 
ADD COLUMN IF NOT EXISTS tipo_servico TEXT,
ADD COLUMN IF NOT EXISTS tem_taxas BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS formas_pagamento JSONB,
ADD COLUMN IF NOT EXISTS taxa_total NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_liquido NUMERIC,
ADD COLUMN IF NOT EXISTS despesas_taxas_ids UUID[];

-- Criar função para cálculo automático de valores
CREATE OR REPLACE FUNCTION calcular_valores_receita()
RETURNS TRIGGER AS $$
DECLARE
  pagamento JSONB;
  taxa_calculada NUMERIC := 0;
BEGIN
  IF NEW.tem_taxas AND NEW.formas_pagamento IS NOT NULL THEN
    NEW.taxa_total := 0;
    FOR pagamento IN SELECT * FROM jsonb_array_elements(NEW.formas_pagamento)
    LOOP
      taxa_calculada := (pagamento->>'valor')::NUMERIC * (pagamento->>'taxa_percentual')::NUMERIC / 100;
      NEW.taxa_total := NEW.taxa_total + taxa_calculada;
    END LOOP;
    NEW.valor_liquido := NEW.valor - COALESCE(NEW.taxa_total, 0);
  ELSE
    NEW.taxa_total := 0;
    NEW.valor_liquido := NEW.valor;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para cálculos automáticos
CREATE TRIGGER trigger_calcular_valores_receita
BEFORE INSERT OR UPDATE ON eventos_receitas
FOR EACH ROW
EXECUTE FUNCTION calcular_valores_receita();

-- Criar tabela de configuração de taxas (opcional)
CREATE TABLE IF NOT EXISTS configuracoes_taxas_pagamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forma_pagamento TEXT NOT NULL UNIQUE,
  taxa_padrao_percentual NUMERIC NOT NULL DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies para configuracoes_taxas_pagamento
ALTER TABLE configuracoes_taxas_pagamento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view taxas config"
ON configuracoes_taxas_pagamento FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage taxas config"
ON configuracoes_taxas_pagamento FOR ALL
TO authenticated
USING (has_permission(auth.uid(), 'admin.full_access'))
WITH CHECK (has_permission(auth.uid(), 'admin.full_access'));

-- Inserir taxas padrão
INSERT INTO configuracoes_taxas_pagamento (forma_pagamento, taxa_padrao_percentual) VALUES
('debito', 2.5),
('credito', 4.0),
('pix', 1.0),
('dinheiro', 0),
('transferencia', 0)
ON CONFLICT (forma_pagamento) DO NOTHING;