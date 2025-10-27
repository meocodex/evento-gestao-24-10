import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { MaterialEstoque, SerialEstoque } from '@/types/estoque';

export const useEstoqueMutations = () => {
  const queryClient = useQueryClient();

  const adicionarMaterial = useMutation({
    mutationFn: async (dados: Omit<MaterialEstoque, 'id' | 'seriais' | 'quantidadeTotal' | 'quantidadeDisponivel' | 'unidade'>) => {
      // Buscar o maior ID atual para gerar sequencial
      const { data: materiais } = await supabase
        .from('materiais_estoque')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);

      // Extrair número do ID (ex: "MAT5" -> 5)
      const ultimoId = materiais?.[0]?.id;
      let proximoNumero = 1;
      
      if (ultimoId && ultimoId.startsWith('MAT')) {
        const numeroAtual = parseInt(ultimoId.replace('MAT', ''));
        if (!isNaN(numeroAtual)) {
          proximoNumero = numeroAtual + 1;
        }
      }

      const novoId = `MAT${proximoNumero}`;

      const { data, error } = await supabase
        .from('materiais_estoque')
        .insert({
          id: novoId,
          nome: dados.nome,
          categoria: dados.categoria,
          descricao: dados.descricao,
          foto: dados.foto,
          valor_unitario: dados.valorUnitario,
          quantidade_total: 0,
          quantidade_disponivel: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['materiais_estoque'] });
      toast({
        title: 'Material cadastrado',
        description: `${data.nome} foi adicionado ao estoque.`,
      });
    },
    onError: (error: Error) => {
      let mensagem = 'Não foi possível cadastrar o material.';
      
      if (error.message.includes('permission') || error.message.includes('policy')) {
        mensagem = 'Você não tem permissão para cadastrar materiais.';
      } else if (error.message.includes('duplicate') || error.message.includes('unique')) {
        mensagem = 'Já existe um material com estas informações.';
      }
      
      toast({
        title: 'Erro ao cadastrar',
        description: mensagem,
        variant: 'destructive',
      });
    },
  });

  const editarMaterial = useMutation({
    mutationFn: async ({ id, dados }: { id: string; dados: Partial<MaterialEstoque> }) => {
      const { error } = await supabase
        .from('materiais_estoque')
        .update({
          nome: dados.nome,
          categoria: dados.categoria,
          descricao: dados.descricao,
          foto: dados.foto,
          valor_unitario: dados.valorUnitario,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiais_estoque'] });
      toast({
        title: 'Material atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
    },
  });

  const excluirMaterial = useMutation({
    mutationFn: async (id: string) => {
      // Verificar se tem seriais em uso
      const { data: seriais } = await supabase
        .from('materiais_seriais')
        .select('status')
        .eq('material_id', id);

      const seriaisEmUso = (seriais || []).filter(s => s.status === 'em_uso');
      if (seriaisEmUso.length > 0) {
        throw new Error(`Este material possui ${seriaisEmUso.length} unidade(s) em uso.`);
      }

      const { error } = await supabase
        .from('materiais_estoque')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiais_estoque'] });
      toast({
        title: 'Material excluído',
        description: 'Material removido do estoque.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Não é possível excluir',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const adicionarSerial = useMutation({
    mutationFn: async ({ materialId, dados }: { materialId: string; dados: SerialEstoque }) => {
      const { error } = await supabase
        .from('materiais_seriais')
        .insert({
          material_id: materialId,
          numero: dados.numero,
          status: dados.status,
          localizacao: dados.localizacao,
          data_aquisicao: dados.dataAquisicao,
          ultima_manutencao: dados.ultimaManutencao,
          observacoes: dados.observacoes,
        });

      if (error) throw error;

      // Incrementar contadores usando função do banco
      if (dados.status === 'disponivel') {
        await supabase.rpc('increment_estoque_disponivel', { p_material_id: materialId });
      }

      // Atualizar quantidade total
      const { error: updateError } = await supabase.rpc('query', {
        query: `UPDATE materiais_estoque SET quantidade_total = quantidade_total + 1 WHERE id = '${materialId}'`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiais_estoque'] });
      queryClient.invalidateQueries({ queryKey: ['materiais_seriais'] });
      toast({
        title: 'Serial adicionado',
        description: 'Novo item adicionado ao estoque.',
      });
    },
  });

  const editarSerial = useMutation({
    mutationFn: async ({ materialId, numeroSerial, dados }: { materialId: string; numeroSerial: string; dados: Partial<SerialEstoque> }) => {
      // Buscar status atual
      const { data: serialAtual } = await supabase
        .from('materiais_seriais')
        .select('status')
        .eq('material_id', materialId)
        .eq('numero', numeroSerial)
        .single();

      const { error } = await supabase
        .from('materiais_seriais')
        .update({
          status: dados.status,
          localizacao: dados.localizacao,
          data_aquisicao: dados.dataAquisicao,
          ultima_manutencao: dados.ultimaManutencao,
          observacoes: dados.observacoes,
        })
        .eq('material_id', materialId)
        .eq('numero', numeroSerial);

      if (error) throw error;

      // Atualizar quantidade disponível se mudou o status
      if (dados.status && serialAtual && serialAtual.status !== dados.status) {
        if (serialAtual.status !== 'disponivel' && dados.status === 'disponivel') {
          await supabase.rpc('increment_estoque_disponivel', { p_material_id: materialId });
        } else if (serialAtual.status === 'disponivel' && dados.status !== 'disponivel') {
          await supabase.rpc('decrement_estoque_disponivel', { p_material_id: materialId });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiais_estoque'] });
      queryClient.invalidateQueries({ queryKey: ['materiais_seriais'] });
      toast({
        title: 'Serial atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
    },
  });

  const excluirSerial = useMutation({
    mutationFn: async ({ materialId, numeroSerial }: { materialId: string; numeroSerial: string }) => {
      // Verificar se está em uso
      const { data: serial } = await supabase
        .from('materiais_seriais')
        .select('status')
        .eq('material_id', materialId)
        .eq('numero', numeroSerial)
        .single();

      if (serial?.status === 'em_uso') {
        throw new Error('Este serial está em uso.');
      }

      const { error } = await supabase
        .from('materiais_seriais')
        .delete()
        .eq('material_id', materialId)
        .eq('numero', numeroSerial);

      if (error) throw error;

      // Decrementar contadores
      if (serial?.status === 'disponivel') {
        await supabase.rpc('decrement_estoque_disponivel', { p_material_id: materialId });
      }

      // Atualizar quantidade total
      const { error: updateError } = await supabase.rpc('query', {
        query: `UPDATE materiais_estoque SET quantidade_total = GREATEST(0, quantidade_total - 1) WHERE id = '${materialId}'`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiais_estoque'] });
      queryClient.invalidateQueries({ queryKey: ['materiais_seriais'] });
      toast({
        title: 'Serial excluído',
        description: 'Item removido do estoque.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Não é possível excluir',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    adicionarMaterial,
    editarMaterial,
    excluirMaterial,
    adicionarSerial,
    editarSerial,
    excluirSerial,
  };
};
