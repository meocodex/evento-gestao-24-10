import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useEventosMateriaisAlocados(eventoId: string) {
  const queryClient = useQueryClient();
  
  const { data: materiaisData, isLoading } = useQuery({
    queryKey: ['eventos-materiais-alocados', eventoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos_materiais_alocados')
        .select('*')
        .eq('evento_id', eventoId);
      
      if (error) throw error;
      return data;
    },
  });

  const alocarMaterial = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('eventos_materiais_alocados')
        .insert({ ...data, evento_id: eventoId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-materiais-alocados', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['eventos-checklist', eventoId] });
      toast.success('Material alocado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao alocar material:', error);
      toast.error(`Erro ao alocar material: ${error.message || 'Erro desconhecido'}`);
    },
  });

  const alocarMaterialLote = useMutation({
    mutationFn: async (dados: any[]) => {
      const inserts = dados.map(data => ({
        ...data,
        evento_id: eventoId
      }));
      
      const { error } = await supabase
        .from('eventos_materiais_alocados')
        .insert(inserts);
      
      if (error) throw error;
      return inserts.length;
    },
    onSuccess: (count: number) => {
      queryClient.invalidateQueries({ queryKey: ['eventos-materiais-alocados', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['eventos-checklist', eventoId] });
      toast.success(`${count} ${count === 1 ? 'material alocado' : 'materiais alocados'} com sucesso!`);
    },
    onError: (error: any) => {
      console.error('Erro ao alocar materiais em lote:', error);
      toast.error(`Erro ao alocar materiais: ${error.message || 'Erro desconhecido'}`);
    },
  });

  const registrarDevolucao = useMutation({
    mutationFn: async ({ alocacaoId, statusDevolucao, observacoes, fotos }: {
      alocacaoId: string;
      statusDevolucao: string;
      observacoes: string;
      fotos?: string[];
    }) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('eventos_materiais_alocados')
        .update({
          status_devolucao: statusDevolucao,
          data_devolucao: new Date().toISOString(),
          responsavel_devolucao: user.user?.id,
          observacoes_devolucao: observacoes,
          fotos_devolucao: fotos,
        })
        .eq('id', alocacaoId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-materiais-alocados', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['eventos-checklist', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['materiais_estoque'] });
      queryClient.invalidateQueries({ queryKey: ['historico-material'] });
      toast.success('Devolução registrada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao registrar devolução:', error);
      toast.error(`Erro ao registrar devolução: ${error.message || 'Erro desconhecido'}`);
    },
  });

  const removerMaterialAlocado = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('eventos_materiais_alocados')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-materiais-alocados', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['eventos-checklist', eventoId] });
      toast.success('Material removido com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao remover material:', error);
      toast.error(`Erro ao remover material: ${error.message || 'Erro desconhecido'}`);
    },
  });

  // Listener para updates em tempo real
  useEffect(() => {
    const channel = supabase
      .channel(`evento-materiais-${eventoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'eventos_materiais_alocados',
          filter: `evento_id=eq.${eventoId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['eventos-materiais-alocados', eventoId] });
          queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventoId, queryClient]);

  return {
    materiaisAlocados: materiaisData || [],
    loading: isLoading,
    alocarMaterial,
    alocarMaterialLote,
    registrarDevolucao,
    removerMaterialAlocado,
  };
}