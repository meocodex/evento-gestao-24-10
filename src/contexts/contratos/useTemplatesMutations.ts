import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ContratoTemplate } from '@/types/contratos';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos-templates'] });
      toast({ title: 'Template criado', description: 'Template de contrato criado com sucesso.' });
    },
    onError: (error) => {
      console.error('Erro ao criar template:', error);
      toast({ title: 'Erro ao criar template', variant: 'destructive' });
    },
  });

  const editarTemplate = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ContratoTemplate> }) => {
      const updateData: any = {};
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos-templates'] });
      toast({ title: 'Template atualizado', description: 'Template atualizado com sucesso.' });
    },
    onError: (error) => {
      console.error('Erro ao editar template:', error);
      toast({ title: 'Erro ao editar template', variant: 'destructive' });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos-templates'] });
      toast({ title: 'Template excluído', description: 'Template removido do sistema.' });
    },
    onError: (error) => {
      console.error('Erro ao excluir template:', error);
      toast({ title: 'Erro ao excluir template', variant: 'destructive' });
    },
  });

  return {
    criarTemplate,
    editarTemplate,
    excluirTemplate,
  };
}
