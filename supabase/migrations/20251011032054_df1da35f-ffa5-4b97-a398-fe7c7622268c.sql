-- Criar tabela de configurações do usuário
CREATE TABLE IF NOT EXISTS public.configuracoes_usuario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  notificacoes jsonb NOT NULL DEFAULT '{
    "email": true,
    "push": true,
    "eventos": true,
    "demandas": true,
    "financeiro": true
  }'::jsonb,
  empresa jsonb NOT NULL DEFAULT '{
    "nome": "",
    "cnpj": "",
    "razaoSocial": "",
    "endereco": {
      "cep": "",
      "logradouro": "",
      "numero": "",
      "complemento": "",
      "bairro": "",
      "cidade": "",
      "estado": ""
    },
    "telefone": "",
    "email": "",
    "logo": ""
  }'::jsonb,
  sistema jsonb NOT NULL DEFAULT '{
    "tema": "light",
    "idioma": "pt-BR",
    "formatoData": "DD/MM/YYYY",
    "formatoHora": "HH:mm",
    "moeda": "BRL"
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.configuracoes_usuario ENABLE ROW LEVEL SECURITY;

-- Policies: Usuários podem ver e editar apenas suas próprias configurações
CREATE POLICY "Users can view own configurations"
  ON public.configuracoes_usuario
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own configurations"
  ON public.configuracoes_usuario
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own configurations"
  ON public.configuracoes_usuario
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_configuracoes_usuario_updated_at
  BEFORE UPDATE ON public.configuracoes_usuario
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();