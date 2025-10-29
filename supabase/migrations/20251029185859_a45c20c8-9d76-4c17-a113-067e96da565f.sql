-- Adicionar coluna responsavel_legal na tabela clientes
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS responsavel_legal JSONB;

-- Comentário explicativo
COMMENT ON COLUMN clientes.responsavel_legal IS 
'Responsável legal com CPF e data de nascimento (obrigatório para CNPJ)';

-- Índice para busca por CPF do responsável (opcional, para performance)
CREATE INDEX IF NOT EXISTS idx_clientes_responsavel_cpf 
ON clientes ((responsavel_legal->>'cpf'));