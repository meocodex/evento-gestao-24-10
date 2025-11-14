-- Corrigir search_path da função calcular_valores_receita
CREATE OR REPLACE FUNCTION calcular_valores_receita()
RETURNS TRIGGER AS $$
DECLARE
  pagamento JSONB;
  taxa_calculada NUMERIC := 0;
BEGIN
  IF NEW.tem_taxas AND NEW.formas_pagamento IS NOT NULL THEN
    NEW.taxa_total := 0;
    FOR pagamento IN SELECT * FROM jsonb_array_elements(NEW.formas_pagamento)
    LOOP
      taxa_calculada := (pagamento->>'valor')::NUMERIC * (pagamento->>'taxa_percentual')::NUMERIC / 100;
      NEW.taxa_total := NEW.taxa_total + taxa_calculada;
    END LOOP;
    NEW.valor_liquido := NEW.valor - COALESCE(NEW.taxa_total, 0);
  ELSE
    NEW.taxa_total := 0;
    NEW.valor_liquido := NEW.valor;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;