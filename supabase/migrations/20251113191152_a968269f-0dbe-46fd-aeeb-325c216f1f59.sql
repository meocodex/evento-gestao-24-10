-- Estratégia: criar novo enum e migrar

-- 1. Criar novo tipo temporário
CREATE TYPE tipo_receita_novo AS ENUM ('venda', 'locacao', 'servico', 'outros');

-- 2. Atualizar a coluna para usar o novo tipo, convertendo valores antigos para 'outros'
ALTER TABLE eventos_receitas 
  ALTER COLUMN tipo TYPE tipo_receita_novo 
  USING CASE 
    WHEN tipo::text IN ('fixo', 'quantidade') THEN 'outros'::tipo_receita_novo
    ELSE tipo::text::tipo_receita_novo
  END;

-- 3. Remover o tipo antigo
DROP TYPE tipo_receita;

-- 4. Renomear o novo tipo para o nome original
ALTER TYPE tipo_receita_novo RENAME TO tipo_receita;