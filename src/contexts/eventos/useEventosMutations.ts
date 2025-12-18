import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EventoFormData, Evento, StatusEvento } from '@/types/eventos';
import { DatabaseError, getErrorMessage, EventosQueryCache, EventoUpdateData, toJson } from '@/types/utils';

export function useEventosMutations() {
  const queryClient = useQueryClient();

  const criarEvento = useMutation({
    mutationFn: async (data: EventoFormData): Promise<Evento> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Validações
      if (!data.clienteId) throw new Error('Cliente é obrigatório');
      if (!data.comercialId) throw new Error('Comercial é obrigatório');
      
      if (new Date(data.dataFim) < new Date(data.dataInicio)) {
        throw new Error('Data de término não pode ser anterior à data de início');
      }

      const { data: evento, error } = await supabase
        .from('eventos')
        .insert([{
          nome: data.nome,
          tipo_evento: data.tipoEvento || 'bar',
          cliente_id: data.clienteId,
          comercial_id: data.comercialId,
          data_inicio: data.dataInicio,
          data_fim: data.dataFim,
          hora_inicio: data.horaInicio,
          hora_fim: data.horaFim,
          local: data.local,
          endereco: data.endereco,
          cidade: data.cidade,
          estado: data.estado,
          status: 'em_negociacao',
          descricao: data.descricao,
          observacoes: data.observacoes,
          tags: data.tags || [],
          configuracao_bar: data.configuracaoBar ? toJson(data.configuracaoBar) : null,
          configuracao_ingresso: data.configuracaoIngresso ? toJson(data.configuracaoIngresso) : null,
          utiliza_pos_empresa: data.utilizaPosEmpresa || false
        }])
        .select(`
          *,
          cliente:clientes(*),
          comercial:profiles!eventos_comercial_id_fkey(*)
        `)
        .single();

      if (error) throw error;

      // Criar entrada na timeline
      await supabase.from('eventos_timeline').insert([{
        evento_id: evento.id,
        tipo: 'criacao',
        descricao: 'Evento criado',
        usuario: user.email || 'Sistema'
      }]);

      toast.success('Evento criado!', {
        description: `${data.nome} foi criado com sucesso.`
      });

      return evento as Evento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
    onError: (error: DatabaseError) => {
      toast.error('Erro ao criar evento', {
        description: getErrorMessage(error)
      });
    }
  });

  const editarEvento = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Evento> & { clienteId?: string; comercialId?: string } }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Validações de data
      if (data.dataInicio && data.dataFim) {
        if (new Date(data.dataFim) < new Date(data.dataInicio)) {
          throw new Error('Data de término não pode ser anterior à data de início');
        }
      }

      const updateData: EventoUpdateData = {};
      
      if (data.nome !== undefined) updateData.nome = data.nome;
      if (data.tipoEvento !== undefined) updateData.tipo_evento = data.tipoEvento;
      if (data.dataInicio !== undefined) updateData.data_inicio = data.dataInicio;
      if (data.dataFim !== undefined) updateData.data_fim = data.dataFim;
      if (data.horaInicio !== undefined) updateData.hora_inicio = data.horaInicio;
      if (data.horaFim !== undefined) updateData.hora_fim = data.horaFim;
      if (data.local !== undefined) updateData.local = data.local;
      if (data.endereco !== undefined) updateData.endereco = data.endereco;
      if (data.cidade !== undefined) updateData.cidade = data.cidade;
      if (data.estado !== undefined) updateData.estado = data.estado;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.descricao !== undefined) updateData.descricao = data.descricao;
      if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;
      if (data.tags !== undefined) updateData.tags = data.tags;
      if (data.documentos !== undefined) updateData.documentos = data.documentos;
      if (data.fotosEvento !== undefined) updateData.fotos_evento = data.fotosEvento;
      if (data.redesSociais !== undefined) updateData.redes_sociais = data.redesSociais;
      if (data.contatosAdicionais !== undefined) updateData.contatos_adicionais = data.contatosAdicionais;
      if (data.observacoesOperacionais !== undefined) updateData.observacoes_operacionais = data.observacoesOperacionais;
      if (data.plantaBaixa !== undefined) updateData.planta_baixa = data.plantaBaixa;
      if (data.configuracaoBar !== undefined) updateData.configuracao_bar = toJson(data.configuracaoBar);
      if (data.configuracaoIngresso !== undefined) updateData.configuracao_ingresso = toJson(data.configuracaoIngresso);
      if (data.clienteId !== undefined) updateData.cliente_id = data.clienteId;
      if (data.comercialId !== undefined) updateData.comercial_id = data.comercialId;

      const { error } = await supabase
        .from('eventos')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Adicionar à timeline
      await supabase.from('eventos_timeline').insert([{
        evento_id: id,
        tipo: 'edicao',
        descricao: 'Evento atualizado',
        usuario: user.email || 'Sistema'
      }]);

      return { id, data };
    },
    onMutate: async ({ id, data }) => {
      // Cancelar refetches em andamento
      await queryClient.cancelQueries({ queryKey: ['eventos'] });
      
      // Snapshot do valor anterior
      const previousEventos = queryClient.getQueryData(['eventos']);
      
      // Update otimista - atualizar cache com novos dados
      queryClient.setQueriesData<EventosQueryCache>({ queryKey: ['eventos'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          eventos: old.eventos?.map((e) => 
            e.id === id ? { ...e, ...data } : e
          )
        };
      });
      
      return { previousEventos };
    },
    onSuccess: () => {
      toast.success('Evento atualizado!', {
        description: 'As alterações foram salvas com sucesso.'
      });
      // Invalidar apenas evento-detalhes para recarregar dados completos
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes'] });
    },
    onError: (error: DatabaseError, _variables, context) => {
      // Rollback em caso de erro
      if (context?.previousEventos) {
        queryClient.setQueryData(['eventos'], context.previousEventos);
      }
      toast.error('Erro ao atualizar evento', {
        description: getErrorMessage(error)
      });
    }
  });

  const excluirEvento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Evento excluído!', {
        description: 'O evento foi removido com sucesso.'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
    onError: (error: DatabaseError) => {
      toast.error('Erro ao excluir evento', {
        description: getErrorMessage(error)
      });
    }
  });

  const alterarStatus = useMutation({
    mutationFn: async ({ id, novoStatus, observacao }: { id: string; novoStatus: StatusEvento; observacao?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('eventos')
        .update({ status: novoStatus })
        .eq('id', id);

      if (error) throw error;

      // Adicionar à timeline
      const descricaoTimeline = observacao 
        ? `Status alterado para: ${novoStatus} - ${observacao}`
        : `Status alterado para: ${novoStatus}`;

      await supabase.from('eventos_timeline').insert([{
        evento_id: id,
        tipo: 'edicao',
        descricao: descricaoTimeline,
        usuario: user.email || 'Sistema'
      }]);

      return { id, novoStatus };
    },
    onMutate: async ({ id, novoStatus }) => {
      // Cancelar refetches em andamento
      await queryClient.cancelQueries({ queryKey: ['eventos'] });
      
      // Snapshot do valor anterior
      const previousEventos = queryClient.getQueryData(['eventos']);
      
      // Update otimista
      queryClient.setQueriesData<EventosQueryCache>({ queryKey: ['eventos'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          eventos: old.eventos?.map((e) => 
            e.id === id ? { ...e, status: novoStatus } : e
          )
        };
      });
      
      return { previousEventos };
    },
    onSuccess: (_, { novoStatus }) => {
      toast.success('Status atualizado!', {
        description: `O status foi alterado para ${novoStatus}.`
      });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes'] });
    },
    onError: (error: DatabaseError, _variables, context) => {
      // Rollback em caso de erro
      if (context?.previousEventos) {
        queryClient.setQueryData(['eventos'], context.previousEventos);
      }
      toast.error('Erro ao alterar status', {
        description: getErrorMessage(error)
      });
    }
  });

  const arquivarEvento = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar dados do evento
      const { data: evento, error: eventoError } = await supabase
        .from('eventos')
        .select('data_fim, hora_fim')
        .eq('id', id)
        .single();

      if (eventoError) throw eventoError;
      if (!evento) throw new Error('Evento não encontrado');

      // Verificar se evento já terminou
      const agora = new Date();
      const fimEvento = new Date(`${evento.data_fim}T${evento.hora_fim}`);
      
      if (agora < fimEvento) {
        throw new Error('Não é possível arquivar um evento que ainda não terminou');
      }

      // Verificar se tem materiais pendentes
      const { count } = await supabase
        .from('eventos_materiais_alocados')
        .select('id', { count: 'exact' })
        .eq('evento_id', id)
        .eq('status_devolucao', 'pendente');

      if (count && count > 0) {
        throw new Error('Não é possível arquivar evento com materiais pendentes de devolução');
      }

      const { error } = await supabase
        .from('eventos')
        .update({ arquivado: true })
        .eq('id', id);

      if (error) throw error;

      // Adicionar à timeline
      await supabase.from('eventos_timeline').insert({
        evento_id: id,
        tipo: 'arquivamento',
        descricao: 'Evento arquivado',
        usuario: user.email || 'Sistema'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes'] });
      toast.success('Evento arquivado', { 
        description: 'O evento foi movido para arquivados.' 
      });
    },
    onError: (error: DatabaseError) => {
      toast.error('Erro ao arquivar evento', { 
        description: getErrorMessage(error)
      });
    }
  });

  return {
    adicionarEvento: criarEvento,
    editarEvento: editarEvento,
    excluirEvento: excluirEvento,
    alterarStatus: alterarStatus,
    arquivarEvento: arquivarEvento,
  };
}
