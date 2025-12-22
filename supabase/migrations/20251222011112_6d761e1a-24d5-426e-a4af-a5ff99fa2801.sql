-- Criar bucket para cadastros públicos de eventos
INSERT INTO storage.buckets (id, name, public)
VALUES ('cadastros-publicos', 'cadastros-publicos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy para permitir upload anônimo (cadastro público)
CREATE POLICY "Permitir upload público cadastros"
ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'cadastros-publicos');

-- Policy para permitir leitura pública
CREATE POLICY "Permitir leitura pública cadastros"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'cadastros-publicos');

-- Policy para usuários autenticados também poderem gerenciar
CREATE POLICY "Usuários autenticados gerenciam cadastros"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'cadastros-publicos')
WITH CHECK (bucket_id = 'cadastros-publicos');