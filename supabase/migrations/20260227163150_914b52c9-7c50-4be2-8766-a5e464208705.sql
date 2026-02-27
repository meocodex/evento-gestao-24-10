ALTER TABLE configuracoes_categorias 
  DROP CONSTRAINT IF EXISTS configuracoes_categorias_tipo_key;

ALTER TABLE configuracoes_categorias 
  ADD CONSTRAINT configuracoes_categorias_user_tipo_key UNIQUE (user_id, tipo);