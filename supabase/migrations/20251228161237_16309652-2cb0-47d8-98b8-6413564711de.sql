-- ===== ÍNDICES PARA OTIMIZAÇÃO DE PERFORMANCE =====

-- Índice para busca por data de início de eventos (usado em dashboard, filtros, ordenação)
CREATE INDEX IF NOT EXISTS idx_eventos_data_inicio ON eventos(data_inicio);

-- Índice para busca de seriais por material (usado em alocação e estoque)
CREATE INDEX IF NOT EXISTS idx_materiais_seriais_material_id ON materiais_seriais(material_id);

-- Índice para filtro por status de demandas (usado em dashboard e listagens)
CREATE INDEX IF NOT EXISTS idx_demandas_status ON demandas(status);

-- Índice para status de devolução de materiais (usado em alertas operacionais)
CREATE INDEX IF NOT EXISTS idx_eventos_materiais_alocados_status_devolucao ON eventos_materiais_alocados(status_devolucao);

-- Índice para comercial_id em eventos (usado em dashboards comerciais)
CREATE INDEX IF NOT EXISTS idx_eventos_comercial_id ON eventos(comercial_id);

-- Índice para evento_id em materiais alocados (joins frequentes)
CREATE INDEX IF NOT EXISTS idx_eventos_materiais_alocados_evento_id ON eventos_materiais_alocados(evento_id);

-- Índice para evento_id em eventos_equipe (usado em verificação de equipe)
CREATE INDEX IF NOT EXISTS idx_eventos_equipe_evento_id ON eventos_equipe(evento_id);