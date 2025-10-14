-- Remover foreign key incorreta e recriar apontando para profiles
ALTER TABLE eventos
DROP CONSTRAINT eventos_comercial_id_fkey;

ALTER TABLE eventos
ADD CONSTRAINT eventos_comercial_id_fkey
FOREIGN KEY (comercial_id)
REFERENCES profiles(id)
ON DELETE SET NULL;