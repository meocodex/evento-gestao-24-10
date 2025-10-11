import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { DemandaFormData, StatusDemanda } from '@/types/demandas';

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
          tags: data.tags || [],
          status: 'aberta',
        })
        .select()
        .single();

      if (error) throw error;
      return demanda;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
      toast({ title: 'Demanda criada!', description: 'A demanda foi criada com sucesso.' });
    },
    onError: (error) => {
      console.error('Erro ao criar demanda:', error);
      toast({ title: 'Erro ao criar demanda', variant: 'destructive' });
    },
  });

  const editarDemanda = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DemandaFormData> }) => {
      const updateData: any = {};
      if (data.titulo) updateData.titulo = data.titulo;
      if (data.descricao) updateData.descricao = data.descricao;
      if (data.categoria) updateData.categoria = data.categoria;
      if (data.prioridade) updateData.prioridade = data.prioridade;
      if (data.responsavelId !== undefined) updateData.responsavel_id = data.responsavelId;
      if (data.prazo !== undefined) updateData.prazo = data.prazo;
      if (data.eventoRelacionado !== undefined) updateData.evento_id = data.eventoRelacionado;
      if (data.tags !== undefined) updateData.tags = data.tags;

      const { error } = await supabase
        .from('demandas')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
      toast({ title: 'Demanda atualizada!', description: 'As alterações foram salvas.' });
    },
    onError: (error) => {
      console.error('Erro ao editar demanda:', error);
      toast({ title: 'Erro ao editar demanda', variant: 'destructive' });
    },
  });

  const excluirDemanda = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('demandas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
      toast({ title: 'Demanda excluída!', description: 'A demanda foi removida.' });
    },
    onError: (error) => {
      console.error('Erro ao excluir demanda:', error);
      toast({ title: 'Erro ao excluir demanda', variant: 'destructive' });
    },
  });

  const alterarStatus = useMutation({
    mutationFn: async ({ id, novoStatus }: { id: string; novoStatus: StatusDemanda }) => {
      const updateData: any = { status: novoStatus };
      if (novoStatus === 'concluida' || novoStatus === 'cancelada') {
        updateData.data_conclusao = new Date().toISOString();
      }

      const { error } = await supabase
        .from('demandas')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, { novoStatus }) => {
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
      toast({ title: 'Status atualizado!', description: `Demanda marcada como ${novoStatus}.` });
    },
    onError: (error) => {
      console.error('Erro ao alterar status:', error);
      toast({ title: 'Erro ao alterar status', variant: 'destructive' });
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
    onSuccess: (_, { responsavelNome }) => {
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
      toast({ 
        title: 'Responsável atribuído!', 
        description: `${responsavelNome} foi atribuído à demanda.` 
      });
    },
    onError: (error) => {
      console.error('Erro ao atribuir responsável:', error);
      toast({ title: 'Erro ao atribuir responsável', variant: 'destructive' });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
      toast({ title: 'Demanda resolvida', description: 'A demanda foi marcada como resolvida.' });
    },
    onError: (error) => {
      console.error('Erro ao marcar como resolvida:', error);
      toast({ title: 'Erro ao marcar como resolvida', variant: 'destructive' });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
      toast({ title: 'Demanda reaberta', description: 'A demanda foi reaberta para novas interações.' });
    },
    onError: (error) => {
      console.error('Erro ao reabrir demanda:', error);
      toast({ title: 'Erro ao reabrir demanda', variant: 'destructive' });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
      toast({ title: 'Demanda arquivada', description: 'A demanda foi movida para arquivados.' });
    },
    onError: (error) => {
      console.error('Erro ao arquivar demanda:', error);
      toast({ title: 'Erro ao arquivar demanda', variant: 'destructive' });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demandas'] });
      toast({ title: 'Demanda desarquivada', description: 'A demanda foi reativada.' });
    },
    onError: (error) => {
      console.error('Erro ao desarquivar demanda:', error);
      toast({ title: 'Erro ao desarquivar demanda', variant: 'destructive' });
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
  };
}
