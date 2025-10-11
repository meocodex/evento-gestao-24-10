import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useEventosMateriaisAlocados() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const alocarMaterial = useMutation({
    mutationFn: async ({ 
      eventoId, 
      tipo, 
      material 
    }: { 
      eventoId: string; 
      tipo: 'antecipado' | 'comTecnicos'; 
      material: any 
    }) => {
      const tipoEnvio = tipo === 'antecipado' ? 'antecipado' : 'com_tecnicos';
      
      const { data, error } = await supabase
        .from('eventos_materiais_alocados')
        .insert([{
          evento_id: eventoId,
          item_id: material.itemId,
          nome: material.nome,
          serial: material.serial,
          tipo_envio: tipoEnvio,
          status: 'reservado',
          transportadora: material.transportadora,
          rastreamento: material.rastreamento,
          data_envio: material.dataEnvio,
          responsavel: material.responsavel
        }])
        .select()
        .single();

      if (error) throw error;

      // Atualizar quantidade alocada no checklist
      const { error: checklistError } = await supabase.rpc('increment_checklist_alocado', {
        p_evento_id: eventoId,
        p_item_id: material.itemId
      });

      if (checklistError) console.error('Erro ao atualizar checklist:', checklistError);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast({
        title: 'Material alocado!',
        description: 'Material alocado com sucesso.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao alocar material',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const removerMaterialAlocado = useMutation({
    mutationFn: async ({ 
      eventoId, 
      materialId 
    }: { 
      eventoId: string; 
      materialId: string 
    }) => {
      // Buscar material antes de deletar para pegar o item_id
      const { data: material } = await supabase
        .from('eventos_materiais_alocados')
        .select('item_id')
        .eq('id', materialId)
        .single();

      const { error } = await supabase
        .from('eventos_materiais_alocados')
        .delete()
        .eq('id', materialId);

      if (error) throw error;

      // Decrementar quantidade alocada no checklist
      if (material) {
        const { error: checklistError } = await supabase.rpc('decrement_checklist_alocado', {
          p_evento_id: eventoId,
          p_item_id: material.item_id
        });

        if (checklistError) console.error('Erro ao atualizar checklist:', checklistError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast({
        title: 'Material removido!',
        description: 'Material removido da alocação.'
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
    alocarMaterial,
    removerMaterialAlocado
  };
}
