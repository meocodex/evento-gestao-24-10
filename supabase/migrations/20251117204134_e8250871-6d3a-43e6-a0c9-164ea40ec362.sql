-- Limpeza forçada do profile órfão específico
-- Este usuário já foi removido do auth mas o profile persistiu
DELETE FROM public.profiles 
WHERE id = '16a265e7-7779-44c5-9b0a-ef837aeadfb5';