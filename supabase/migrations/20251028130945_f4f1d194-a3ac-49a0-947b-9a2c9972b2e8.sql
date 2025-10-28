-- ============================================================
-- SISTEMA DE STATUS AUTOMÁTICO E ARQUIVAMENTO DE EVENTOS
-- ============================================================

-- 1. Adicionar campo arquivado na tabela eventos
ALTER TABLE eventos 
ADD COLUMN IF NOT EXISTS arquivado BOOLEAN DEFAULT FALSE;

-- 2. Criar índice para performance em filtros
CREATE INDEX IF NOT EXISTS idx_eventos_arquivado ON eventos(arquivado) WHERE arquivado = false;

-- 3. Função para verificar se todos os materiais foram devolvidos
CREATE OR REPLACE FUNCTION materiais_devolvidos_completo(p_evento_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1
    FROM eventos_materiais_alocados
    WHERE evento_id = p_evento_id
      AND status_devolucao = 'pendente'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Bloquear arquivamento se houver materiais pendentes
ALTER TABLE eventos 
DROP CONSTRAINT IF EXISTS check_arquivar_sem_materiais_pendentes;

ALTER TABLE eventos 
ADD CONSTRAINT check_arquivar_sem_materiais_pendentes 
CHECK (
  arquivado = FALSE OR 
  materiais_devolvidos_completo(id)
);

-- 5. Adicionar tipo 'arquivamento' à timeline (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'arquivamento' 
    AND enumtypid = 'tipo_timeline'::regtype
  ) THEN
    ALTER TYPE tipo_timeline ADD VALUE 'arquivamento';
  END IF;
END $$;