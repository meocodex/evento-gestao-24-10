-- Habilitar REPLICA IDENTITY FULL para ter dados completos nos eventos realtime
ALTER TABLE materiais_estoque REPLICA IDENTITY FULL;
ALTER TABLE materiais_seriais REPLICA IDENTITY FULL;
ALTER TABLE eventos_materiais_alocados REPLICA IDENTITY FULL;

-- Adicionar tabelas à publicação realtime do Supabase
ALTER PUBLICATION supabase_realtime ADD TABLE materiais_estoque;
ALTER PUBLICATION supabase_realtime ADD TABLE materiais_seriais;
ALTER PUBLICATION supabase_realtime ADD TABLE eventos_materiais_alocados;