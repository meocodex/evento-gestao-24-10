import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect } from 'react';

export function useEventosChecklist(eventoId: string) {
  const queryClient = useQueryClient();
  
  const { data: checklistData, isLoading } = useQuery({
    queryKey: ['eventos-checklist', eventoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos_checklist')
        .select('*')
        .eq('evento_id', eventoId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel(`eventos-checklist-${eventoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'eventos_checklist',
          filter: `evento_id=eq.${eventoId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['eventos-checklist', eventoId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventoId, queryClient]);

  const adicionarMaterialChecklist = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        item_id: data.itemId,
        nome: data.nome,
        quantidade: data.quantidade,
        alocado: 0,
        evento_id: eventoId,
      };

      const { data: insertedData, error } = await supabase
        .from('eventos_checklist')
        .insert(payload)
        .select('*')
        .single();
      
      if (error) throw error;
      return insertedData;
    },
    onSuccess: (newItem) => {
      // Update cache immediately
      queryClient.setQueryData(['eventos-checklist', eventoId], (old: any) => 
        old ? [newItem, ...old] : [newItem]
      );
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      toast.success('Material adicionado ao checklist!');
    },
    onError: (error: any) => {
      console.error('Erro ao adicionar material:', error);
      toast.error(`Erro ao adicionar material: ${error.message || 'Verifique suas permissões'}`);
    },
  });

  const removerMaterialChecklist = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('eventos_checklist')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: (deletedId) => {
      // Update cache immediately
      queryClient.setQueryData(['eventos-checklist', eventoId], (old: any) => 
        old ? old.filter((item: any) => item.id !== deletedId) : []
      );
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      toast.success('Material removido do checklist!');
    },
    onError: (error: any) => {
      console.error('Erro ao remover material:', error);
      toast.error(`Erro ao remover material: ${error.message || 'Verifique suas permissões'}`);
    },
  });

  return {
    checklist: checklistData || [],
    loading: isLoading,
    adicionarMaterialChecklist,
    removerMaterialChecklist,
  };
}