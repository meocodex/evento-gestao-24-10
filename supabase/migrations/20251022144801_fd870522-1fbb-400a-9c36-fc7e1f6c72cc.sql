-- ====================================
-- FASE 5: Atualizar RLS Policies
-- Substituir has_role() por has_permission()
-- ====================================

-- EVENTOS
DROP POLICY IF EXISTS "Comercial and Admin can create eventos" ON eventos;
CREATE POLICY "Users with permission can create eventos" ON eventos
  FOR INSERT WITH CHECK (has_permission(auth.uid(), 'eventos.criar'));

DROP POLICY IF EXISTS "Comercial can update own eventos, Admin all" ON eventos;
CREATE POLICY "Users can update eventos based on permissions" ON eventos
  FOR UPDATE USING (
    has_permission(auth.uid(), 'eventos.editar_todos') OR
    (has_permission(auth.uid(), 'eventos.editar_proprios') AND comercial_id = auth.uid())
  );

DROP POLICY IF EXISTS "Only Admin can delete eventos" ON eventos;
CREATE POLICY "Users with permission can delete eventos" ON eventos
  FOR DELETE USING (has_permission(auth.uid(), 'eventos.deletar'));

-- EVENTOS_RECEITAS
DROP POLICY IF EXISTS "Only Admin can manage receitas" ON eventos_receitas;
DROP POLICY IF EXISTS "Only Admin can view receitas" ON eventos_receitas;
CREATE POLICY "Users with permission can view receitas" ON eventos_receitas
  FOR SELECT USING (
    has_permission(auth.uid(), 'financeiro.visualizar') OR
    has_permission(auth.uid(), 'financeiro.visualizar_proprios')
  );
CREATE POLICY "Users with permission can manage receitas" ON eventos_receitas
  FOR ALL USING (has_permission(auth.uid(), 'financeiro.editar'))
  WITH CHECK (has_permission(auth.uid(), 'financeiro.editar'));

-- EVENTOS_DESPESAS  
DROP POLICY IF EXISTS "Only Admin can manage despesas" ON eventos_despesas;
DROP POLICY IF EXISTS "Only Admin can view despesas" ON eventos_despesas;
CREATE POLICY "Users with permission can view despesas" ON eventos_despesas
  FOR SELECT USING (
    has_permission(auth.uid(), 'financeiro.visualizar') OR
    has_permission(auth.uid(), 'financeiro.visualizar_proprios')
  );
CREATE POLICY "Users with permission can manage despesas" ON eventos_despesas
  FOR ALL USING (has_permission(auth.uid(), 'financeiro.editar'))
  WITH CHECK (has_permission(auth.uid(), 'financeiro.editar'));

-- EVENTOS_COBRANCAS
DROP POLICY IF EXISTS "Only Admin can manage cobrancas" ON eventos_cobrancas;
DROP POLICY IF EXISTS "Only Admin can view cobrancas" ON eventos_cobrancas;
CREATE POLICY "Users with permission can view cobrancas" ON eventos_cobrancas
  FOR SELECT USING (has_permission(auth.uid(), 'financeiro.visualizar'));
CREATE POLICY "Users with permission can manage cobrancas" ON eventos_cobrancas
  FOR ALL USING (has_permission(auth.uid(), 'financeiro.editar'))
  WITH CHECK (has_permission(auth.uid(), 'financeiro.editar'));

-- CLIENTES
DROP POLICY IF EXISTS "Comercial and Admin can create clientes" ON clientes;
CREATE POLICY "Users with permission can create clientes" ON clientes
  FOR INSERT WITH CHECK (has_permission(auth.uid(), 'clientes.criar'));

DROP POLICY IF EXISTS "Comercial and Admin can update clientes" ON clientes;
CREATE POLICY "Users with permission can update clientes" ON clientes
  FOR UPDATE USING (has_permission(auth.uid(), 'clientes.editar'));

DROP POLICY IF EXISTS "Only Admin can delete clientes" ON clientes;
CREATE POLICY "Users with permission can delete clientes" ON clientes
  FOR DELETE USING (has_permission(auth.uid(), 'clientes.deletar'));

-- CONTRATOS
DROP POLICY IF EXISTS "Admin and Comercial can manage contratos" ON contratos;
CREATE POLICY "Users with permission can manage contratos" ON contratos
  FOR ALL USING (
    has_permission(auth.uid(), 'contratos.visualizar') OR
    has_permission(auth.uid(), 'contratos.editar')
  )
  WITH CHECK (has_permission(auth.uid(), 'contratos.editar'));

-- CONTRATOS_TEMPLATES
DROP POLICY IF EXISTS "Admin and Comercial can manage templates" ON contratos_templates;
CREATE POLICY "Users with permission can manage templates" ON contratos_templates
  FOR ALL USING (
    has_permission(auth.uid(), 'contratos.visualizar') OR
    has_permission(auth.uid(), 'contratos.editar')
  )
  WITH CHECK (has_permission(auth.uid(), 'contratos.editar'));

-- DEMANDAS
DROP POLICY IF EXISTS "Only Admin can delete demandas" ON demandas;
CREATE POLICY "Users with permission can delete demandas" ON demandas
  FOR DELETE USING (has_permission(auth.uid(), 'demandas.deletar'));

-- MATERIAIS_ESTOQUE
DROP POLICY IF EXISTS "Admin and Suporte can manage materiais" ON materiais_estoque;
CREATE POLICY "Users with permission can manage materiais" ON materiais_estoque
  FOR ALL USING (has_permission(auth.uid(), 'estoque.editar'))
  WITH CHECK (has_permission(auth.uid(), 'estoque.editar'));

-- MATERIAIS_SERIAIS
DROP POLICY IF EXISTS "Admin and Suporte can manage seriais" ON materiais_seriais;
CREATE POLICY "Users with permission can manage seriais" ON materiais_seriais
  FOR ALL USING (has_permission(auth.uid(), 'estoque.editar'))
  WITH CHECK (has_permission(auth.uid(), 'estoque.editar'));

-- EQUIPE_OPERACIONAL
DROP POLICY IF EXISTS "Admin and Suporte can manage equipe_operacional" ON equipe_operacional;
CREATE POLICY "Users with permission can manage equipe_operacional" ON equipe_operacional
  FOR ALL USING (has_permission(auth.uid(), 'equipe.editar'));

DROP POLICY IF EXISTS "Comercial can view active equipe_operacional" ON equipe_operacional;
CREATE POLICY "Users with permission can view equipe_operacional" ON equipe_operacional
  FOR SELECT USING (
    has_permission(auth.uid(), 'equipe.visualizar') OR
    has_permission(auth.uid(), 'equipe.editar')
  );

-- TRANSPORTADORAS
DROP POLICY IF EXISTS "Admin and Suporte can manage transportadoras" ON transportadoras;
DROP POLICY IF EXISTS "Admin and Suporte can view transportadoras" ON transportadoras;
CREATE POLICY "Users with permission can view transportadoras" ON transportadoras
  FOR SELECT USING (
    has_permission(auth.uid(), 'transportadoras.visualizar') OR
    has_permission(auth.uid(), 'transportadoras.editar')
  );
CREATE POLICY "Users with permission can manage transportadoras" ON transportadoras
  FOR ALL USING (has_permission(auth.uid(), 'transportadoras.editar'))
  WITH CHECK (has_permission(auth.uid(), 'transportadoras.editar'));

-- TRANSPORTADORAS_ROTAS
DROP POLICY IF EXISTS "Admin and Suporte can manage rotas" ON transportadoras_rotas;
CREATE POLICY "Users with permission can manage rotas" ON transportadoras_rotas
  FOR ALL USING (has_permission(auth.uid(), 'transportadoras.editar'))
  WITH CHECK (has_permission(auth.uid(), 'transportadoras.editar'));

-- ENVIOS
DROP POLICY IF EXISTS "Admin and Suporte can manage envios" ON envios;
CREATE POLICY "Users with permission can manage envios" ON envios
  FOR ALL USING (has_permission(auth.uid(), 'transportadoras.editar'))
  WITH CHECK (has_permission(auth.uid(), 'transportadoras.editar'));

-- EVENTOS_CHECKLIST
DROP POLICY IF EXISTS "Admin and Suporte can manage checklist" ON eventos_checklist;
CREATE POLICY "Users with permission can manage checklist" ON eventos_checklist
  FOR ALL USING (
    has_permission(auth.uid(), 'eventos.editar_todos') OR
    has_permission(auth.uid(), 'eventos.editar_proprios')
  )
  WITH CHECK (
    has_permission(auth.uid(), 'eventos.editar_todos') OR
    has_permission(auth.uid(), 'eventos.editar_proprios')
  );

-- EVENTOS_EQUIPE
DROP POLICY IF EXISTS "Admin and Suporte can manage equipe" ON eventos_equipe;
CREATE POLICY "Users with permission can manage equipe" ON eventos_equipe
  FOR ALL USING (
    has_permission(auth.uid(), 'equipe.editar') OR
    has_permission(auth.uid(), 'eventos.editar_todos')
  )
  WITH CHECK (
    has_permission(auth.uid(), 'equipe.editar') OR
    has_permission(auth.uid(), 'eventos.editar_todos')
  );

-- EVENTOS_MATERIAIS_ALOCADOS
DROP POLICY IF EXISTS "Admin and Suporte can manage materiais alocados" ON eventos_materiais_alocados;
CREATE POLICY "Users with permission can manage materiais alocados" ON eventos_materiais_alocados
  FOR ALL USING (has_permission(auth.uid(), 'estoque.alocar'))
  WITH CHECK (has_permission(auth.uid(), 'estoque.alocar'));

-- CADASTROS_PUBLICOS
DROP POLICY IF EXISTS "Only Admin can manage cadastros_publicos" ON cadastros_publicos;
DROP POLICY IF EXISTS "Only Admin can delete cadastros_publicos" ON cadastros_publicos;
CREATE POLICY "Users with permission can manage cadastros_publicos" ON cadastros_publicos
  FOR UPDATE USING (has_permission(auth.uid(), 'cadastros.aprovar'))
  WITH CHECK (has_permission(auth.uid(), 'cadastros.aprovar'));
CREATE POLICY "Users with permission can delete cadastros_publicos" ON cadastros_publicos
  FOR DELETE USING (has_permission(auth.uid(), 'cadastros.deletar'));