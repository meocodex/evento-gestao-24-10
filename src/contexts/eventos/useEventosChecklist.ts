import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  DatabaseError, 
  getErrorMessage,
  ChecklistItemData, 
  ChecklistItemFromDB 
} from '@/types/utils';

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
      return data as ChecklistItemFromDB[];
    },
  });

  // Realtime é gerenciado pelo useRealtimeHub centralizado

  const adicionarMaterialChecklist = useMutation({
    mutationFn: async (data: ChecklistItemData) => {
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
      return insertedData as ChecklistItemFromDB;
    },
    onSuccess: (newItem) => {
      // Update cache immediately
      queryClient.setQueryData<ChecklistItemFromDB[]>(
        ['eventos-checklist', eventoId], 
        (old) => old ? [newItem, ...old] : [newItem]
      );
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      toast.success('Material adicionado ao checklist!');
    },
    onError: (error: DatabaseError) => {
      toast.error(`Erro ao adicionar material: ${getErrorMessage(error)}`);
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
      queryClient.setQueryData<ChecklistItemFromDB[]>(
        ['eventos-checklist', eventoId], 
        (old) => old ? old.filter((item) => item.id !== deletedId) : []
      );
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      toast.success('Material removido do checklist!');
    },
    onError: (error: DatabaseError) => {
      toast.error(`Erro ao remover material: ${getErrorMessage(error)}`);
    },
  });

  const editarQuantidadeChecklist = useMutation({
    mutationFn: async ({ id, quantidade }: { id: string; quantidade: number }) => {
      const { data, error } = await supabase
        .from('eventos_checklist')
        .update({ quantidade })
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) throw error;
      return data as ChecklistItemFromDB;
    },
    onSuccess: (updatedItem) => {
      // Update cache immediately
      queryClient.setQueryData<ChecklistItemFromDB[]>(
        ['eventos-checklist', eventoId], 
        (old) => old ? old.map((item) => item.id === updatedItem.id ? updatedItem : item) : []
      );
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      toast.success('Quantidade atualizada!');
    },
    onError: (error: DatabaseError) => {
      toast.error(`Erro ao atualizar: ${getErrorMessage(error)}`);
    },
  });

  return {
    checklist: checklistData || [],
    loading: isLoading,
    adicionarMaterialChecklist,
    removerMaterialChecklist,
    editarQuantidadeChecklist,
  };
}
