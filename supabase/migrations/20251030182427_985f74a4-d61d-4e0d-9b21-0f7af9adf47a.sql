-- ETAPA 1: Expansão do Banco de Dados para Documentos de Transporte

-- 1.1 Adicionar novos campos à tabela eventos_materiais_alocados
ALTER TABLE eventos_materiais_alocados
  -- Dados de Retirada por Terceiro (Cenário 2)
  ADD COLUMN retirado_por_nome text,
  ADD COLUMN retirado_por_documento text,
  ADD COLUMN retirado_por_telefone text,
  ADD COLUMN termo_retirada_url text,
  ADD COLUMN data_retirada timestamp with time zone,
  
  -- Dados de Declaração de Transporte (Cenários 3 e 4)
  ADD COLUMN declaracao_transporte_url text,
  ADD COLUMN valor_declarado numeric,
  ADD COLUMN remetente_tipo text CHECK (remetente_tipo IN ('empresa', 'membro_equipe')),
  ADD COLUMN remetente_membro_id uuid REFERENCES equipe_operacional(id),
  ADD COLUMN remetente_dados jsonb,
  ADD COLUMN dados_destinatario jsonb,
  ADD COLUMN dados_transportadora jsonb,
  ADD COLUMN observacoes_transporte text,
  
  -- Vínculo com envios existentes (Cenário 3)
  ADD COLUMN envio_id uuid REFERENCES envios(id);

-- 1.2 Criar índices para performance
CREATE INDEX idx_eventos_materiais_envio ON eventos_materiais_alocados(envio_id);
CREATE INDEX idx_eventos_materiais_remetente ON eventos_materiais_alocados(remetente_membro_id);

-- 1.3 Criar bucket de storage para documentos de transporte
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos-transporte', 'documentos-transporte', false);

-- 1.4 Políticas RLS para o bucket documentos-transporte
CREATE POLICY "Authenticated users can view transport documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documentos-transporte');

CREATE POLICY "Authenticated users can upload transport documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos-transporte');

CREATE POLICY "Users can update their transport documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documentos-transporte');