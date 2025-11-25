import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useConfiguracoesEmpresaMutations() {
  const queryClient = useQueryClient();

  const atualizarConfiguracoesEmpresa = useMutation({
    mutationFn: async (config: any) => {
      const { data: existing } = await supabase
        .from('configuracoes_empresa')
        .select('id')
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('configuracoes_empresa')
          .update(config)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('configuracoes_empresa')
          .insert(config)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes_empresa'] });
      toast.success('Configurações da empresa atualizadas com sucesso');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar configurações da empresa:', error);
      toast.error('Erro ao atualizar configurações da empresa');
    },
  });

  return {
    atualizarConfiguracoesEmpresa,
  };
}
