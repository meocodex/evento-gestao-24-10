import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FiltrosEstoque } from '@/types/estoque';
import type { RawSerialFromDB } from '@/types/utils';
import { dbToUiStatus, StatusDB } from '@/lib/estoqueStatus';

// Tipo para resposta agregada do banco (sem seriais inline)
interface RawMaterialAgregado {
  id: string;
  nome: string;
  categoria: string;
  descricao: string | null;
  foto: string | null;
  valor_unitario: number | null;
  quantidade_total: number;
  quantidade_disponivel: number;
  tipo_controle: string;
}

export const useEstoqueQueries = (page = 1, pageSize = 50, filtros?: FiltrosEstoque) => {
  const queryResult = useQuery({
    queryKey: ['materiais_estoque', page, pageSize, filtros],
    queryFn: async () => {
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;

      // Query SEM seriais para reduzir payload em ~60-80%
      let query = supabase
        .from('materiais_estoque')
        .select(`
          id,
          nome,
          categoria,
          descricao,
          foto,
          valor_unitario,
          quantidade_total,
          quantidade_disponivel,
          tipo_controle
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

      // Transformar dados (sem seriais - serão carregados on-demand)
      const materiaisTransformados = (data || []).map((m: RawMaterialAgregado) => ({
        id: m.id,
        nome: m.nome,
        categoria: m.categoria,
        descricao: m.descricao || undefined,
        foto: m.foto || undefined,
        valorUnitario: m.valor_unitario || undefined,
        quantidadeTotal: m.quantidade_total,
        quantidadeDisponivel: m.quantidade_disponivel,
        tipoControle: m.tipo_controle,
        unidade: 'un',
        // Não incluir seriais - serão carregados sob demanda via useEstoqueSeriais
        seriais: undefined,
      }));

      return {
        materiais: materiaisTransformados,
        totalCount: count || 0,
      };
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 30,
  });

  // Realtime é gerenciado pelo useRealtimeHub centralizado

  const { data } = queryResult;

  const buscarMaterialPorId = async (id: string) => {
    // Buscar material com seriais (para detalhamento)
    interface RawMaterialComSeriais extends RawMaterialAgregado {
      materiais_seriais: RawSerialFromDB[];
    }
    
    const { data, error } = await supabase
      .from('materiais_estoque')
      .select(`
        id,
        nome,
        categoria,
        descricao,
        foto,
        valor_unitario,
        quantidade_total,
        quantidade_disponivel,
        tipo_controle,
        materiais_seriais (
          numero,
          status,
          localizacao,
          tags,
          ultima_manutencao,
          data_aquisicao,
          observacoes
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    const materialData = data as RawMaterialComSeriais;
    
    // Transformar para o formato esperado
    return {
      id: materialData.id,
      nome: materialData.nome,
      categoria: materialData.categoria,
      descricao: materialData.descricao || undefined,
      foto: materialData.foto || undefined,
      valorUnitario: materialData.valor_unitario || undefined,
      quantidadeTotal: materialData.quantidade_total,
      quantidadeDisponivel: materialData.quantidade_disponivel,
      tipoControle: materialData.tipo_controle,
      unidade: 'un',
      seriais: (materialData.materiais_seriais || []).map((s: RawSerialFromDB) => ({
        numero: s.numero,
        status: dbToUiStatus(s.status as StatusDB),
        localizacao: s.localizacao,
        tags: s.tags || [],
        ultimaManutencao: s.ultima_manutencao || undefined,
        dataAquisicao: s.data_aquisicao || undefined,
        observacoes: s.observacoes || undefined,
      }))
    };
  };

  return {
    ...queryResult,
    materiais: data?.materiais || [],
    totalCount: data?.totalCount || 0,
    buscarMaterialPorId,
  };
};
