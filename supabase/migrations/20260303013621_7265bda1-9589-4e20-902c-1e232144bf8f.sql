
-- Adicionar coluna evento_id nas tabelas contas_pagar e contas_receber para rastreabilidade
ALTER TABLE public.contas_pagar ADD COLUMN evento_id UUID REFERENCES public.eventos(id) ON DELETE SET NULL;
ALTER TABLE public.contas_receber ADD COLUMN evento_id UUID REFERENCES public.eventos(id) ON DELETE SET NULL;

-- Índices para consultas por evento
CREATE INDEX idx_contas_pagar_evento_id ON public.contas_pagar(evento_id) WHERE evento_id IS NOT NULL;
CREATE INDEX idx_contas_receber_evento_id ON public.contas_receber(evento_id) WHERE evento_id IS NOT NULL;
