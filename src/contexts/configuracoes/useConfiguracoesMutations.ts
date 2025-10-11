import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useConfiguracoesMutations() {
  const queryClient = useQueryClient();

  const atualizarNotificacoes = useMutation({
    mutationFn: async (notificacoes: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('configuracoes_usuario')
        .update({ notificacoes })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
      toast({ title: 'Configurações de notificações atualizadas' });
    },
    onError: (error) => {
      console.error('Erro ao atualizar notificações:', error);
      toast({ title: 'Erro ao atualizar notificações', variant: 'destructive' });
    },
  });

  const atualizarEmpresa = useMutation({
    mutationFn: async (empresa: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('configuracoes_usuario')
        .update({ empresa })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
      toast({ title: 'Configurações da empresa atualizadas' });
    },
    onError: (error) => {
      console.error('Erro ao atualizar empresa:', error);
      toast({ title: 'Erro ao atualizar empresa', variant: 'destructive' });
    },
  });

  const atualizarSistema = useMutation({
    mutationFn: async (sistema: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('configuracoes_usuario')
        .update({ sistema })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
      toast({ title: 'Configurações do sistema atualizadas' });
    },
    onError: (error) => {
      console.error('Erro ao atualizar sistema:', error);
      toast({ title: 'Erro ao atualizar sistema', variant: 'destructive' });
    },
  });

  return {
    atualizarNotificacoes,
    atualizarEmpresa,
    atualizarSistema,
  };
}
