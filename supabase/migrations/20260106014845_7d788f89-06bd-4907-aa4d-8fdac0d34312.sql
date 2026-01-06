-- Adicionar coluna dados_bancarios na tabela clientes
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS dados_bancarios jsonb;

COMMENT ON COLUMN public.clientes.dados_bancarios IS 'Dados bancários para pagamentos: {tipoPagamento: pix|conta_bancaria, chavePix, tipoChavePix, banco, agencia, conta, tipoConta, cpfCnpjTitular, nomeTitular}';

-- Criar índice para buscas por tipo de pagamento
CREATE INDEX IF NOT EXISTS idx_clientes_dados_bancarios ON public.clientes USING gin(dados_bancarios);