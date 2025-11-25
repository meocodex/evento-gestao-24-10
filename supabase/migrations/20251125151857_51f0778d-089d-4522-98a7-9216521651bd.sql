-- Remover políticas antigas se existirem e recriar
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Documentos de transporte são públicos para visualização" ON storage.objects;
  DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de documentos" ON storage.objects;
  DROP POLICY IF EXISTS "Usuários autenticados podem atualizar documentos" ON storage.objects;
  DROP POLICY IF EXISTS "Usuários autenticados podem excluir documentos" ON storage.objects;
END $$;

-- Política para permitir visualização pública dos documentos
CREATE POLICY "Documentos de transporte são públicos para visualização" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documentos-transporte');

-- Política para permitir upload apenas para usuários autenticados
CREATE POLICY "Usuários autenticados podem fazer upload de documentos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'documentos-transporte' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir atualização para usuários autenticados
CREATE POLICY "Usuários autenticados podem atualizar documentos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'documentos-transporte' AND auth.role() = 'authenticated');

-- Política para permitir exclusão para usuários autenticados
CREATE POLICY "Usuários autenticados podem excluir documentos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documentos-transporte' AND auth.role() = 'authenticated');