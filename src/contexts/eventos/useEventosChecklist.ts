import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useEventosChecklist(eventoId: string) {
  const queryClient = useQueryClient();
  
  const { data: checklistData, isLoading } = useQuery({
    queryKey: ['eventos-checklist', eventoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos_checklist')
        .select('*')
        .eq('evento_id', eventoId);
      
      if (error) throw error;
      return data;
    },
  });

  const adicionarMaterialChecklist = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        item_id: data.itemId,
        nome: data.nome,
        quantidade: data.quantidade,
        alocado: 0,
        evento_id: eventoId,
      };

      const { error } = await supabase
        .from('eventos_checklist')
        .insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-checklist', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      toast.success('Material adicionado ao checklist!');
    },
  });

  const removerMaterialChecklist = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('eventos_checklist')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-checklist', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['evento-detalhes', eventoId] });
      toast.success('Material removido do checklist!');
    },
  });

  return {
    checklist: checklistData || [],
    loading: isLoading,
    adicionarMaterialChecklist,
    removerMaterialChecklist,
  };
}