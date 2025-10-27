-- Adicionar coluna tags como array de texto na tabela materiais_seriais
ALTER TABLE materiais_seriais 
ADD COLUMN tags text[] DEFAULT ARRAY[]::text[];

-- Comentário para documentação
COMMENT ON COLUMN materiais_seriais.tags IS 'Tags/etiquetas para categorização adicional do serial (ex: Bateria carregada, Testado, etc)';