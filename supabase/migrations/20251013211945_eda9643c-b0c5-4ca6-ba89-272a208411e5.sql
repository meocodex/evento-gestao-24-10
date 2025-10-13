-- Adicionar constraint UNIQUE para evitar números de serial duplicados no mesmo material
ALTER TABLE materiais_seriais 
ADD CONSTRAINT materiais_seriais_numero_material_key 
UNIQUE (material_id, numero);