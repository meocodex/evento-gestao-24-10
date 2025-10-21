import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export interface Notificacao {
  id: string;
  user_id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  link: string | null;
  lida: boolean;
  created_at: string;
}

export function useNotificacoes() {
  const queryClient = useQueryClient();

  // Buscar notificações do usuário
  const { data: notificacoes = [], isLoading } = useQuery({
    queryKey: ['notificacoes'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Notificacao[];
    },
    staleTime: Infinity, // Nunca fica stale (usa realtime)
    refetchOnWindowFocus: true, // Refetch quando volta para aba
  });

  // Configurar Realtime para notificações
  useEffect(() => {
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const channel = supabase
        .channel('notificacoes-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notificacoes',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtime();
  }, [queryClient]);

  // Contar não lidas
  const naoLidas = notificacoes.filter(n => !n.lida).length;

  // Marcar como lida
  const { mutate: marcarComoLida } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
    },
  });

  // Marcar todas como lidas
  const { mutate: marcarTodasComoLidas } = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('user_id', user.id)
        .eq('lida', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
      toast({
        title: 'Notificações marcadas como lidas',
      });
    },
  });

  return {
    notificacoes,
    naoLidas,
    loading: isLoading,
    marcarComoLida,
    marcarTodasComoLidas,
  };
}
