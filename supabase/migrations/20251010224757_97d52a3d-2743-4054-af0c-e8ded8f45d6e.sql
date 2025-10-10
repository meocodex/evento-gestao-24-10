-- ========================================
-- PARTE 4: DEMANDAS
-- ========================================

-- Tabela de Demandas
CREATE TABLE demandas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria categoria_demanda NOT NULL,
  prioridade prioridade_demanda NOT NULL DEFAULT 'media',
  status status_demanda NOT NULL DEFAULT 'aberta',
  solicitante TEXT NOT NULL,
  solicitante_id UUID REFERENCES auth.users(id),
  responsavel TEXT,
  responsavel_id UUID REFERENCES auth.users(id),
  prazo DATE,
  data_conclusao TIMESTAMPTZ,
  evento_id UUID REFERENCES eventos(id) ON DELETE SET NULL,
  evento_nome TEXT,
  resolvida BOOLEAN DEFAULT FALSE,
  arquivada BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  dados_reembolso JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_demandas_status ON demandas(status);
CREATE INDEX idx_demandas_solicitante ON demandas(solicitante_id);
CREATE INDEX idx_demandas_responsavel ON demandas(responsavel_id);
CREATE INDEX idx_demandas_evento ON demandas(evento_id);

-- Tabela de Comentários de Demandas
CREATE TABLE demandas_comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id UUID REFERENCES demandas(id) ON DELETE CASCADE NOT NULL,
  autor TEXT NOT NULL,
  autor_id UUID REFERENCES auth.users(id),
  conteudo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('resposta', 'comentario', 'sistema')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comentarios_demanda ON demandas_comentarios(demanda_id);

-- Tabela de Anexos de Demandas
CREATE TABLE demandas_anexos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id UUID REFERENCES demandas(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  url TEXT NOT NULL,
  tipo TEXT NOT NULL,
  tamanho INTEGER NOT NULL,
  upload_por TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_anexos_demanda ON demandas_anexos(demanda_id);

-- ========================================
-- PARTE 5: CONTRATOS
-- ========================================

-- Tabela de Templates de Contrato
CREATE TABLE contratos_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('evento', 'fornecedor', 'cliente', 'outros')),
  descricao TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  variaveis TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  versao INTEGER NOT NULL DEFAULT 1,
  papel_timbrado TEXT,
  margens JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Contratos
CREATE TABLE contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES contratos_templates(id) ON DELETE SET NULL,
  numero TEXT NOT NULL UNIQUE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  evento_id UUID REFERENCES eventos(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('evento', 'fornecedor', 'cliente', 'outros')),
  status status_contrato NOT NULL DEFAULT 'rascunho',
  conteudo TEXT NOT NULL,
  valor DECIMAL(10,2),
  data_inicio DATE,
  data_fim DATE,
  validade DATE,
  itens JSONB,
  dados_evento JSONB,
  assinaturas JSONB NOT NULL DEFAULT '[]'::jsonb,
  aprovacoes_historico JSONB DEFAULT '[]'::jsonb,
  condicoes_pagamento TEXT,
  prazo_execucao TEXT,
  garantia TEXT,
  observacoes_comerciais TEXT,
  observacoes TEXT,
  anexos TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contratos_cliente ON contratos(cliente_id);
CREATE INDEX idx_contratos_evento ON contratos(evento_id);
CREATE INDEX idx_contratos_status ON contratos(status);

-- ========================================
-- PARTE 6: ESTOQUE
-- ========================================

-- Tabela de Materiais do Estoque
CREATE TABLE materiais_estoque (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT,
  quantidade_total INTEGER NOT NULL DEFAULT 0,
  quantidade_disponivel INTEGER NOT NULL DEFAULT 0,
  valor_unitario DECIMAL(10,2),
  foto TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Seriais dos Materiais
CREATE TABLE materiais_seriais (
  numero TEXT PRIMARY KEY,
  material_id TEXT REFERENCES materiais_estoque(id) ON DELETE CASCADE NOT NULL,
  status status_serial NOT NULL DEFAULT 'disponivel',
  localizacao TEXT NOT NULL,
  observacoes TEXT,
  data_aquisicao DATE,
  ultima_manutencao DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_seriais_material ON materiais_seriais(material_id);
CREATE INDEX idx_seriais_status ON materiais_seriais(status);

-- ========================================
-- PARTE 7: TRANSPORTADORAS
-- ========================================

-- Tabela de Transportadoras
CREATE TABLE transportadoras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cnpj TEXT NOT NULL UNIQUE,
  razao_social TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa')),
  endereco JSONB NOT NULL,
  dados_bancarios JSONB,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Rotas Atendidas
CREATE TABLE transportadoras_rotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transportadora_id UUID REFERENCES transportadoras(id) ON DELETE CASCADE NOT NULL,
  cidade_destino TEXT NOT NULL,
  estado_destino TEXT NOT NULL,
  prazo_entrega INTEGER NOT NULL,
  valor_base DECIMAL(10,2),
  ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rotas_transportadora ON transportadoras_rotas(transportadora_id);

-- Tabela de Envios
CREATE TABLE envios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transportadora_id UUID REFERENCES transportadoras(id) ON DELETE SET NULL,
  evento_id UUID REFERENCES eventos(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('ida', 'volta')),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_transito', 'entregue', 'cancelado')),
  data_coleta DATE,
  data_entrega DATE,
  data_entrega_prevista DATE NOT NULL,
  origem TEXT NOT NULL,
  destino TEXT NOT NULL,
  rastreio TEXT,
  valor DECIMAL(10,2),
  forma_pagamento TEXT NOT NULL CHECK (forma_pagamento IN ('antecipado', 'na_entrega', 'a_combinar')),
  comprovante_pagamento TEXT,
  despesa_evento_id UUID REFERENCES eventos_despesas(id),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_envios_transportadora ON envios(transportadora_id);
CREATE INDEX idx_envios_evento ON envios(evento_id);

-- ========================================
-- PARTE 8: CADASTROS PÚBLICOS
-- ========================================

-- Tabela de Cadastros Públicos
CREATE TABLE cadastros_publicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_analise', 'aprovado', 'recusado')),
  tipo_evento tipo_evento NOT NULL,
  nome TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  local TEXT NOT NULL,
  endereco TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  produtor JSONB NOT NULL,
  configuracao_ingresso JSONB,
  configuracao_bar JSONB,
  observacoes_internas TEXT,
  evento_id UUID REFERENCES eventos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cadastros_publicos_protocolo ON cadastros_publicos(protocolo);
CREATE INDEX idx_cadastros_publicos_status ON cadastros_publicos(status);

-- ========================================
-- PARTE 9: TRIGGERS DE UPDATED_AT
-- ========================================

-- Função genérica para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers em todas as tabelas relevantes
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON eventos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_eventos_checklist_updated_at BEFORE UPDATE ON eventos_checklist FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_eventos_materiais_updated_at BEFORE UPDATE ON eventos_materiais_alocados FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_eventos_receitas_updated_at BEFORE UPDATE ON eventos_receitas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_eventos_despesas_updated_at BEFORE UPDATE ON eventos_despesas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_eventos_equipe_updated_at BEFORE UPDATE ON eventos_equipe FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_demandas_updated_at BEFORE UPDATE ON demandas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contratos_updated_at BEFORE UPDATE ON contratos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON contratos_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materiais_updated_at BEFORE UPDATE ON materiais_estoque FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seriais_updated_at BEFORE UPDATE ON materiais_seriais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transportadoras_updated_at BEFORE UPDATE ON transportadoras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rotas_updated_at BEFORE UPDATE ON transportadoras_rotas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_envios_updated_at BEFORE UPDATE ON envios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cadastros_updated_at BEFORE UPDATE ON cadastros_publicos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();