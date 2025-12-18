import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { toJson } from '@/types/utils';

export function useConfiguracoesMutations() {
  const queryClient = useQueryClient();

  const atualizarNotificacoes = useMutation({
    mutationFn: async (notificacoes: unknown) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('configuracoes_usuario')
        .update({ notificacoes: toJson(notificacoes) })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
      toast.success('Configurações de notificações atualizadas');
    },
    onError: () => {
      toast.error('Erro ao atualizar notificações');
    },
  });

  const atualizarEmpresa = useMutation({
    mutationFn: async (empresa: unknown) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('configuracoes_usuario')
        .update({ empresa: toJson(empresa) })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
      toast.success('Configurações da empresa atualizadas');
    },
    onError: () => {
      toast.error('Erro ao atualizar empresa');
    },
  });

  const atualizarSistema = useMutation({
    mutationFn: async (sistema: unknown) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('configuracoes_usuario')
        .update({ sistema: toJson(sistema) })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
      toast.success('Configurações do sistema atualizadas');
    },
    onError: () => {
      toast.error('Erro ao atualizar sistema');
    },
  });

  return {
    atualizarNotificacoes,
    atualizarEmpresa,
    atualizarSistema,
  };
}
