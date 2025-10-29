-- Adicionar coluna numero_id na tabela demandas
ALTER TABLE demandas ADD COLUMN numero_id INTEGER UNIQUE;

-- Função para gerar número único de 6 dígitos
CREATE OR REPLACE FUNCTION gerar_numero_demanda()
RETURNS INTEGER AS $$
DECLARE
  novo_numero INTEGER;
  existe BOOLEAN;
BEGIN
  LOOP
    -- Gerar número aleatório entre 100000 e 999999
    novo_numero := floor(random() * 900000 + 100000)::INTEGER;
    
    -- Verificar se já existe
    SELECT EXISTS(SELECT 1 FROM demandas WHERE numero_id = novo_numero) INTO existe;
    
    -- Se não existe, retornar
    IF NOT existe THEN
      RETURN novo_numero;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Função trigger para gerar automaticamente
CREATE OR REPLACE FUNCTION gerar_numero_demanda_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero_id IS NULL THEN
    NEW.numero_id := gerar_numero_demanda();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para gerar automaticamente ao inserir
CREATE TRIGGER trigger_gerar_numero_demanda
BEFORE INSERT ON demandas
FOR EACH ROW
EXECUTE FUNCTION gerar_numero_demanda_trigger();

-- Atualizar demandas existentes com números únicos
DO $$
DECLARE
  demanda_record RECORD;
BEGIN
  FOR demanda_record IN SELECT id FROM demandas WHERE numero_id IS NULL LOOP
    UPDATE demandas 
    SET numero_id = gerar_numero_demanda() 
    WHERE id = demanda_record.id;
  END LOOP;
END $$;