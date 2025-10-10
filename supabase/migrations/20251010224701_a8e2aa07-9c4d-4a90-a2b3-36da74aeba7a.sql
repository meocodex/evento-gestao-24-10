-- ========================================
-- PARTE 1: ENUMS E TIPOS
-- ========================================

-- Enum para roles do sistema
CREATE TYPE app_role AS ENUM ('admin', 'comercial', 'suporte');

-- Enum para tipo de cliente
CREATE TYPE tipo_cliente AS ENUM ('CPF', 'CNPJ');

-- Enum para status do evento
CREATE TYPE status_evento AS ENUM (
  'orcamento_enviado', 'confirmado', 'materiais_alocados',
  'em_preparacao', 'em_andamento', 'aguardando_retorno',
  'aguardando_fechamento', 'finalizado', 'cancelado', 'aguardando_alocacao'
);

-- Enum para tipo de evento
CREATE TYPE tipo_evento AS ENUM ('ingresso', 'bar', 'hibrido');

-- Enum para status de material alocado
CREATE TYPE status_material AS ENUM ('reservado', 'separado', 'em_transito', 'entregue', 'preparado');

-- Enum para tipo de envio
CREATE TYPE tipo_envio AS ENUM ('antecipado', 'com_tecnicos');

-- Enum para status financeiro
CREATE TYPE status_financeiro AS ENUM ('pendente', 'pago', 'cancelado', 'em_negociacao');

-- Enum para tipo de receita
CREATE TYPE tipo_receita AS ENUM ('fixo', 'quantidade');

-- Enum para categoria financeira
CREATE TYPE categoria_financeira AS ENUM (
  'pessoal', 'transporte', 'insumos', 'alimentacao', 
  'Reembolso de Equipe', 'outros'
);

-- Enum para tipo de timeline
CREATE TYPE tipo_timeline AS ENUM (
  'criacao', 'edicao', 'confirmacao', 'alocacao', 'envio', 
  'entrega', 'execucao', 'retorno', 'fechamento', 'cancelamento', 'financeiro'
);

-- Enum para status de demanda
CREATE TYPE status_demanda AS ENUM ('aberta', 'em-andamento', 'concluida', 'cancelada');

-- Enum para prioridade de demanda
CREATE TYPE prioridade_demanda AS ENUM ('baixa', 'media', 'alta', 'urgente');

-- Enum para categoria de demanda
CREATE TYPE categoria_demanda AS ENUM (
  'tecnica', 'operacional', 'comercial', 'financeira', 
  'administrativa', 'reembolso', 'outra'
);

-- Enum para status de contrato
CREATE TYPE status_contrato AS ENUM (
  'proposta', 'em_negociacao', 'aprovada', 'rascunho', 
  'em_revisao', 'aguardando_assinatura', 'assinado', 'cancelado', 'expirado'
);

-- Enum para status de serial
CREATE TYPE status_serial AS ENUM ('disponivel', 'em-uso', 'manutencao');

-- ========================================
-- PARTE 2: TABELAS CORE (AUTENTICAÇÃO)
-- ========================================

-- Tabela de perfis de usuário
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de roles (SEPARADA - CRÍTICO PARA SEGURANÇA)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Função de segurança para verificar roles (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Trigger para criar profile ao signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    NEW.email
  );
  
  -- Primeiro usuário é admin
  IF (SELECT COUNT(*) FROM user_roles) = 0 THEN
    INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    -- Usuários seguintes são comercial por padrão
    INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'comercial');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ========================================
-- PARTE 3: TABELAS DE NEGÓCIO
-- ========================================

-- Tabela de Clientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo tipo_cliente NOT NULL,
  documento TEXT NOT NULL UNIQUE,
  telefone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT NOT NULL,
  endereco JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clientes_documento ON clientes(documento);
CREATE INDEX idx_clientes_nome ON clientes USING gin(to_tsvector('portuguese', nome));
CREATE INDEX idx_clientes_email ON clientes(email);

-- Tabela de Eventos
CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  local TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  endereco TEXT NOT NULL,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  comercial_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status status_evento NOT NULL DEFAULT 'orcamento_enviado',
  tipo_evento tipo_evento NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  planta_baixa TEXT,
  descricao TEXT,
  observacoes TEXT,
  contatos_adicionais TEXT,
  redes_sociais TEXT,
  documentos TEXT[],
  fotos_evento TEXT[],
  configuracao_ingresso JSONB,
  configuracao_bar JSONB,
  observacoes_operacionais TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_eventos_status ON eventos(status);
CREATE INDEX idx_eventos_data_inicio ON eventos(data_inicio);
CREATE INDEX idx_eventos_cliente_id ON eventos(cliente_id);
CREATE INDEX idx_eventos_comercial_id ON eventos(comercial_id);
CREATE INDEX idx_eventos_tags ON eventos USING gin(tags);

-- Tabela de Checklist de Eventos
CREATE TABLE eventos_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE NOT NULL,
  item_id TEXT NOT NULL,
  nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 0,
  alocado INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(evento_id, item_id)
);

CREATE INDEX idx_checklist_evento ON eventos_checklist(evento_id);

-- Tabela de Materiais Alocados
CREATE TABLE eventos_materiais_alocados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE NOT NULL,
  item_id TEXT NOT NULL,
  nome TEXT NOT NULL,
  serial TEXT NOT NULL,
  status status_material NOT NULL DEFAULT 'reservado',
  tipo_envio tipo_envio NOT NULL,
  transportadora TEXT,
  data_envio DATE,
  rastreamento TEXT,
  responsavel TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_materiais_alocados_evento ON eventos_materiais_alocados(evento_id);
CREATE INDEX idx_materiais_alocados_serial ON eventos_materiais_alocados(serial);

-- Tabela de Receitas
CREATE TABLE eventos_receitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE NOT NULL,
  descricao TEXT NOT NULL,
  tipo tipo_receita NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario DECIMAL(10,2) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  status status_financeiro NOT NULL DEFAULT 'pendente',
  data DATE NOT NULL,
  comprovante TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_receitas_evento ON eventos_receitas(evento_id);

-- Tabela de Despesas
CREATE TABLE eventos_despesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE NOT NULL,
  descricao TEXT NOT NULL,
  categoria categoria_financeira NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario DECIMAL(10,2) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data DATE,
  data_pagamento DATE,
  status status_financeiro DEFAULT 'pendente',
  responsavel TEXT,
  observacoes TEXT,
  comprovante TEXT,
  selecionada_relatorio BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_despesas_evento ON eventos_despesas(evento_id);

-- Tabela de Cobranças
CREATE TABLE eventos_cobrancas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE NOT NULL,
  item TEXT NOT NULL,
  serial TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  status status_financeiro NOT NULL DEFAULT 'pendente',
  motivo TEXT NOT NULL CHECK (motivo IN ('perdido', 'danificado', 'atraso')),
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cobrancas_evento ON eventos_cobrancas(evento_id);

-- Tabela de Timeline
CREATE TABLE eventos_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE NOT NULL,
  data TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tipo tipo_timeline NOT NULL,
  usuario TEXT NOT NULL,
  descricao TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timeline_evento ON eventos_timeline(evento_id, data DESC);

-- Tabela de Equipe
CREATE TABLE eventos_equipe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  funcao TEXT NOT NULL,
  telefone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_equipe_evento ON eventos_equipe(evento_id);