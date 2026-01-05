import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DemandaFormData, StatusDemanda } from '@/types/demandas';
import { DemandasQueryCache, DemandaUpdateData } from '@/types/utils';
import { format } from 'date-fns';

export function useDemandasMutations() {
  const queryClient = useQueryClient();

  const adicionarDemanda = useMutation({
    mutationFn: async ({ 
      data, 
      solicitante, 
      solicitanteId 
    }: { 
      data: DemandaFormData; 
      solicitante: string; 
      solicitanteId: string;
    }) => {
      // Buscar nome do evento se houver evento relacionado
      let eventoNome = null;
      if (data.eventoRelacionado) {
        const { data: evento } = await supabase
          .from('eventos')
          .select('nome')
          .eq('id', data.eventoRelacionado)
          .single();
        eventoNome = evento?.nome;
      }

      const { data: demanda, error } = await supabase
        .from('demandas')
        .insert({
          titulo: data.titulo,
          descricao: data.descricao,
          categoria: data.categoria,
          prioridade: data.prioridade,
          solicitante,
          solicitante_id: solicitanteId,
          responsavel_id: data.responsavelId,
          prazo: data.prazo,
          evento_id: data.eventoRelacionado,
          evento_nome: eventoNome,
          tags: data.tags || [],
          status: 'aberta',
        })
        .select()
        .single();

      if (error) throw error;

      // Enviar push notification se demanda for urgente
      if (data.prioridade === 'urgente' && data.responsavelId) {
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
          
          await fetch(`${supabaseUrl}/functions/v1/send-push`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({
              userId: data.responsavelId,
              title: '🚨 Demanda Urgente',
              body: `${data.titulo}${data.prazo ? ` - Prazo: ${format(new Date(data.prazo), 'dd/MM')}` : ''}`,
              url: `/demandas?id=${demanda.id}`
            })
          });
        } catch (pushError) {
          // Não falha a operação se push notification falhar
        }
      }

      return demanda;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['demandas'] });
      toast.success('Demanda criada!', { description: 'A demanda foi criada com sucesso.' });
    },
    onError: () => {
      toast.error('Erro ao criar demanda');
    },
  });

  const editarDemanda = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DemandaFormData> }) => {
      const updateData: DemandaUpdateData = {};
      if (data.titulo) updateData.titulo = data.titulo;
      if (data.descricao) updateData.descricao = data.descricao;
      if (data.categoria) updateData.categoria = data.categoria;
      if (data.prioridade) updateData.prioridade = data.prioridade;
      if (data.responsavelId !== undefined) updateData.responsavel_id = data.responsavelId;
      if (data.prazo !== undefined) updateData.prazo = data.prazo;
      if (data.eventoRelacionado !== undefined) {
        updateData.evento_id = data.eventoRelacionado;
        
        // Buscar nome do evento
        if (data.eventoRelacionado) {
          const { data: evento } = await supabase
            .from('eventos')
            .select('nome')
            .eq('id', data.eventoRelacionado)
            .single();
          updateData.evento_nome = evento?.nome;
        } else {
          updateData.evento_nome = null;
        }
      }
      if (data.tags !== undefined) updateData.tags = data.tags;

      const { error } = await supabase
        .from('demandas')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      return { id, data: updateData };
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['demandas'] });
      const previousDemandas = queryClient.getQueryData(['demandas']);
      
      queryClient.setQueriesData({ queryKey: ['demandas'] }, (old: DemandasQueryCache | undefined) => {
        if (!old) return old;
        return {
          ...old,
          demandas: old.demandas.map((d) => 
            d.id === id ? { ...d, ...data } : d
          )
        };
      });
      
      return { previousDemandas };
    },
    onError: (error, variables, context) => {
      if (context?.previousDemandas) {
        queryClient.setQueryData(['demandas'], context.previousDemandas);
      }
      toast.error('Erro ao editar demanda');
    },
    onSuccess: () => {
      toast.success('Demanda atualizada!', { description: 'As alterações foram salvas.' });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['demandas'] });
    },
  });

  const excluirDemanda = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('demandas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['demandas'] });
      const previousDemandas = queryClient.getQueryData(['demandas']);
      
      queryClient.setQueriesData({ queryKey: ['demandas'] }, (old: DemandasQueryCache | undefined) => {
        if (!old) return old;
        return {
          ...old,
          demandas: old.demandas.filter((d) => d.id !== id),
          totalCount: old.totalCount - 1
        };
      });
      
      return { previousDemandas };
    },
    onError: (error, variables, context) => {
      if (context?.previousDemandas) {
        queryClient.setQueryData(['demandas'], context.previousDemandas);
      }
      toast.error('Erro ao excluir demanda');
    },
    onSuccess: () => {
      toast.success('Demanda excluída!', { description: 'A demanda foi removida.' });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['demandas'] });
    },
  });

  const alterarStatus = useMutation({
    mutationFn: async ({ id, novoStatus }: { id: string; novoStatus: StatusDemanda }) => {
      const updateData: DemandaUpdateData = { status: novoStatus };
      if (novoStatus === 'concluida' || novoStatus === 'cancelada') {
        updateData.data_conclusao = new Date().toISOString();
      }

      const { error } = await supabase
        .from('demandas')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: async (_, { novoStatus }) => {
      await queryClient.invalidateQueries({ queryKey: ['demandas'] });
      toast.success('Status atualizado!', { description: `Demanda marcada como ${novoStatus}.` });
    },
    onError: () => {
      toast.error('Erro ao alterar status');
    },
  });

  const atribuirResponsavel = useMutation({
    mutationFn: async ({ 
      demandaId, 
      responsavelId, 
      responsavelNome 
    }: { 
      demandaId: string; 
      responsavelId: string; 
      responsavelNome: string;
    }) => {
      const { error } = await supabase
        .from('demandas')
        .update({
          responsavel_id: responsavelId,
          responsavel: responsavelNome,
          status: 'em-andamento',
        })
        .eq('id', demandaId);

      if (error) throw error;
    },
    onSuccess: async (_, { responsavelNome }) => {
      await queryClient.invalidateQueries({ queryKey: ['demandas'] });
      toast.success('Responsável atribuído!', { 
        description: `${responsavelNome} foi atribuído à demanda.` 
      });
    },
    onError: () => {
      toast.error('Erro ao atribuir responsável');
    },
  });

  const marcarComoResolvida = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('demandas')
        .update({ resolvida: true })
        .eq('id', id);

      if (error) throw error;

      // Adicionar comentário de sistema
      await supabase.from('demandas_comentarios').insert({
        demanda_id: id,
        autor: 'Sistema',
        autor_id: 'sistema',
        conteudo: 'Demanda marcada como resolvida',
        tipo: 'sistema',
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['demandas'] });
      toast.success('Demanda resolvida', { description: 'A demanda foi marcada como resolvida.' });
    },
    onError: () => {
      toast.error('Erro ao marcar como resolvida');
    },
  });

  const reabrirDemanda = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('demandas')
        .update({ 
          resolvida: false,
          status: 'em-andamento',
        })
        .eq('id', id);

      if (error) throw error;

      // Adicionar comentário de sistema
      await supabase.from('demandas_comentarios').insert({
        demanda_id: id,
        autor: 'Sistema',
        autor_id: 'sistema',
        conteudo: 'Demanda reaberta',
        tipo: 'sistema',
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['demandas'] });
      toast.success('Demanda reaberta', { description: 'A demanda foi reaberta para novas interações.' });
    },
    onError: () => {
      toast.error('Erro ao reabrir demanda');
    },
  });

  const arquivarDemanda = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('demandas')
        .update({ arquivada: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['demandas'] });
      toast.success('Demanda arquivada', { description: 'A demanda foi movida para arquivados.' });
    },
    onError: () => {
      toast.error('Erro ao arquivar demanda');
    },
  });

  const desarquivarDemanda = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('demandas')
        .update({ arquivada: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['demandas'] });
      toast.success('Demanda desarquivada', { description: 'A demanda foi reativada.' });
    },
    onError: () => {
      toast.error('Erro ao desarquivar demanda');
    },
  });

  const adicionarDemandaReembolso = useMutation({
    mutationFn: async (data: { demanda_id: string; valor: number; descricao: string; comprovantes?: string[]; status?: string }) => {
      const { error } = await supabase
        .from('demandas_reembolsos')
        .insert(data);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['demandas'] });
      toast.success('Reembolso solicitado com sucesso!', { description: 'O reembolso foi registrado.' });
    },
    onError: () => {
      toast.error('Erro ao solicitar reembolso');
    },
  });

  return {
    adicionarDemanda,
    editarDemanda,
    excluirDemanda,
    alterarStatus,
    atribuirResponsavel,
    marcarComoResolvida,
    reabrirDemanda,
    arquivarDemanda,
    desarquivarDemanda,
    adicionarDemandaReembolso,
  };
}
