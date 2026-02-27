import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import type { BaseConhecimentoArtigo, BaseConhecimentoCategoria, CategoriaComContagem } from '@/types/baseConhecimento';

export function useBaseConhecimentoCategorias() {
  return useQuery({
    queryKey: queryKeys.baseConhecimento.categorias,
    queryFn: async (): Promise<CategoriaComContagem[]> => {
      const { data: categorias, error } = await supabase
        .from('base_conhecimento_categorias')
        .select('*')
        .eq('ativa', true)
        .order('ordem');

      if (error) throw error;

      // Contar artigos publicados por categoria
      const { data: artigos } = await supabase
        .from('base_conhecimento_artigos')
        .select('categoria_id')
        .eq('publicado', true);

      const contagem = new Map<string, number>();
      artigos?.forEach((a: { categoria_id: string | null }) => {
        if (a.categoria_id) {
          contagem.set(a.categoria_id, (contagem.get(a.categoria_id) || 0) + 1);
        }
      });

      return (categorias as BaseConhecimentoCategoria[]).map(cat => ({
        ...cat,
        total_artigos: contagem.get(cat.id) || 0,
      }));
    },
  });
}

export function useBaseConhecimentoArtigos(categoriaId?: string, searchTerm?: string) {
  return useQuery({
    queryKey: [...queryKeys.baseConhecimento.artigos, categoriaId, searchTerm],
    queryFn: async (): Promise<BaseConhecimentoArtigo[]> => {
      let query = supabase
        .from('base_conhecimento_artigos')
        .select('*, categoria:base_conhecimento_categorias(*)');

      if (categoriaId) {
        query = query.eq('categoria_id', categoriaId);
      }

      if (searchTerm) {
        query = query.or(`titulo.ilike.%${searchTerm}%,resumo.ilike.%${searchTerm}%`);
      }

      query = query.order('ordem').order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as BaseConhecimentoArtigo[];
    },
  });
}

export function useBaseConhecimentoArtigo(artigoId: string) {
  return useQuery({
    queryKey: queryKeys.baseConhecimento.artigo(artigoId),
    queryFn: async (): Promise<BaseConhecimentoArtigo> => {
      const { data, error } = await supabase
        .from('base_conhecimento_artigos')
        .select('*, categoria:base_conhecimento_categorias(*)')
        .eq('id', artigoId)
        .single();

      if (error) throw error;

      // Incrementar visualizações
      await supabase
        .from('base_conhecimento_artigos')
        .update({ visualizacoes: ((data as Record<string, unknown>).visualizacoes as number) + 1 })
        .eq('id', artigoId);

      return data as unknown as BaseConhecimentoArtigo;
    },
    enabled: !!artigoId,
  });
}

export function useTodasCategorias() {
  return useQuery({
    queryKey: [...queryKeys.baseConhecimento.categorias, 'todas'],
    queryFn: async (): Promise<BaseConhecimentoCategoria[]> => {
      const { data, error } = await supabase
        .from('base_conhecimento_categorias')
        .select('*')
        .order('ordem');

      if (error) throw error;
      return data as BaseConhecimentoCategoria[];
    },
  });
}
