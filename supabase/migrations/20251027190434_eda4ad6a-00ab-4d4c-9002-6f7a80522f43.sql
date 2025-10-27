-- Habilitar realtime para eventos_checklist
-- Configurar REPLICA IDENTITY FULL para capturar todas as mudanças
ALTER TABLE eventos_checklist REPLICA IDENTITY FULL;
ALTER TABLE eventos_materiais_alocados REPLICA IDENTITY FULL;

-- Adicionar apenas eventos_checklist à publicação (eventos_materiais_alocados já está)
ALTER PUBLICATION supabase_realtime ADD TABLE eventos_checklist;