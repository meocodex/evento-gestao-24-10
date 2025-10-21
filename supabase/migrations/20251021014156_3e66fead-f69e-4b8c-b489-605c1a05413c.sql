-- Criar novo tipo de status simplificado
CREATE TYPE status_evento_novo AS ENUM (
  'orcamento',
  'confirmado',
  'em_preparacao',
  'em_execucao',
  'concluido',
  'cancelado'
);

-- Adicionar coluna temporária com novo tipo
ALTER TABLE eventos ADD COLUMN status_novo status_evento_novo;

-- Migrar dados existentes para novos status
UPDATE eventos SET status_novo = 
  CASE 
    WHEN status = 'orcamento_enviado' THEN 'orcamento'::status_evento_novo
    WHEN status IN ('aguardando_alocacao', 'confirmado') THEN 'confirmado'::status_evento_novo
    WHEN status IN ('materiais_alocados', 'em_preparacao') THEN 'em_preparacao'::status_evento_novo
    WHEN status = 'em_andamento' THEN 'em_execucao'::status_evento_novo
    WHEN status IN ('aguardando_retorno', 'aguardando_fechamento', 'finalizado') THEN 'concluido'::status_evento_novo
    WHEN status = 'cancelado' THEN 'cancelado'::status_evento_novo
  END;

-- Remover coluna antiga
ALTER TABLE eventos DROP COLUMN status;

-- Renomear nova coluna
ALTER TABLE eventos RENAME COLUMN status_novo TO status;

-- Definir default
ALTER TABLE eventos ALTER COLUMN status SET DEFAULT 'orcamento'::status_evento_novo;

-- Remover tipo antigo
DROP TYPE status_evento;

-- Renomear novo tipo
ALTER TYPE status_evento_novo RENAME TO status_evento;

-- Atualizar também a tabela eventos_timeline se necessário
UPDATE eventos_timeline SET tipo = 'criacao' WHERE tipo = 'confirmacao' OR tipo = 'alocacao';