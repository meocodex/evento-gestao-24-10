-- Habilitar Realtime para notificações
ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;

-- Adicionar índice para melhorar performance de queries com paginação
CREATE INDEX IF NOT EXISTS idx_eventos_data_inicio ON public.eventos(data_inicio DESC);
CREATE INDEX IF NOT EXISTS idx_eventos_status ON public.eventos(status);
CREATE INDEX IF NOT EXISTS idx_clientes_created_at ON public.clientes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_demandas_created_at ON public.demandas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_created ON public.notificacoes(user_id, created_at DESC);