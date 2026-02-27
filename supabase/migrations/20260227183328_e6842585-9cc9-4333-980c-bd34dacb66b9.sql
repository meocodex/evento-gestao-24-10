
-- Consolidar categorias duplicadas por tipo em um único registro
-- Para cada tipo, mesclar categorias de todos os registros mantendo o mais antigo

-- Função temporária para mesclar categorias
CREATE OR REPLACE FUNCTION pg_temp.merge_categorias_by_tipo(p_tipo text)
RETURNS void AS $$
DECLARE
  v_keeper_id uuid;
  v_merged jsonb;
BEGIN
  -- Pegar o ID do registro mais antigo (será o keeper)
  SELECT id INTO v_keeper_id
  FROM configuracoes_categorias
  WHERE tipo = p_tipo
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_keeper_id IS NULL THEN
    RETURN;
  END IF;

  -- Mesclar todas as categorias únicas (por value) de todos os registros do tipo
  WITH all_cats AS (
    SELECT DISTINCT ON ((cat->>'value'))
      cat
    FROM configuracoes_categorias
    CROSS JOIN LATERAL jsonb_array_elements(categorias) AS cat
    WHERE tipo = p_tipo
    ORDER BY (cat->>'value'), created_at ASC
  )
  SELECT jsonb_agg(cat) INTO v_merged FROM all_cats;

  -- Atualizar o registro keeper com as categorias mescladas
  UPDATE configuracoes_categorias
  SET categorias = COALESCE(v_merged, '[]'::jsonb),
      updated_at = now()
  WHERE id = v_keeper_id;

  -- Remover os registros duplicados (todos exceto o keeper)
  DELETE FROM configuracoes_categorias
  WHERE tipo = p_tipo AND id != v_keeper_id;
END;
$$ LANGUAGE plpgsql;

-- Executar para cada tipo
SELECT pg_temp.merge_categorias_by_tipo('demandas');
SELECT pg_temp.merge_categorias_by_tipo('despesas');
SELECT pg_temp.merge_categorias_by_tipo('estoque');
SELECT pg_temp.merge_categorias_by_tipo('funcoes_equipe');

-- Remover constraint UNIQUE antiga (user_id, tipo)
ALTER TABLE configuracoes_categorias DROP CONSTRAINT IF EXISTS configuracoes_categorias_user_id_tipo_key;
ALTER TABLE configuracoes_categorias DROP CONSTRAINT IF EXISTS unique_user_tipo;

-- Adicionar nova constraint UNIQUE apenas por tipo
ALTER TABLE configuracoes_categorias ADD CONSTRAINT configuracoes_categorias_tipo_key UNIQUE (tipo);
