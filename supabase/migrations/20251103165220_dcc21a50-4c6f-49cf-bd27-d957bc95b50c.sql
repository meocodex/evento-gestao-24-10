-- ========================================
-- MIGRAÇÃO: Sistema de Permissões Granulares
-- Remove dependência de roles fixas
-- ========================================

-- 1) Corrigir permissões do Rafael (user_id específico)
INSERT INTO user_permissions (user_id, permission_id)
SELECT '54da664c-256b-479c-a9d4-296e206a587a', p.id
FROM permissions p
WHERE p.id IN (
  -- Eventos
  'eventos.visualizar',
  'eventos.criar',
  'eventos.editar_proprios',
  'eventos.alterar_status',
  -- Clientes (CRÍTICO para dropdown)
  'clientes.visualizar',
  'clientes.criar',
  'clientes.editar',
  -- Estoque
  'estoque.visualizar',
  'estoque.criar',
  'estoque.editar',
  'estoque.alocar',
  'estoque.seriais',
  -- Transportadoras
  'transportadoras.visualizar',
  'transportadoras.criar',
  'transportadoras.editar',
  'transportadoras.gerenciar_envios',
  -- Demandas
  'demandas.visualizar',
  'demandas.criar',
  'demandas.editar',
  'demandas.atribuir',
  -- Equipe
  'equipe.visualizar',
  'equipe.criar',
  'equipe.editar',
  -- Configurações
  'configuracoes.visualizar'
)
ON CONFLICT (user_id, permission_id) DO NOTHING;

-- 2) Criar permissão especial para Admin
INSERT INTO permissions (id, modulo, categoria, acao, descricao)
VALUES (
  'admin.full_access',
  'sistema',
  'Administração',
  'full_access',
  'Acesso administrativo completo a todas as funcionalidades do sistema'
)
ON CONFLICT (id) DO NOTHING;

-- 3) Garantir que admins existentes tenham admin.full_access
INSERT INTO user_permissions (user_id, permission_id)
SELECT ur.user_id, 'admin.full_access'
FROM user_roles ur
WHERE ur.role = 'admin'
ON CONFLICT (user_id, permission_id) DO NOTHING;

-- 4) Migrar RLS Policies - Remover has_role() exceto admin.full_access

-- 4.1) clientes - SELECT
DROP POLICY IF EXISTS "Users with permission can view clientes" ON public.clientes;
CREATE POLICY "Users with permission can view clientes"
ON public.clientes FOR SELECT
USING (
  has_permission(auth.uid(), 'clientes.visualizar')
  OR has_permission(auth.uid(), 'admin.full_access')
);

-- 4.2) contratos - SELECT
DROP POLICY IF EXISTS "Users with permission can view contratos" ON public.contratos;
CREATE POLICY "Users with permission can view contratos"
ON public.contratos FOR SELECT
USING (
  has_permission(auth.uid(), 'contratos.visualizar')
  OR has_permission(auth.uid(), 'admin.full_access')
);

-- 4.3) demandas - UPDATE
DROP POLICY IF EXISTS "Relevant users can update demandas" ON public.demandas;
CREATE POLICY "Relevant users can update demandas"
ON public.demandas FOR UPDATE
USING (
  has_permission(auth.uid(), 'admin.full_access')
  OR (solicitante_id = auth.uid())
  OR (responsavel_id = auth.uid())
);

-- 4.4) demandas_comentarios - SELECT
DROP POLICY IF EXISTS "Users can view comments on accessible demandas" ON public.demandas_comentarios;
CREATE POLICY "Users can view comments on accessible demandas"
ON public.demandas_comentarios FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM demandas d
    WHERE d.id = demandas_comentarios.demanda_id
    AND (
      has_permission(auth.uid(), 'admin.full_access')
      OR d.solicitante_id = auth.uid()
      OR d.responsavel_id = auth.uid()
    )
  )
);

-- 4.5) eventos_configuracao_historico - INSERT
DROP POLICY IF EXISTS "Admin and Suporte can insert config history" ON public.eventos_configuracao_historico;
CREATE POLICY "Admin and Suporte can insert config history"
ON public.eventos_configuracao_historico FOR INSERT
WITH CHECK (
  has_permission(auth.uid(), 'admin.full_access')
  OR has_permission(auth.uid(), 'eventos.editar_todos')
  OR has_permission(auth.uid(), 'eventos.editar_proprios')
);

-- 4.6) eventos_despesas - SELECT
DROP POLICY IF EXISTS "Users with permission can view despesas" ON public.eventos_despesas;
CREATE POLICY "Users with permission can view despesas"
ON public.eventos_despesas FOR SELECT
USING (
  has_permission(auth.uid(), 'financeiro.visualizar')
  OR has_permission(auth.uid(), 'admin.full_access')
  OR (
    has_permission(auth.uid(), 'financeiro.visualizar_proprios')
    AND EXISTS (
      SELECT 1 FROM eventos e
      WHERE e.id = eventos_despesas.evento_id
      AND e.comercial_id = auth.uid()
    )
  )
);

-- 4.7) eventos_receitas - SELECT
DROP POLICY IF EXISTS "Users with permission can view receitas" ON public.eventos_receitas;
CREATE POLICY "Users with permission can view receitas"
ON public.eventos_receitas FOR SELECT
USING (
  has_permission(auth.uid(), 'financeiro.visualizar')
  OR has_permission(auth.uid(), 'admin.full_access')
  OR (
    has_permission(auth.uid(), 'financeiro.visualizar_proprios')
    AND EXISTS (
      SELECT 1 FROM eventos e
      WHERE e.id = eventos_receitas.evento_id
      AND e.comercial_id = auth.uid()
    )
  )
);

-- 4.8) eventos_timeline - INSERT
DROP POLICY IF EXISTS "Users can insert timeline for authorized events" ON public.eventos_timeline;
CREATE POLICY "Users can insert timeline for authorized events"
ON public.eventos_timeline FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM eventos e
    WHERE e.id = eventos_timeline.evento_id
    AND (
      has_permission(auth.uid(), 'admin.full_access')
      OR (has_permission(auth.uid(), 'eventos.editar_proprios') AND e.comercial_id = auth.uid())
      OR has_permission(auth.uid(), 'eventos.editar_todos')
    )
  )
);

-- 5) Adicionar comentário na tabela user_roles
COMMENT ON TABLE user_roles IS 
'DEPRECATED: Esta tabela não é mais usada ativamente. Permissões são gerenciadas exclusivamente via user_permissions. Mantida apenas para compatibilidade e rollback.';