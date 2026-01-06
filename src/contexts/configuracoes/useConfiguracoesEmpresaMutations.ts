import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ConfiguracaoEmpresaData } from '@/types/utils';
import { toJson } from '@/types/utils';

export function useConfiguracoesEmpresaMutations() {
  const queryClient = useQueryClient();

  const atualizarConfiguracoesEmpresa = useMutation({
    mutationFn: async (config: ConfiguracaoEmpresaData) => {
      // Converter para formato compatível com Supabase
      const configDB = {
        nome: config.nome,
        razao_social: config.razao_social,
        cnpj: config.cnpj,
        email: config.email,
        telefone: config.telefone,
        endereco: config.endereco ? toJson(config.endereco) : undefined,
        logo: config.logo,
      };

      const { data: existing } = await supabase
        .from('configuracoes_empresa')
        .select('id')
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('configuracoes_empresa')
          .update(configDB)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('configuracoes_empresa')
          .insert(configDB)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['configuracoes_empresa'] });
      toast.success('Configurações da empresa atualizadas com sucesso');
    },
    onError: (error: Error) => {
      console.error('Erro ao atualizar configurações da empresa:', error);
      toast.error('Erro ao atualizar configurações da empresa');
    },
  });

  return {
    atualizarConfiguracoesEmpresa,
  };
}
