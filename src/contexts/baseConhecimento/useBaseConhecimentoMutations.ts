import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

// ==================== ARTIGOS ====================

interface CriarArtigoParams {
  titulo: string;
  conteudo: string;
  resumo?: string;
  categoria_id?: string;
  tags?: string[];
  anexos?: Json;
  links_externos?: Json;
  publicado?: boolean;
  autor_id: string;
  autor_nome: string;
}

export function useCriarArtigo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: CriarArtigoParams) => {
      const { data, error } = await supabase
        .from('base_conhecimento_artigos')
        .insert({
          titulo: params.titulo,
          conteudo: params.conteudo,
          resumo: params.resumo || null,
          categoria_id: params.categoria_id || null,
          tags: params.tags || [],
          anexos: params.anexos || [],
          links_externos: params.links_externos || [],
          publicado: params.publicado || false,
          autor_id: params.autor_id,
          autor_nome: params.autor_nome,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.baseConhecimento.artigos });
      queryClient.invalidateQueries({ queryKey: queryKeys.baseConhecimento.categorias });
      toast.success('Artigo criado com sucesso');
    },
    onError: () => toast.error('Erro ao criar artigo'),
  });
}

interface AtualizarArtigoParams {
  id: string;
  titulo?: string;
  conteudo?: string;
  resumo?: string;
  categoria_id?: string | null;
  tags?: string[];
  anexos?: Json;
  links_externos?: Json;
  publicado?: boolean;
}

export function useAtualizarArtigo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...params }: AtualizarArtigoParams) => {
      const { data, error } = await supabase
        .from('base_conhecimento_artigos')
        .update(params)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.baseConhecimento.artigos });
      queryClient.invalidateQueries({ queryKey: queryKeys.baseConhecimento.artigo(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.baseConhecimento.categorias });
      toast.success('Artigo atualizado com sucesso');
    },
    onError: () => toast.error('Erro ao atualizar artigo'),
  });
}

export function useExcluirArtigo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('base_conhecimento_artigos')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.baseConhecimento.artigos });
      queryClient.invalidateQueries({ queryKey: queryKeys.baseConhecimento.categorias });
      toast.success('Artigo excluído com sucesso');
    },
    onError: () => toast.error('Erro ao excluir artigo'),
  });
}

// ==================== CATEGORIAS ====================

interface CriarCategoriaParams {
  nome: string;
  descricao?: string;
  icone?: string;
  ordem?: number;
}

export function useCriarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: CriarCategoriaParams) => {
      const { data, error } = await supabase
        .from('base_conhecimento_categorias')
        .insert(params)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.baseConhecimento.categorias });
      toast.success('Categoria criada com sucesso');
    },
    onError: () => toast.error('Erro ao criar categoria'),
  });
}

interface AtualizarCategoriaParams {
  id: string;
  nome?: string;
  descricao?: string;
  icone?: string;
  ordem?: number;
  ativa?: boolean;
}

export function useAtualizarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...params }: AtualizarCategoriaParams) => {
      const { data, error } = await supabase
        .from('base_conhecimento_categorias')
        .update(params)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.baseConhecimento.categorias });
      toast.success('Categoria atualizada');
    },
    onError: () => toast.error('Erro ao atualizar categoria'),
  });
}

export function useExcluirCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('base_conhecimento_categorias')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.baseConhecimento.categorias });
      toast.success('Categoria excluída');
    },
    onError: () => toast.error('Erro ao excluir categoria'),
  });
}
