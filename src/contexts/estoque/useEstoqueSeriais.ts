import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEstoqueSeriais = (materialId?: string) => {
  return useQuery({
    queryKey: ['materiais_seriais', materialId],
    queryFn: async () => {
      if (!materialId) return [];

      const { data, error } = await supabase
        .from('materiais_seriais')
        .select('*')
        .eq('material_id', materialId)
        .order('numero');
      
      if (error) throw error;

      return (data || []).map(s => ({
        numero: s.numero,
        status: s.status as 'disponivel' | 'em-uso' | 'manutencao',
        localizacao: s.localizacao,
        ultimaManutencao: s.ultima_manutencao || undefined,
        dataAquisicao: s.data_aquisicao || undefined,
        observacoes: s.observacoes || undefined,
      }));
    },
    enabled: !!materialId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
