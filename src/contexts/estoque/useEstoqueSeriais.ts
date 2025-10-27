import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useEstoqueSeriais = (materialId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
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
    staleTime: 0, // Sempre buscar dados frescos
  });

  // Listener realtime para materiais_seriais
  useEffect(() => {
    if (!materialId) return;

    const channel = supabase
      .channel(`materiais-seriais-${materialId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'materiais_seriais',
          filter: `material_id=eq.${materialId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['materiais_seriais', materialId] });
          queryClient.invalidateQueries({ queryKey: ['materiais_estoque'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [materialId, queryClient]);

  return query;
};
