-- Limpar tipos de ingresso vazios da tabela eventos
UPDATE eventos
SET configuracao_ingresso = jsonb_set(
  configuracao_ingresso,
  '{setores}',
  (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_set(
          setor,
          '{tiposIngresso}',
          (
            SELECT COALESCE(
              jsonb_agg(tipo) FILTER (WHERE tipo->>'nome' IS NOT NULL AND tipo->>'nome' != ''),
              '[]'::jsonb
            )
            FROM jsonb_array_elements(setor->'tiposIngresso') AS tipo
          )
        )
      ) FILTER (WHERE setor->>'nome' IS NOT NULL AND setor->>'nome' != ''),
      '[]'::jsonb
    )
    FROM jsonb_array_elements(configuracao_ingresso->'setores') AS setor
  )
)
WHERE configuracao_ingresso IS NOT NULL
  AND configuracao_ingresso->'setores' IS NOT NULL;

-- Mesma limpeza para cadastros_publicos
UPDATE cadastros_publicos
SET configuracao_ingresso = jsonb_set(
  configuracao_ingresso,
  '{setores}',
  (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_set(
          setor,
          '{tiposIngresso}',
          (
            SELECT COALESCE(
              jsonb_agg(tipo) FILTER (WHERE tipo->>'nome' IS NOT NULL AND tipo->>'nome' != ''),
              '[]'::jsonb
            )
            FROM jsonb_array_elements(setor->'tiposIngresso') AS tipo
          )
        )
      ) FILTER (WHERE setor->>'nome' IS NOT NULL AND setor->>'nome' != ''),
      '[]'::jsonb
    )
    FROM jsonb_array_elements(configuracao_ingresso->'setores') AS setor
  )
)
WHERE configuracao_ingresso IS NOT NULL
  AND configuracao_ingresso->'setores' IS NOT NULL;