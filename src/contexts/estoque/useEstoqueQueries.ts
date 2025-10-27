import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FiltrosEstoque } from '@/types/estoque';

export const useEstoqueQueries = (page = 1, pageSize = 50, filtros?: FiltrosEstoque) => {
  const queryResult = useQuery({
    queryKey: ['materiais_estoque', page, pageSize, filtros],
    queryFn: async () => {
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;

      let query = supabase
        .from('materiais_estoque')
        .select(`
          *,
          materiais_seriais (
            numero,
            status,
            localizacao,
            ultima_manutencao,
            data_aquisicao,
            observacoes
          )
        `, { count: 'exact' });

      // Aplicar filtros server-side
      if (filtros?.busca) {
        query = query.or(`nome.ilike.%${filtros.busca}%,categoria.ilike.%${filtros.busca}%,id.ilike.%${filtros.busca}%`);
      }
      
      if (filtros?.categoria && filtros.categoria !== 'todas') {
        query = query.eq('categoria', filtros.categoria);
      }

      const { data, error, count } = await query
        .order('nome')
        .range(start, end);

      if (error) throw error;

      // Transformar dados para o formato esperado
      const materiaisTransformados = (data || []).map((m: any) => ({
        id: m.id,
        nome: m.nome,
        categoria: m.categoria,
        descricao: m.descricao || undefined,
        foto: m.foto || undefined,
        valorUnitario: m.valor_unitario || undefined,
        quantidadeTotal: m.quantidade_total,
        quantidadeDisponivel: m.quantidade_disponivel,
        unidade: 'un',
        seriais: (m.materiais_seriais || []).map((s: any) => ({
          numero: s.numero,
          status: s.status as 'disponivel' | 'em-uso' | 'manutencao',
          localizacao: s.localizacao,
          ultimaManutencao: s.ultima_manutencao || undefined,
          dataAquisicao: s.data_aquisicao || undefined,
          observacoes: s.observacoes || undefined,
        }))
      }));

      return {
        materiais: materiaisTransformados,
        totalCount: count || 0,
      };
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  const { data } = queryResult;

  const buscarMaterialPorId = async (id: string) => {
    const { data, error } = await supabase
      .from('materiais_estoque')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  };

  return {
    ...queryResult,
    materiais: data?.materiais || [],
    totalCount: data?.totalCount || 0,
    buscarMaterialPorId,
  };
};
