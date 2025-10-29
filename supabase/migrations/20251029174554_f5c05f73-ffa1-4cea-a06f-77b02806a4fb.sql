-- 1. Remover duplicatas existentes (se houver)
-- Mantém apenas o registro mais antigo de cada documento
DELETE FROM clientes a
USING clientes b
WHERE a.id > b.id 
  AND a.documento = b.documento;

-- 2. Adicionar constraint UNIQUE para garantir unicidade de CPF/CNPJ
ALTER TABLE clientes
ADD CONSTRAINT clientes_documento_unique UNIQUE (documento);

-- 3. Criar índice para otimizar buscas por documento
CREATE INDEX IF NOT EXISTS idx_clientes_documento 
ON clientes(documento);

-- 4. Adicionar comentário explicativo
COMMENT ON CONSTRAINT clientes_documento_unique ON clientes 
IS 'Garante unicidade de CPF/CNPJ no sistema';