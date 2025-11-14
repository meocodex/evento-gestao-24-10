-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_eventos_utiliza_pos_empresa 
ON eventos(utiliza_pos_empresa) 
WHERE tipo_evento IN ('bar', 'ingresso', 'hibrido');

CREATE INDEX IF NOT EXISTS idx_eventos_ativos 
ON eventos(status) 
WHERE status NOT IN ('arquivado', 'cancelado');