
CREATE POLICY "Authenticated users can upload contratos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'contratos');

CREATE POLICY "Authenticated users can view contratos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'contratos');

CREATE POLICY "Authenticated users can delete contratos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'contratos');

CREATE POLICY "Authenticated users can update contratos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'contratos');
