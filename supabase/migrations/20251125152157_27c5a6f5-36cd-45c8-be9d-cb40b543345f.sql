-- Atualizar bucket documentos-transporte para ser público e restringir a PDFs até 10MB
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 10485760, -- 10MB
  allowed_mime_types = ARRAY['application/pdf']::text[]
WHERE id = 'documentos-transporte';