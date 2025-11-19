-- Adicionar permissões de propostas ao catálogo
-- Essas permissões são usadas no frontend mas estão faltando no banco

INSERT INTO permissions (id, modulo, acao, descricao, categoria)
VALUES 
  ('propostas.criar', 'propostas', 'criar', 'Criar propostas comerciais', 'Comercial'),
  ('propostas.editar', 'propostas', 'editar', 'Editar propostas comerciais', 'Comercial')
ON CONFLICT (id) DO NOTHING;