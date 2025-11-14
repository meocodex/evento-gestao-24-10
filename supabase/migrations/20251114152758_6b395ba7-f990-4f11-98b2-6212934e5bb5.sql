-- Adicionar 'taxas' ao enum categoria_financeira para suportar despesas de taxas de pagamento
ALTER TYPE categoria_financeira ADD VALUE IF NOT EXISTS 'taxas';