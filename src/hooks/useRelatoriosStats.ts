import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RelatoriosStats {
  estoqueDisponivel: number;
  estoqueEmUso: number;
  estoqueManutencao: number;
  estoquePerdido: number;
  estoqueConsumido: number;
}

export function useRelatoriosStats() {
  return useQuery({
    queryKey: ['relatorios-stats'],
    queryFn: async (): Promise<RelatoriosStats> => {
      // Buscar seriais para contar por status
      const { data: seriais } = await supabase
        .from('materiais_seriais')
        .select('status');

      const estoqueDisponivel = seriais?.filter(s => s.status === 'disponivel').length || 0;
      const estoqueEmUso = seriais?.filter(s => s.status === 'em-uso').length || 0;
      const estoqueManutencao = seriais?.filter(s => s.status === 'manutencao').length || 0;
      const estoquePerdido = seriais?.filter(s => s.status === 'perdido').length || 0;
      const estoqueConsumido = seriais?.filter(s => s.status === 'consumido').length || 0;

      return {
        estoqueDisponivel,
        estoqueEmUso,
        estoqueManutencao,
        estoquePerdido,
        estoqueConsumido,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 15,
  });
}
