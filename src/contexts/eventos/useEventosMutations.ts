import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EventoFormData, Evento, StatusEvento } from '@/types/eventos';

export function useEventosMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
          status: 'orcamento',
          descricao: data.descricao,
          observacoes: data.observacoes,
          tags: data.tags || [],
          configuracao_bar: data.configuracaoBar as any,
          configuracao_ingresso: data.configuracaoIngresso as any
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

      toast({
        title: 'Evento criado!',
        description: `${data.nome} foi criado com sucesso.`
      });

      return evento as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar evento',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const editarEvento = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Evento> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Validações de data
      if (data.dataInicio && data.dataFim) {
        if (new Date(data.dataFim) < new Date(data.dataInicio)) {
          throw new Error('Data de término não pode ser anterior à data de início');
        }
      }

      const updateData: any = {};
      
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
      if (data.configuracaoBar !== undefined) updateData.configuracao_bar = data.configuracaoBar;
      if (data.configuracaoIngresso !== undefined) updateData.configuracao_ingresso = data.configuracaoIngresso;
      if ((data as any).clienteId !== undefined) updateData.cliente_id = (data as any).clienteId;
      if ((data as any).comercialId !== undefined) updateData.comercial_id = (data as any).comercialId;

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
      queryClient.setQueriesData({ queryKey: ['eventos'] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          eventos: old.eventos?.map((e: Evento) => 
            e.id === id ? { ...e, ...data } : e
          )
        };
      });
      
      return { previousEventos };
    },
    onSuccess: () => {
      toast({
        title: 'Evento atualizado!',
        description: 'As alterações foram salvas com sucesso.'
      });
      // Invalidar apenas evento-detalhes para recarregar dados completos
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes'] });
    },
    onError: (error: any, variables, context) => {
      // Rollback em caso de erro
      if (context?.previousEventos) {
        queryClient.setQueryData(['eventos'], context.previousEventos);
      }
      toast({
        title: 'Erro ao atualizar evento',
        description: error.message,
        variant: 'destructive'
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

      toast({
        title: 'Evento excluído!',
        description: 'O evento foi removido com sucesso.'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir evento',
        description: error.message,
        variant: 'destructive'
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
      queryClient.setQueriesData({ queryKey: ['eventos'] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          eventos: old.eventos?.map((e: Evento) => 
            e.id === id ? { ...e, status: novoStatus } : e
          )
        };
      });
      
      return { previousEventos };
    },
    onSuccess: (_, { novoStatus }) => {
      toast({
        title: 'Status atualizado!',
        description: `O status foi alterado para ${novoStatus}.`
      });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes'] });
    },
    onError: (error: any, variables, context) => {
      // Rollback em caso de erro
      if (context?.previousEventos) {
        queryClient.setQueryData(['eventos'], context.previousEventos);
      }
      toast({
        title: 'Erro ao alterar status',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    criarEvento: (data: EventoFormData) => criarEvento.mutateAsync(data),
    editarEvento: (id: string, data: Partial<Evento>) => editarEvento.mutateAsync({ id, data }),
    excluirEvento: (id: string) => excluirEvento.mutateAsync(id),
    alterarStatus: (id: string, novoStatus: StatusEvento, observacao?: string) => alterarStatus.mutateAsync({ id, novoStatus, observacao })
  };
}
