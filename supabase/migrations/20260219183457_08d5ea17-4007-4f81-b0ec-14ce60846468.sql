
-- 1. Fix check constraint to allow 'documento' type
ALTER TABLE eventos_contratos DROP CONSTRAINT IF EXISTS eventos_contratos_tipo_check;
ALTER TABLE eventos_contratos ADD CONSTRAINT eventos_contratos_tipo_check 
  CHECK (tipo = ANY (ARRAY['bar','ingresso','bar_ingresso','credenciamento','documento']));

-- 2. Add file size column
ALTER TABLE eventos_contratos ADD COLUMN IF NOT EXISTS arquivo_tamanho integer;
