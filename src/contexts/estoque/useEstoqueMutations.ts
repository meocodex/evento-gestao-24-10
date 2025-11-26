import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast as sonnerToast } from 'sonner';
import { toast } from '@/hooks/use-toast';
import type { MaterialEstoque, SerialEstoque } from '@/types/estoque';
import { uiToDbStatus, dbToUiStatus } from '@/lib/estoqueStatus';

export const useEstoqueMutations = () => {
  const queryClient = useQueryClient();

  const adicionarMaterial = useMutation({
    mutationFn: async (dados: Omit<MaterialEstoque, 'id' | 'seriais' | 'quantidadeTotal' | 'quantidadeDisponivel' | 'unidade'> & {
      quantidadeSeriais?: number;
      quantidadeInicial?: number;
      localizacaoPadrao?: string;
    }) => {
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

      // Calcular quantidades iniciais baseado no tipo de controle
      let quantidadeTotal = 0;
      let quantidadeDisponivel = 0;

      if (dados.tipoControle === 'serial' && dados.quantidadeSeriais && dados.quantidadeSeriais > 0) {
        quantidadeTotal = dados.quantidadeSeriais;
        quantidadeDisponivel = dados.quantidadeSeriais; // Todos disponíveis por padrão
      } else if (dados.tipoControle === 'quantidade' && dados.quantidadeInicial && dados.quantidadeInicial > 0) {
        quantidadeTotal = dados.quantidadeInicial;
        quantidadeDisponivel = dados.quantidadeInicial;
      }

      const { data, error } = await supabase
        .from('materiais_estoque')
        .insert({
          id: novoId,
          nome: dados.nome,
          categoria: dados.categoria,
          tipo_controle: dados.tipoControle,
          descricao: dados.descricao,
          foto: dados.foto,
          valor_unitario: dados.valorUnitario,
          quantidade_total: quantidadeTotal,
          quantidade_disponivel: quantidadeDisponivel,
        })
        .select()
        .single();

      if (error) throw error;

      // Se for tipo serial e tiver quantidade especificada, criar seriais automaticamente
      if (dados.tipoControle === 'serial' && dados.quantidadeSeriais && dados.quantidadeSeriais > 0) {
        const prefix = dados.nome.slice(0, 3).toUpperCase();
        const localizacao = dados.localizacaoPadrao || 'Depósito Principal';
        
        const seriais = [];
        for (let i = 1; i <= dados.quantidadeSeriais; i++) {
          seriais.push({
            material_id: novoId,
            numero: `${prefix}-${String(i).padStart(3, '0')}`,
            status: 'disponivel',
            localizacao: localizacao,
            tags: [],
          });
        }

        const { error: seriaisError } = await supabase
          .from('materiais_seriais')
          .insert(seriais);

        if (seriaisError) {
          console.error('Erro ao criar seriais:', seriaisError);
          // Não falhar toda a operação se houver erro nos seriais
        }
      }

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
      // Converter status de UI para DB
      const statusDb = uiToDbStatus(dados.status);

      // Verificar se o serial já existe
      const { data: existente } = await supabase
        .from('materiais_seriais')
        .select('numero')
        .eq('material_id', materialId)
        .eq('numero', dados.numero)
        .maybeSingle();

      if (existente) {
        throw new Error('Já existe um serial com este número para este material');
      }

      // Inserir o serial com status convertido
      const { error } = await supabase
        .from('materiais_seriais')
        .insert({
          material_id: materialId,
          numero: dados.numero,
          status: statusDb,
          localizacao: dados.localizacao,
          tags: dados.tags || [],
          data_aquisicao: dados.dataAquisicao,
          ultima_manutencao: dados.ultimaManutencao,
          observacoes: dados.observacoes,
        });

      if (error) throw error;

      // ORDEM CORRETA: Primeiro incrementar total
      await supabase.rpc('increment_estoque_total', { p_material_id: materialId });

      // Depois, se o status for disponível, incrementar disponível
      if (statusDb === 'disponivel') {
        await supabase.rpc('increment_estoque_disponivel', { p_material_id: materialId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiais_estoque'] });
      queryClient.invalidateQueries({ queryKey: ['materiais_seriais'] });
      toast({
        title: 'Serial adicionado',
        description: 'Novo item adicionado ao estoque.',
      });
    },
    onError: (error: any) => {
      const errorMsg = error.message || 'Erro ao adicionar serial';
      sonnerToast.error(errorMsg);
    },
  });

  const editarSerial = useMutation({
    mutationFn: async ({ materialId, numeroSerial, dados }: { materialId: string; numeroSerial: string; dados: Partial<SerialEstoque> }) => {
      // Buscar o serial atual para comparar status (DB format)
      const { data: serialAtual, error: fetchError } = await supabase
        .from('materiais_seriais')
        .select('status')
        .eq('material_id', materialId)
        .eq('numero', numeroSerial)
        .single();

      if (fetchError) throw fetchError;

      const oldStatusDb = serialAtual.status as any; // status vem do DB (em_uso)
      const newStatusDb = dados.status ? uiToDbStatus(dados.status) : oldStatusDb;

      // Atualizar o serial com status convertido
      const { error } = await supabase
        .from('materiais_seriais')
        .update({
          status: newStatusDb,
          localizacao: dados.localizacao,
          tags: dados.tags,
          data_aquisicao: dados.dataAquisicao,
          ultima_manutencao: dados.ultimaManutencao,
          observacoes: dados.observacoes,
        })
        .eq('material_id', materialId)
        .eq('numero', numeroSerial);

      if (error) throw error;

      // Se o status mudou, atualizar a quantidade disponível (comparar em DB terms)
      if (dados.status && oldStatusDb !== newStatusDb) {
        // Se mudou de disponível para outro status, decrementar
        if (oldStatusDb === 'disponivel' && newStatusDb !== 'disponivel') {
          await supabase.rpc('decrement_estoque_disponivel', { p_material_id: materialId });
        }
        // Se mudou de outro status para disponível, incrementar
        else if (oldStatusDb !== 'disponivel' && newStatusDb === 'disponivel') {
          await supabase.rpc('increment_estoque_disponivel', { p_material_id: materialId });
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
    onError: (error: any) => {
      const errorMsg = error.message || 'Erro ao atualizar serial';
      sonnerToast.error(errorMsg);
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
      await supabase.rpc('decrement_estoque_total', { p_material_id: materialId });
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

  const sincronizarQuantidades = useMutation({
    mutationFn: async (materialId?: string) => {
      const { data, error } = await supabase.rpc('sincronizar_quantidade_disponivel', {
        p_material_id: materialId || null,
      });

      if (error) throw error;
      return data as Array<{ material_id: string; valor_anterior: number; valor_novo: number }>;
    },
    onSuccess: (data) => {
      if (data && data.length > 0) {
        const total = data.length;
        const detalhes = data.map(d => 
          `${d.material_id}: ${d.valor_anterior} → ${d.valor_novo}`
        ).join('\n');
        
        sonnerToast.success(`✅ ${total} material(is) sincronizado(s)`, {
          description: detalhes,
        });
      } else {
        sonnerToast.success('✅ Todos os materiais já estão sincronizados');
      }
      queryClient.invalidateQueries({ queryKey: ['materiais_estoque'] });
    },
    onError: (error: any) => {
      sonnerToast.error('Erro ao sincronizar estoque', {
        description: error.message,
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
    sincronizarQuantidades,
  };
};
