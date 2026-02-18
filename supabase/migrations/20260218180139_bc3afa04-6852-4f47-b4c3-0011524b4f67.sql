-- Criar tabela eventos_contratos (sistema simplificado de contratos por evento)
CREATE TABLE IF NOT EXISTS public.eventos_contratos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id uuid NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  titulo text NOT NULL,
  conteudo text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'rascunho',
  arquivo_assinado_url text DEFAULT NULL,
  arquivo_assinado_nome text DEFAULT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT eventos_contratos_tipo_check CHECK (tipo IN ('bar', 'ingresso', 'bar_ingresso', 'credenciamento')),
  CONSTRAINT eventos_contratos_status_check CHECK (status IN ('rascunho', 'finalizado'))
);

-- Habilitar RLS
ALTER TABLE public.eventos_contratos ENABLE ROW LEVEL SECURITY;

-- Policy: usuários autenticados podem gerenciar contratos dos eventos
CREATE POLICY "Authenticated users can manage eventos_contratos"
  ON public.eventos_contratos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger para updated_at automático
CREATE TRIGGER update_eventos_contratos_updated_at
  BEFORE UPDATE ON public.eventos_contratos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índice em evento_id para performance
CREATE INDEX idx_eventos_contratos_evento_id ON public.eventos_contratos(evento_id);