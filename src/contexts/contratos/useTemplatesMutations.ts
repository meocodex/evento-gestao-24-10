import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ContratoTemplate } from '@/types/contratos';

// Interface para dados de atualização de template (snake_case para o banco)
interface TemplateUpdateData {
  nome?: string;
  tipo?: string;
  descricao?: string;
  conteudo?: string;
  variaveis?: string[];
  status?: string;
  versao?: number;
  papel_timbrado?: string;
  margens?: unknown;
}

export function useTemplatesMutations() {
  const queryClient = useQueryClient();

  const criarTemplate = useMutation({
    mutationFn: async (data: Omit<ContratoTemplate, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
      const { error } = await supabase
        .from('contratos_templates')
        .insert({
          nome: data.nome,
          tipo: data.tipo,
          descricao: data.descricao,
          conteudo: data.conteudo,
          variaveis: data.variaveis || [],
          status: data.status,
          versao: data.versao,
          papel_timbrado: data.papelTimbrado,
          margens: data.margens ? JSON.parse(JSON.stringify(data.margens)) : null,
        });

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['contratos-templates'] });
      toast.success('Template criado', { description: 'Template de contrato criado com sucesso.' });
    },
    onError: () => {
      toast.error('Erro ao criar template');
    },
  });

  const editarTemplate = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ContratoTemplate> }) => {
      const updateData: TemplateUpdateData = {};
      if (data.nome !== undefined) updateData.nome = data.nome;
      if (data.tipo !== undefined) updateData.tipo = data.tipo;
      if (data.descricao !== undefined) updateData.descricao = data.descricao;
      if (data.conteudo !== undefined) updateData.conteudo = data.conteudo;
      if (data.variaveis !== undefined) updateData.variaveis = data.variaveis;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.versao !== undefined) updateData.versao = data.versao;
      if (data.papelTimbrado !== undefined) updateData.papel_timbrado = data.papelTimbrado;
      if (data.margens !== undefined) updateData.margens = JSON.parse(JSON.stringify(data.margens));

      const { error } = await supabase
        .from('contratos_templates')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['contratos-templates'] });
      toast.success('Template atualizado', { description: 'Template atualizado com sucesso.' });
    },
    onError: () => {
      toast.error('Erro ao editar template');
    },
  });

  const excluirTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contratos_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['contratos-templates'] });
      toast.success('Template excluído', { description: 'Template removido do sistema.' });
    },
    onError: () => {
      toast.error('Erro ao excluir template');
    },
  });

  return {
    criarTemplate,
    editarTemplate,
    excluirTemplate,
  };
}
