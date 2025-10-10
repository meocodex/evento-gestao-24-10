-- ========================================
-- CONFIGURAR STORAGE BUCKETS
-- ========================================

-- Bucket para avatares de usuários (PÚBLICO)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Bucket para arquivos de eventos (PRIVADO)
INSERT INTO storage.buckets (id, name, public)
VALUES ('eventos', 'eventos', false);

-- Bucket para documentos de contratos (PRIVADO)
INSERT INTO storage.buckets (id, name, public)
VALUES ('contratos', 'contratos', false);

-- Bucket para comprovantes financeiros (PRIVADO)
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprovantes', 'comprovantes', false);

-- Bucket para anexos de demandas (PRIVADO)
INSERT INTO storage.buckets (id, name, public)
VALUES ('demandas', 'demandas', false);

-- Bucket para materiais do estoque (PRIVADO)
INSERT INTO storage.buckets (id, name, public)
VALUES ('estoque', 'estoque', false);

-- ========================================
-- POLICIES DE STORAGE: AVATARES (PÚBLICO)
-- ========================================

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ========================================
-- POLICIES DE STORAGE: EVENTOS
-- ========================================

CREATE POLICY "Admin and Suporte can upload to eventos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'eventos' AND (
      has_role(auth.uid(), 'admin') OR 
      has_role(auth.uid(), 'suporte') OR
      has_role(auth.uid(), 'comercial')
    )
  );

CREATE POLICY "Authenticated users can view eventos files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'eventos');

CREATE POLICY "Admin and Suporte can update eventos files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'eventos' AND (
      has_role(auth.uid(), 'admin') OR 
      has_role(auth.uid(), 'suporte')
    )
  );

CREATE POLICY "Admin can delete eventos files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'eventos' AND 
    has_role(auth.uid(), 'admin')
  );

-- ========================================
-- POLICIES DE STORAGE: COMPROVANTES (ADMIN ONLY)
-- ========================================

CREATE POLICY "Only Admin can upload comprovantes"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'comprovantes' AND 
    has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Only Admin can view comprovantes"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'comprovantes' AND 
    has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Only Admin can update comprovantes"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'comprovantes' AND 
    has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Only Admin can delete comprovantes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'comprovantes' AND 
    has_role(auth.uid(), 'admin')
  );

-- ========================================
-- POLICIES DE STORAGE: DEMANDAS
-- ========================================

CREATE POLICY "Authenticated users can upload to demandas"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'demandas');

CREATE POLICY "Authenticated users can view demandas files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'demandas');

CREATE POLICY "Authenticated users can delete demandas files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'demandas');

-- ========================================
-- POLICIES DE STORAGE: CONTRATOS
-- ========================================

CREATE POLICY "Comercial and Admin can upload contratos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'contratos' AND (
      has_role(auth.uid(), 'admin') OR 
      has_role(auth.uid(), 'comercial')
    )
  );

CREATE POLICY "Authenticated users can view contratos files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'contratos');

CREATE POLICY "Comercial and Admin can update contratos files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'contratos' AND (
      has_role(auth.uid(), 'admin') OR 
      has_role(auth.uid(), 'comercial')
    )
  );

-- ========================================
-- POLICIES DE STORAGE: ESTOQUE
-- ========================================

CREATE POLICY "Admin and Suporte can upload to estoque"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'estoque' AND (
      has_role(auth.uid(), 'admin') OR 
      has_role(auth.uid(), 'suporte')
    )
  );

CREATE POLICY "Authenticated users can view estoque files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'estoque');

CREATE POLICY "Admin and Suporte can delete estoque files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'estoque' AND (
      has_role(auth.uid(), 'admin') OR 
      has_role(auth.uid(), 'suporte')
    )
  );