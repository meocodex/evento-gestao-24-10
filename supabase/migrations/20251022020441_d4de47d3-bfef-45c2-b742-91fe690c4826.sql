-- ==========================================
-- FASE 1: Sistema de Permissões Granulares
-- ==========================================

-- 1. Criar tabela de permissões
CREATE TABLE IF NOT EXISTS public.permissions (
  id TEXT PRIMARY KEY,
  modulo TEXT NOT NULL,
  acao TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Popular permissões padrão (30+ permissões)
INSERT INTO public.permissions (id, modulo, acao, descricao, categoria) VALUES
  -- Eventos
  ('eventos.visualizar', 'eventos', 'visualizar', 'Visualizar eventos', 'Eventos'),
  ('eventos.visualizar_todos', 'eventos', 'visualizar_todos', 'Visualizar todos os eventos', 'Eventos'),
  ('eventos.visualizar_proprios', 'eventos', 'visualizar_proprios', 'Visualizar apenas próprios eventos', 'Eventos'),
  ('eventos.criar', 'eventos', 'criar', 'Criar novos eventos', 'Eventos'),
  ('eventos.editar_proprios', 'eventos', 'editar_proprios', 'Editar próprios eventos', 'Eventos'),
  ('eventos.editar_todos', 'eventos', 'editar_todos', 'Editar todos os eventos', 'Eventos'),
  ('eventos.deletar', 'eventos', 'deletar', 'Deletar eventos', 'Eventos'),
  ('eventos.alterar_status', 'eventos', 'alterar_status', 'Alterar status de eventos', 'Eventos'),
  
  -- Financeiro
  ('financeiro.visualizar', 'financeiro', 'visualizar', 'Visualizar dados financeiros', 'Financeiro'),
  ('financeiro.visualizar_proprios', 'financeiro', 'visualizar_proprios', 'Visualizar financeiro de próprios eventos', 'Financeiro'),
  ('financeiro.editar', 'financeiro', 'editar', 'Editar dados financeiros', 'Financeiro'),
  ('financeiro.adicionar_receita', 'financeiro', 'adicionar_receita', 'Adicionar receitas', 'Financeiro'),
  ('financeiro.adicionar_despesa', 'financeiro', 'adicionar_despesa', 'Adicionar despesas', 'Financeiro'),
  ('financeiro.aprovar_reembolso', 'financeiro', 'aprovar_reembolso', 'Aprovar reembolsos', 'Financeiro'),
  ('financeiro.visualizar_cobrancas', 'financeiro', 'visualizar_cobrancas', 'Visualizar cobranças', 'Financeiro'),
  
  -- Clientes
  ('clientes.visualizar', 'clientes', 'visualizar', 'Visualizar clientes', 'Clientes'),
  ('clientes.criar', 'clientes', 'criar', 'Criar novos clientes', 'Clientes'),
  ('clientes.editar', 'clientes', 'editar', 'Editar clientes', 'Clientes'),
  ('clientes.deletar', 'clientes', 'deletar', 'Deletar clientes', 'Clientes'),
  
  -- Estoque
  ('estoque.visualizar', 'estoque', 'visualizar', 'Visualizar estoque', 'Estoque'),
  ('estoque.criar', 'estoque', 'criar', 'Adicionar itens ao estoque', 'Estoque'),
  ('estoque.editar', 'estoque', 'editar', 'Editar itens do estoque', 'Estoque'),
  ('estoque.deletar', 'estoque', 'deletar', 'Deletar itens do estoque', 'Estoque'),
  ('estoque.alocar', 'estoque', 'alocar', 'Alocar materiais em eventos', 'Estoque'),
  ('estoque.seriais', 'estoque', 'seriais', 'Gerenciar números de série', 'Estoque'),
  
  -- Transportadoras
  ('transportadoras.visualizar', 'transportadoras', 'visualizar', 'Visualizar transportadoras', 'Transportadoras'),
  ('transportadoras.criar', 'transportadoras', 'criar', 'Criar transportadoras', 'Transportadoras'),
  ('transportadoras.editar', 'transportadoras', 'editar', 'Editar transportadoras', 'Transportadoras'),
  ('transportadoras.deletar', 'transportadoras', 'deletar', 'Deletar transportadoras', 'Transportadoras'),
  ('transportadoras.gerenciar_envios', 'transportadoras', 'gerenciar_envios', 'Gerenciar envios', 'Transportadoras'),
  
  -- Contratos
  ('contratos.visualizar', 'contratos', 'visualizar', 'Visualizar contratos', 'Contratos'),
  ('contratos.criar', 'contratos', 'criar', 'Criar contratos', 'Contratos'),
  ('contratos.editar', 'contratos', 'editar', 'Editar contratos', 'Contratos'),
  ('contratos.deletar', 'contratos', 'deletar', 'Deletar contratos', 'Contratos'),
  ('contratos.templates', 'contratos', 'templates', 'Gerenciar templates', 'Contratos'),
  
  -- Demandas
  ('demandas.visualizar', 'demandas', 'visualizar', 'Visualizar demandas', 'Demandas'),
  ('demandas.criar', 'demandas', 'criar', 'Criar demandas', 'Demandas'),
  ('demandas.editar', 'demandas', 'editar', 'Editar demandas', 'Demandas'),
  ('demandas.deletar', 'demandas', 'deletar', 'Deletar demandas', 'Demandas'),
  ('demandas.atribuir', 'demandas', 'atribuir', 'Atribuir demandas', 'Demandas'),
  
  -- Equipe
  ('equipe.visualizar', 'equipe', 'visualizar', 'Visualizar equipe', 'Equipe'),
  ('equipe.criar', 'equipe', 'criar', 'Adicionar membros à equipe', 'Equipe'),
  ('equipe.editar', 'equipe', 'editar', 'Editar membros da equipe', 'Equipe'),
  ('equipe.deletar', 'equipe', 'deletar', 'Remover membros da equipe', 'Equipe'),
  
  -- Usuários e Administração
  ('usuarios.visualizar', 'usuarios', 'visualizar', 'Visualizar usuários do sistema', 'Administração'),
  ('usuarios.criar', 'usuarios', 'criar', 'Criar novos usuários', 'Administração'),
  ('usuarios.editar', 'usuarios', 'editar', 'Editar usuários', 'Administração'),
  ('usuarios.editar_permissoes', 'usuarios', 'editar_permissoes', 'Editar permissões de usuários', 'Administração'),
  ('usuarios.deletar', 'usuarios', 'deletar', 'Deletar usuários', 'Administração'),
  
  -- Relatórios
  ('relatorios.visualizar', 'relatorios', 'visualizar', 'Visualizar relatórios', 'Relatórios'),
  ('relatorios.gerar', 'relatorios', 'gerar', 'Gerar relatórios', 'Relatórios'),
  ('relatorios.exportar', 'relatorios', 'exportar', 'Exportar relatórios', 'Relatórios'),
  
  -- Configurações
  ('configuracoes.visualizar', 'configuracoes', 'visualizar', 'Visualizar configurações', 'Configurações'),
  ('configuracoes.editar', 'configuracoes', 'editar', 'Editar configurações', 'Configurações'),
  ('configuracoes.categorias', 'configuracoes', 'categorias', 'Gerenciar categorias', 'Configurações'),
  ('configuracoes.integracoes', 'configuracoes', 'integracoes', 'Gerenciar integrações', 'Configurações');

-- 3. Criar tabela de permissões de usuários
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, permission_id)
);

-- 4. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON public.user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission_id ON public.user_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_permissions_modulo ON public.permissions(modulo);

-- 5. Criar função para verificar permissões
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_permissions
    WHERE user_id = _user_id
      AND permission_id = _permission_id
  )
$$;

-- 6. Adicionar campo tipo ao profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'sistema' CHECK (tipo IN ('sistema', 'operacional', 'ambos'));

-- 7. Migrar permissões dos usuários existentes baseado em roles
-- Admin = todas permissões
INSERT INTO public.user_permissions (user_id, permission_id)
SELECT ur.user_id, p.id
FROM public.user_roles ur
CROSS JOIN public.permissions p
WHERE ur.role = 'admin'
ON CONFLICT (user_id, permission_id) DO NOTHING;

-- Comercial = permissões limitadas
INSERT INTO public.user_permissions (user_id, permission_id)
SELECT ur.user_id, p.id
FROM public.user_roles ur
CROSS JOIN public.permissions p
WHERE ur.role = 'comercial'
  AND p.id IN (
    'eventos.visualizar', 'eventos.visualizar_proprios', 'eventos.criar', 'eventos.editar_proprios', 'eventos.alterar_status',
    'financeiro.visualizar_proprios',
    'clientes.visualizar', 'clientes.criar', 'clientes.editar',
    'estoque.visualizar',
    'contratos.visualizar', 'contratos.criar', 'contratos.editar',
    'demandas.visualizar', 'demandas.criar',
    'equipe.visualizar'
  )
ON CONFLICT (user_id, permission_id) DO NOTHING;

-- Suporte = permissões técnicas
INSERT INTO public.user_permissions (user_id, permission_id)
SELECT ur.user_id, p.id
FROM public.user_roles ur
CROSS JOIN public.permissions p
WHERE ur.role = 'suporte'
  AND p.id IN (
    'eventos.visualizar',
    'estoque.visualizar', 'estoque.criar', 'estoque.editar', 'estoque.alocar', 'estoque.seriais',
    'transportadoras.visualizar', 'transportadoras.criar', 'transportadoras.editar', 'transportadoras.gerenciar_envios',
    'demandas.visualizar', 'demandas.criar', 'demandas.editar', 'demandas.atribuir',
    'equipe.visualizar', 'equipe.criar', 'equipe.editar'
  )
ON CONFLICT (user_id, permission_id) DO NOTHING;

-- 8. Enable RLS nas novas tabelas
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- 9. Policies para permissions (todos podem ver)
CREATE POLICY "Anyone can view permissions"
ON public.permissions FOR SELECT
USING (true);

-- 10. Policies para user_permissions
CREATE POLICY "Users can view own permissions"
ON public.user_permissions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins with permission can manage user permissions"
ON public.user_permissions FOR ALL
USING (
  public.has_permission(auth.uid(), 'usuarios.editar_permissoes')
)
WITH CHECK (
  public.has_permission(auth.uid(), 'usuarios.editar_permissoes')
);