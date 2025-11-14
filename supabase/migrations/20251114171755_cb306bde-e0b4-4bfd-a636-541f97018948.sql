-- Adicionar novos valores ao enum status_evento
ALTER TYPE status_evento ADD VALUE IF NOT EXISTS 'em_negociacao';
ALTER TYPE status_evento ADD VALUE IF NOT EXISTS 'finalizado';
ALTER TYPE status_evento ADD VALUE IF NOT EXISTS 'arquivado';

-- Adicionar coluna utiliza_pos_empresa
ALTER TABLE eventos 
ADD COLUMN IF NOT EXISTS utiliza_pos_empresa boolean DEFAULT false;

-- Comentários para documentação
COMMENT ON COLUMN eventos.utiliza_pos_empresa IS 
'Indica se o cliente vai utilizar POS da empresa (aplicável para eventos tipo bar, ingresso ou hibrido)';

COMMENT ON COLUMN eventos.status IS 
'Fluxo: em_negociacao → confirmado → em_preparacao → em_execucao (automático) → finalizado (automático) → arquivado';