import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TipoCategoria, Categoria } from '@/types/categorias';
import { DatabaseError, getErrorMessage, toJson } from '@/types/utils';
import { useAuth } from '@/contexts/AuthContext';
import { queryKeys } from '@/lib/queryKeys';

async function getSharedRecord(tipo: TipoCategoria) {
  const { data, error } = await supabase
    .from('configuracoes_categorias')
    .select('id, categorias, user_id')
    .eq('tipo', tipo)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function useCategoriasMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  const atualizarCategorias = useMutation({
    mutationFn: async ({ tipo, categorias }: { tipo: TipoCategoria; categorias: Categoria[] }) => {
      if (!userId) throw new Error('Usuário não autenticado');
      const config = await getSharedRecord(tipo);

      if (config) {
        const { error } = await supabase
          .from('configuracoes_categorias')
          .update({ categorias: toJson(categorias) })
          .eq('id', config.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('configuracoes_categorias')
          .insert({ user_id: userId, tipo, categorias: toJson(categorias) });
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.configuracoes.categorias });
      toast.success('Categorias atualizadas', {
        description: 'As configurações foram salvas com sucesso.',
      });
    },
    onError: (error: DatabaseError) => {
      toast.error('Erro ao atualizar categorias', {
        description: getErrorMessage(error),
      });
    },
  });

  const adicionarCategoria = useMutation({
    mutationFn: async ({ tipo, categoria }: { tipo: TipoCategoria; categoria: Categoria }) => {
      if (!userId) throw new Error('Usuário não autenticado');
      const config = await getSharedRecord(tipo);

      const categorias = (config?.categorias as unknown as Categoria[]) || [];
      if (categorias.find(c => c.value === categoria.value)) {
        throw new Error(`Categoria "${categoria.label}" já existe`);
      }
      categorias.push(categoria);

      if (config) {
        const { error } = await supabase
          .from('configuracoes_categorias')
          .update({ categorias: toJson(categorias) })
          .eq('id', config.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('configuracoes_categorias')
          .insert({ user_id: userId, tipo, categorias: toJson(categorias) });
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.configuracoes.categorias });
      toast.success('Categoria adicionada', {
        description: 'A nova categoria foi criada com sucesso.',
      });
    },
    onError: (error: DatabaseError) => {
      toast.error('Erro ao adicionar categoria', {
        description: getErrorMessage(error),
      });
    },
  });

  const toggleCategoria = useMutation({
    mutationFn: async ({ tipo, value }: { tipo: TipoCategoria; value: string }) => {
      if (!userId) throw new Error('Usuário não autenticado');
      const config = await getSharedRecord(tipo);
      if (!config) throw new Error('Configuração de categorias não encontrada');

      const categorias = (config.categorias as unknown as Categoria[]) || [];
      const updated = categorias.map(c =>
        c.value === value ? { ...c, ativa: !c.ativa } : c
      );

      const { error } = await supabase
        .from('configuracoes_categorias')
        .update({ categorias: toJson(updated) })
        .eq('id', config.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.configuracoes.categorias });
      toast.success('Categoria atualizada', {
        description: 'O status da categoria foi alterado.',
      });
    },
    onError: (error: DatabaseError) => {
      toast.error('Erro ao atualizar categoria', {
        description: getErrorMessage(error),
      });
    },
  });

  const editarCategoria = useMutation({
    mutationFn: async ({ tipo, value, novoLabel }: { tipo: TipoCategoria; value: string; novoLabel: string }) => {
      if (!userId) throw new Error('Usuário não autenticado');
      const config = await getSharedRecord(tipo);
      if (!config) throw new Error('Configuração de categorias não encontrada');

      const categorias = (config.categorias as unknown as Categoria[]) || [];
      const updated = categorias.map(c =>
        c.value === value ? { ...c, label: novoLabel } : c
      );

      const { error } = await supabase
        .from('configuracoes_categorias')
        .update({ categorias: toJson(updated) })
        .eq('id', config.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.configuracoes.categorias });
      toast.success('Categoria editada', {
        description: 'O nome da categoria foi atualizado.',
      });
    },
    onError: (error: DatabaseError) => {
      toast.error('Erro ao editar categoria', {
        description: getErrorMessage(error),
      });
    },
  });

  const excluirCategoria = useMutation({
    mutationFn: async ({ tipo, value }: { tipo: TipoCategoria; value: string }) => {
      if (!userId) throw new Error('Usuário não autenticado');
      const config = await getSharedRecord(tipo);
      if (!config) throw new Error('Configuração de categorias não encontrada');

      const categorias = (config.categorias as unknown as Categoria[]) || [];
      if (!categorias.find(c => c.value === value)) {
        throw new Error('Categoria não encontrada');
      }
      const updated = categorias.filter(c => c.value !== value);

      const { error } = await supabase
        .from('configuracoes_categorias')
        .update({ categorias: toJson(updated) })
        .eq('id', config.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.configuracoes.categorias });
      toast.success('Categoria excluída', {
        description: 'A categoria foi removida com sucesso.',
      });
    },
    onError: (error: DatabaseError) => {
      toast.error('Erro ao excluir categoria', {
        description: getErrorMessage(error),
      });
    },
  });

  return {
    atualizarCategorias,
    adicionarCategoria,
    toggleCategoria,
    editarCategoria,
    excluirCategoria,
  };
}
