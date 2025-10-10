-- ========================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_materiais_alocados ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_cobrancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_equipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE demandas ENABLE ROW LEVEL SECURITY;
ALTER TABLE demandas_comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE demandas_anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiais_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiais_seriais ENABLE ROW LEVEL SECURITY;
ALTER TABLE transportadoras ENABLE ROW LEVEL SECURITY;
ALTER TABLE transportadoras_rotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE envios ENABLE ROW LEVEL SECURITY;
ALTER TABLE cadastros_publicos ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLICIES: PROFILES
-- ========================================

CREATE POLICY "Authenticated users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ========================================
-- POLICIES: USER_ROLES
-- ========================================

CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON user_roles FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- ========================================
-- POLICIES: CLIENTES
-- ========================================

CREATE POLICY "Authenticated users can view clientes"
  ON clientes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Comercial and Admin can create clientes"
  ON clientes FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'comercial')
  );

CREATE POLICY "Comercial and Admin can update clientes"
  ON clientes FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'comercial')
  );

CREATE POLICY "Only Admin can delete clientes"
  ON clientes FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ========================================
-- POLICIES: EVENTOS
-- ========================================

CREATE POLICY "Authenticated users can view eventos"
  ON eventos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Comercial and Admin can create eventos"
  ON eventos FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'comercial')
  );

CREATE POLICY "Comercial can update own eventos, Admin all"
  ON eventos FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR 
    (has_role(auth.uid(), 'comercial') AND comercial_id = auth.uid()) OR
    has_role(auth.uid(), 'suporte')
  );

CREATE POLICY "Only Admin can delete eventos"
  ON eventos FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ========================================
-- POLICIES: EVENTOS_CHECKLIST
-- ========================================

CREATE POLICY "Authenticated users can view checklist"
  ON eventos_checklist FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and Suporte can manage checklist"
  ON eventos_checklist FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'suporte') OR
    has_role(auth.uid(), 'comercial')
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'suporte') OR
    has_role(auth.uid(), 'comercial')
  );

-- ========================================
-- POLICIES: EVENTOS_MATERIAIS_ALOCADOS
-- ========================================

CREATE POLICY "Authenticated users can view materiais alocados"
  ON eventos_materiais_alocados FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and Suporte can manage materiais alocados"
  ON eventos_materiais_alocados FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'suporte')
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'suporte')
  );

-- ========================================
-- POLICIES: FINANCEIRO (RECEITAS)
-- ========================================

CREATE POLICY "Only Admin can view receitas"
  ON eventos_receitas FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only Admin can manage receitas"
  ON eventos_receitas FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- ========================================
-- POLICIES: FINANCEIRO (DESPESAS)
-- ========================================

CREATE POLICY "Only Admin can view despesas"
  ON eventos_despesas FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only Admin can manage despesas"
  ON eventos_despesas FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- ========================================
-- POLICIES: FINANCEIRO (COBRANÇAS)
-- ========================================

CREATE POLICY "Only Admin can view cobrancas"
  ON eventos_cobrancas FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only Admin can manage cobrancas"
  ON eventos_cobrancas FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- ========================================
-- POLICIES: EVENTOS_TIMELINE
-- ========================================

CREATE POLICY "Authenticated users can view timeline"
  ON eventos_timeline FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert timeline"
  ON eventos_timeline FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ========================================
-- POLICIES: EVENTOS_EQUIPE
-- ========================================

CREATE POLICY "Authenticated users can view equipe"
  ON eventos_equipe FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and Suporte can manage equipe"
  ON eventos_equipe FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'suporte') OR
    has_role(auth.uid(), 'comercial')
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'suporte') OR
    has_role(auth.uid(), 'comercial')
  );

-- ========================================
-- POLICIES: DEMANDAS
-- ========================================

CREATE POLICY "Authenticated users can view demandas"
  ON demandas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create demandas"
  ON demandas FOR INSERT
  TO authenticated
  WITH CHECK (solicitante_id = auth.uid());

CREATE POLICY "Relevant users can update demandas"
  ON demandas FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR
    solicitante_id = auth.uid() OR
    responsavel_id = auth.uid()
  );

CREATE POLICY "Only Admin can delete demandas"
  ON demandas FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ========================================
-- POLICIES: DEMANDAS_COMENTARIOS
-- ========================================

CREATE POLICY "Authenticated users can view comentarios"
  ON demandas_comentarios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create comentarios"
  ON demandas_comentarios FOR INSERT
  TO authenticated
  WITH CHECK (autor_id = auth.uid());

-- ========================================
-- POLICIES: DEMANDAS_ANEXOS
-- ========================================

CREATE POLICY "Authenticated users can view anexos"
  ON demandas_anexos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create anexos"
  ON demandas_anexos FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ========================================
-- POLICIES: CONTRATOS_TEMPLATES
-- ========================================

CREATE POLICY "Authenticated users can view templates"
  ON contratos_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and Comercial can manage templates"
  ON contratos_templates FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'comercial')
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'comercial')
  );

-- ========================================
-- POLICIES: CONTRATOS
-- ========================================

CREATE POLICY "Authenticated users can view contratos"
  ON contratos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and Comercial can manage contratos"
  ON contratos FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'comercial')
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'comercial')
  );

-- ========================================
-- POLICIES: MATERIAIS_ESTOQUE
-- ========================================

CREATE POLICY "Authenticated users can view materiais"
  ON materiais_estoque FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and Suporte can manage materiais"
  ON materiais_estoque FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'suporte')
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'suporte')
  );

-- ========================================
-- POLICIES: MATERIAIS_SERIAIS
-- ========================================

CREATE POLICY "Authenticated users can view seriais"
  ON materiais_seriais FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and Suporte can manage seriais"
  ON materiais_seriais FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'suporte')
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'suporte')
  );

-- ========================================
-- POLICIES: TRANSPORTADORAS
-- ========================================

CREATE POLICY "Authenticated users can view transportadoras"
  ON transportadoras FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and Suporte can manage transportadoras"
  ON transportadoras FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'suporte')
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'suporte')
  );

-- ========================================
-- POLICIES: TRANSPORTADORAS_ROTAS
-- ========================================

CREATE POLICY "Authenticated users can view rotas"
  ON transportadoras_rotas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and Suporte can manage rotas"
  ON transportadoras_rotas FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'suporte')
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'suporte')
  );

-- ========================================
-- POLICIES: ENVIOS
-- ========================================

CREATE POLICY "Authenticated users can view envios"
  ON envios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and Suporte can manage envios"
  ON envios FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'suporte')
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'suporte')
  );

-- ========================================
-- POLICIES: CADASTROS_PUBLICOS
-- ========================================

CREATE POLICY "Anyone can create cadastros_publicos"
  ON cadastros_publicos FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view cadastros_publicos"
  ON cadastros_publicos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only Admin can manage cadastros_publicos"
  ON cadastros_publicos FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only Admin can delete cadastros_publicos"
  ON cadastros_publicos FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Fix search_path for update_updated_at_column function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recriar triggers com a função corrigida
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