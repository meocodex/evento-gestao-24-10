-- ==============================================================================
-- PARTE 1: TORNAR CATEGORIAS GLOBAIS COM PERMISSÕES GRANULARES
-- ==============================================================================

-- 1.1 Remover políticas RLS antigas
DROP POLICY IF EXISTS "Users can insert own categorias" ON configuracoes_categorias;
DROP POLICY IF EXISTS "Users can update own categorias" ON configuracoes_categorias;
DROP POLICY IF EXISTS "Users can view own categorias" ON configuracoes_categorias;

-- 1.2 Remover constraint antiga e criar nova
ALTER TABLE configuracoes_categorias DROP CONSTRAINT IF EXISTS configuracoes_categorias_user_id_tipo_key;
ALTER TABLE configuracoes_categorias DROP CONSTRAINT IF EXISTS configuracoes_categorias_tipo_key;

-- 1.3 Consolidar dados - manter apenas um registro por tipo (do admin ou mais recente)
WITH ranked_configs AS (
  SELECT 
    *,
    ROW_NUMBER() OVER (
      PARTITION BY tipo 
      ORDER BY 
        CASE WHEN user_id IN (
          SELECT user_id FROM user_permissions WHERE permission_id = 'admin.full_access'
        ) THEN 0 ELSE 1 END,
        created_at DESC
    ) as rn
  FROM configuracoes_categorias
)
DELETE FROM configuracoes_categorias
WHERE id IN (
  SELECT id FROM ranked_configs WHERE rn > 1
);

-- 1.4 Adicionar constraint única por tipo
ALTER TABLE configuracoes_categorias ADD CONSTRAINT configuracoes_categorias_tipo_key UNIQUE (tipo);

-- 1.5 Tornar user_id nullable (apenas para histórico)
ALTER TABLE configuracoes_categorias ALTER COLUMN user_id DROP NOT NULL;

-- 1.6 Criar novas políticas RLS baseadas em permissões de módulo
CREATE POLICY "Users can view categorias by module permission"
ON configuracoes_categorias FOR SELECT
TO authenticated
USING (
  -- Categorias de estoque: precisa estoque.visualizar
  (tipo = 'estoque' AND has_permission(auth.uid(), 'estoque.visualizar'))
  OR
  -- Categorias de demandas: precisa demandas.visualizar
  (tipo = 'demandas' AND has_permission(auth.uid(), 'demandas.visualizar'))
  OR
  -- Categorias de despesas: precisa financeiro.visualizar ou financeiro.visualizar_proprios
  (tipo = 'despesas' AND (has_permission(auth.uid(), 'financeiro.visualizar') 
                         OR has_permission(auth.uid(), 'financeiro.visualizar_proprios')))
  OR
  -- Funções de equipe: precisa equipe.visualizar
  (tipo = 'funcoes_equipe' AND has_permission(auth.uid(), 'equipe.visualizar'))
  OR
  -- Admin tem acesso total
  has_permission(auth.uid(), 'admin.full_access')
);

CREATE POLICY "Users with permission can manage categorias"
ON configuracoes_categorias FOR ALL
TO authenticated
USING (has_permission(auth.uid(), 'configuracoes.categorias') 
       OR has_permission(auth.uid(), 'admin.full_access'))
WITH CHECK (has_permission(auth.uid(), 'configuracoes.categorias') 
            OR has_permission(auth.uid(), 'admin.full_access'));

-- ==============================================================================
-- PARTE 2: CRIAR TABELA GLOBAL PARA CONFIGURAÇÕES DA EMPRESA
-- ==============================================================================

-- 2.1 Criar tabela configuracoes_empresa
CREATE TABLE IF NOT EXISTS configuracoes_empresa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text,
  razao_social text,
  cnpj text,
  email text,
  telefone text,
  endereco jsonb DEFAULT '{}',
  logo text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2.2 Ativar RLS
ALTER TABLE configuracoes_empresa ENABLE ROW LEVEL SECURITY;

-- 2.3 Criar políticas RLS com permissões granulares
CREATE POLICY "Users who need company data can view"
ON configuracoes_empresa FOR SELECT
TO authenticated
USING (
  has_permission(auth.uid(), 'admin.full_access')
  OR has_permission(auth.uid(), 'contratos.visualizar')
  OR has_permission(auth.uid(), 'relatorios.gerar')
  OR has_permission(auth.uid(), 'operacao.registrar_retirada')
  OR has_permission(auth.uid(), 'transportadoras.editar')
  OR has_permission(auth.uid(), 'financeiro.visualizar')
  OR has_permission(auth.uid(), 'financeiro.visualizar_proprios')
);

CREATE POLICY "Admins can manage empresa"
ON configuracoes_empresa FOR ALL
TO authenticated
USING (has_permission(auth.uid(), 'admin.full_access'))
WITH CHECK (has_permission(auth.uid(), 'admin.full_access'));

-- 2.4 Trigger para atualizar updated_at
CREATE TRIGGER update_configuracoes_empresa_updated_at
BEFORE UPDATE ON configuracoes_empresa
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 2.5 Migrar dados do admin para nova tabela
INSERT INTO configuracoes_empresa (nome, razao_social, cnpj, email, telefone, endereco, logo)
SELECT 
  cu.empresa->>'nome',
  cu.empresa->>'razaoSocial',
  cu.empresa->>'cnpj',
  cu.empresa->>'email',
  cu.empresa->>'telefone',
  cu.empresa->'endereco',
  cu.empresa->>'logo'
FROM configuracoes_usuario cu
WHERE cu.user_id IN (
  SELECT user_id FROM user_permissions WHERE permission_id = 'admin.full_access' LIMIT 1
)
AND NOT EXISTS (SELECT 1 FROM configuracoes_empresa)
LIMIT 1;