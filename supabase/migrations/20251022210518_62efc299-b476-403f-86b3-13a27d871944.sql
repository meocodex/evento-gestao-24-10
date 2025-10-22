-- Adicionar campo cnpj_pj para operacionais do tipo PJ
ALTER TABLE public.equipe_operacional 
ADD COLUMN cnpj_pj TEXT NULL;