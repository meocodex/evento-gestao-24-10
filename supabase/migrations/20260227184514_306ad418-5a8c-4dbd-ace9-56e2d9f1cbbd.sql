
-- ==========================================
-- Base de Conhecimento - Categorias
-- ==========================================
CREATE TABLE public.base_conhecimento_categorias (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  descricao text,
  icone text,
  ordem integer NOT NULL DEFAULT 0,
  ativa boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.base_conhecimento_categorias ENABLE ROW LEVEL SECURITY;

-- Todos autenticados podem ver categorias ativas
CREATE POLICY "Authenticated users can view categorias"
  ON public.base_conhecimento_categorias FOR SELECT
  USING (true);

-- Apenas admins podem gerenciar categorias
CREATE POLICY "Admins can manage categorias"
  ON public.base_conhecimento_categorias FOR ALL
  USING (has_permission(auth.uid(), 'admin.full_access'))
  WITH CHECK (has_permission(auth.uid(), 'admin.full_access'));

-- Trigger updated_at
CREATE TRIGGER update_base_conhecimento_categorias_updated_at
  BEFORE UPDATE ON public.base_conhecimento_categorias
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- Base de Conhecimento - Artigos
-- ==========================================
CREATE TABLE public.base_conhecimento_artigos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo text NOT NULL,
  conteudo text NOT NULL DEFAULT '',
  resumo text,
  categoria_id uuid REFERENCES public.base_conhecimento_categorias(id) ON DELETE SET NULL,
  tags text[] DEFAULT ARRAY[]::text[],
  anexos jsonb NOT NULL DEFAULT '[]'::jsonb,
  links_externos jsonb NOT NULL DEFAULT '[]'::jsonb,
  publicado boolean NOT NULL DEFAULT false,
  autor_id uuid NOT NULL,
  autor_nome text NOT NULL,
  visualizacoes integer NOT NULL DEFAULT 0,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.base_conhecimento_artigos ENABLE ROW LEVEL SECURITY;

-- Todos autenticados podem ver artigos publicados (ou admins veem todos)
CREATE POLICY "Authenticated users can view published artigos"
  ON public.base_conhecimento_artigos FOR SELECT
  USING (publicado = true OR has_permission(auth.uid(), 'admin.full_access'));

-- Apenas admins podem inserir/atualizar/deletar
CREATE POLICY "Admins can manage artigos"
  ON public.base_conhecimento_artigos FOR ALL
  USING (has_permission(auth.uid(), 'admin.full_access'))
  WITH CHECK (has_permission(auth.uid(), 'admin.full_access'));

-- Trigger updated_at
CREATE TRIGGER update_base_conhecimento_artigos_updated_at
  BEFORE UPDATE ON public.base_conhecimento_artigos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices
CREATE INDEX idx_base_conhecimento_artigos_categoria ON public.base_conhecimento_artigos(categoria_id);
CREATE INDEX idx_base_conhecimento_artigos_publicado ON public.base_conhecimento_artigos(publicado) WHERE publicado = true;
CREATE INDEX idx_base_conhecimento_artigos_tags ON public.base_conhecimento_artigos USING GIN(tags);

-- ==========================================
-- Storage Bucket
-- ==========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('base-conhecimento', 'base-conhecimento', false);

-- Autenticados podem visualizar arquivos
CREATE POLICY "Authenticated users can view base-conhecimento files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'base-conhecimento' AND auth.role() = 'authenticated');

-- Admins podem fazer upload
CREATE POLICY "Admins can upload base-conhecimento files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'base-conhecimento' AND has_permission(auth.uid(), 'admin.full_access'));

-- Admins podem deletar
CREATE POLICY "Admins can delete base-conhecimento files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'base-conhecimento' AND has_permission(auth.uid(), 'admin.full_access'));

-- Inserir categorias padrão
INSERT INTO public.base_conhecimento_categorias (nome, descricao, icone, ordem) VALUES
  ('Geral', 'Informações gerais sobre o sistema', '📋', 0),
  ('Eventos', 'Tutoriais sobre gestão de eventos', '🎪', 1),
  ('Estoque', 'Guias de controle de estoque e materiais', '📦', 2),
  ('Financeiro', 'Orientações sobre módulo financeiro', '💰', 3),
  ('Operacional', 'Procedimentos operacionais', '⚙️', 4);
