import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { FiltrosEstoque } from '@/types/estoque';
import type { RawEstoqueMaterialFromDB, RawSerialFromDB } from '@/types/utils';
import { dbToUiStatus, StatusDB } from '@/lib/estoqueStatus';

export const useEstoqueQueries = (page = 1, pageSize = 50, filtros?: FiltrosEstoque) => {
  const queryClient = useQueryClient();
  const queryResult = useQuery({
    queryKey: ['materiais_estoque', page, pageSize, filtros],
    queryFn: async () => {
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;

      let query = supabase
        .from('materiais_estoque')
        .select(`
          *,
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
      const materiaisTransformados = (data || []).map((m: RawEstoqueMaterialFromDB) => ({
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
        seriais: (m.materiais_seriais || []).map((s: RawSerialFromDB) => ({
          numero: s.numero,
          status: dbToUiStatus(s.status as StatusDB),
          localizacao: s.localizacao,
          tags: s.tags || [],
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
    staleTime: 1000 * 60 * 2, // 2 minutos (com real-time não precisa ser tão baixo)
    gcTime: 1000 * 60 * 30,
  });

  // Listener para updates em tempo real
  useEffect(() => {
    const channel = supabase
      .channel('materiais-estoque-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'materiais_estoque'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['materiais_estoque'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'materiais_seriais'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['materiais_estoque'] });
          queryClient.invalidateQueries({ queryKey: ['materiais_seriais'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data } = queryResult;

  const buscarMaterialPorId = async (id: string) => {
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
    
    const materialData = data as RawEstoqueMaterialFromDB;
    
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
