
-- Atualizar trigger para não criar categorias duplicadas por tipo
-- Agora com constraint UNIQUE(tipo), só insere se não existir registro para o tipo
CREATE OR REPLACE FUNCTION public.criar_categorias_padrao()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Categorias de Demandas (só cria se não existir)
  INSERT INTO configuracoes_categorias (user_id, tipo, categorias)
  SELECT
    NEW.id,
    'demandas',
    '[
      {"value": "tecnica", "label": "Técnica", "ativa": true},
      {"value": "operacional", "label": "Operacional", "ativa": true},
      {"value": "comercial", "label": "Comercial", "ativa": true},
      {"value": "financeira", "label": "Financeira", "ativa": true},
      {"value": "administrativa", "label": "Administrativa", "ativa": true},
      {"value": "reembolso", "label": "Reembolso", "ativa": true},
      {"value": "outra", "label": "Outra", "ativa": true}
    ]'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM configuracoes_categorias WHERE tipo = 'demandas');

  -- Categorias de Estoque
  INSERT INTO configuracoes_categorias (user_id, tipo, categorias)
  SELECT
    NEW.id,
    'estoque',
    '[
      {"value": "iluminacao", "label": "Iluminação", "ativa": true},
      {"value": "audio", "label": "Áudio", "ativa": true},
      {"value": "video", "label": "Vídeo", "ativa": true},
      {"value": "estrutura", "label": "Estrutura", "ativa": true},
      {"value": "cenografia", "label": "Cenografia", "ativa": true},
      {"value": "geradores", "label": "Geradores", "ativa": true},
      {"value": "acessorios", "label": "Acessórios", "ativa": true},
      {"value": "outros", "label": "Outros", "ativa": true}
    ]'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM configuracoes_categorias WHERE tipo = 'estoque');

  -- Categorias de Despesas
  INSERT INTO configuracoes_categorias (user_id, tipo, categorias)
  SELECT
    NEW.id,
    'despesas',
    '[
      {"value": "transporte", "label": "Transporte", "ativa": true},
      {"value": "alimentacao", "label": "Alimentação", "ativa": true},
      {"value": "hospedagem", "label": "Hospedagem", "ativa": true},
      {"value": "equipamentos", "label": "Equipamentos", "ativa": true},
      {"value": "pessoal", "label": "Pessoal", "ativa": true},
      {"value": "marketing", "label": "Marketing", "ativa": true},
      {"value": "infraestrutura", "label": "Infraestrutura", "ativa": true},
      {"value": "outros", "label": "Outros", "ativa": true}
    ]'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM configuracoes_categorias WHERE tipo = 'despesas');

  -- Funções de Equipe
  INSERT INTO configuracoes_categorias (user_id, tipo, categorias)
  SELECT
    NEW.id,
    'funcoes_equipe',
    '[
      {"value": "tecnico_som", "label": "Técnico de Som", "ativa": true},
      {"value": "tecnico_luz", "label": "Técnico de Luz", "ativa": true},
      {"value": "rigger", "label": "Rigger", "ativa": true},
      {"value": "eletricista", "label": "Eletricista", "ativa": true},
      {"value": "motorista", "label": "Motorista", "ativa": true},
      {"value": "produtor", "label": "Produtor", "ativa": true},
      {"value": "assistente", "label": "Assistente", "ativa": true},
      {"value": "seguranca", "label": "Segurança", "ativa": true}
    ]'::jsonb
  WHERE NOT EXISTS (SELECT 1 FROM configuracoes_categorias WHERE tipo = 'funcoes_equipe');

  RETURN NEW;
END;
$function$;
