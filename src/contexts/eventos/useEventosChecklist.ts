import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MaterialChecklist } from '@/types/eventos';

export function useEventosChecklist() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const adicionarMaterial = useMutation({
    mutationFn: async ({ eventoId, material }: { 
      eventoId: string; 
      material: Omit<MaterialChecklist, 'id' | 'alocado'> 
    }) => {
      const { data, error } = await supabase
        .from('eventos_checklist')
        .insert([{
          evento_id: eventoId,
          item_id: material.itemId || `item-${Date.now()}`,
          nome: material.nome,
          quantidade: material.quantidade,
          alocado: 0
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast({
        title: 'Material adicionado!',
        description: 'Material adicionado ao checklist com sucesso.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao adicionar material',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const removerMaterial = useMutation({
    mutationFn: async ({ eventoId, materialId }: { eventoId: string; materialId: string }) => {
      const { error } = await supabase
        .from('eventos_checklist')
        .delete()
        .eq('id', materialId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast({
        title: 'Material removido!',
        description: 'Material removido do checklist.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover material',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    adicionarMaterial,
    removerMaterial
  };
}
