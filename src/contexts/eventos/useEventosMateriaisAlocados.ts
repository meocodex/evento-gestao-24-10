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
    removerMaterialAlocado,
  };
}