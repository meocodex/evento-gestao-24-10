-- Criar tabela de categorias customizáveis
CREATE TABLE IF NOT EXISTS public.configuracoes_categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('demandas', 'estoque', 'despesas', 'funcoes_equipe')),
  categorias jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, tipo)
);

-- Habilitar RLS
ALTER TABLE public.configuracoes_categorias ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own categorias"
ON public.configuracoes_categorias
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categorias"
ON public.configuracoes_categorias
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categorias"
ON public.configuracoes_categorias
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_configuracoes_categorias_updated_at
BEFORE UPDATE ON public.configuracoes_categorias
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar categorias padrão
CREATE OR REPLACE FUNCTION public.criar_categorias_padrao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Categorias de Demandas
  INSERT INTO configuracoes_categorias (user_id, tipo, categorias)
  VALUES (
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
  );

  -- Categorias de Estoque
  INSERT INTO configuracoes_categorias (user_id, tipo, categorias)
  VALUES (
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
  );

  -- Categorias de Despesas
  INSERT INTO configuracoes_categorias (user_id, tipo, categorias)
  VALUES (
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
  );

  -- Funções de Equipe
  INSERT INTO configuracoes_categorias (user_id, tipo, categorias)
  VALUES (
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
  );

  RETURN NEW;
END;
$$;

-- Trigger para criar categorias padrão ao criar novo usuário
CREATE TRIGGER criar_categorias_padrao_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.criar_categorias_padrao();