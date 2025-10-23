import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useEventosMateriaisAlocados(eventoId: string) {
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

  const alocarMaterial = async (data: any) => {
    const { error } = await supabase
      .from('eventos_materiais_alocados')
      .insert({ ...data, evento_id: eventoId });
    if (error) throw error;
    toast.success('Material alocado com sucesso!');
  };

  const removerMaterialAlocado = async (id: string) => {
    const { error } = await supabase
      .from('eventos_materiais_alocados')
      .delete()
      .eq('id', id);
    if (error) throw error;
    toast.success('Material removido com sucesso!');
  };

  return {
    materiaisAlocados: materiaisData || [],
    loading: isLoading,
    alocarMaterial,
    removerMaterialAlocado,
  };
}