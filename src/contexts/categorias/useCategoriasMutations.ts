import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TipoCategoria, Categoria } from '@/types/categorias';
import { DatabaseError, getErrorMessage, CategoriasConfigCache, toJson } from '@/types/utils';

export function useCategoriasMutations() {
  const queryClient = useQueryClient();

  const atualizarCategorias = useMutation({
    mutationFn: async ({ tipo, categorias }: { tipo: TipoCategoria; categorias: Categoria[] }) => {
      const { error } = await supabase
        .from('configuracoes_categorias')
        .upsert({
          tipo,
          categorias: toJson(categorias),
        }, {
          onConflict: 'tipo'
        });

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['configuracoes_categorias'] });
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
      const { data: config } = await supabase
        .from('configuracoes_categorias')
        .select('categorias')
        .eq('tipo', tipo)
        .maybeSingle();

      const categorias = (config?.categorias as unknown as Categoria[]) || [];
      
      // Validar se categoria já existe
      const categoriaExiste = categorias.find(c => c.value === categoria.value);
      if (categoriaExiste) {
        throw new Error(`Categoria "${categoria.label}" já existe`);
      }
      
      categorias.push(categoria);

      const { error } = await supabase
        .from('configuracoes_categorias')
        .upsert({
          tipo,
          categorias: toJson(categorias),
        }, {
          onConflict: 'tipo'
        });

      if (error) throw error;
      
      return { tipo, categoria };
    },
    onSuccess: async (data) => {
      // Atualização otimista imediata (para UX)
      queryClient.setQueryData<CategoriasConfigCache[]>(['configuracoes_categorias'], (old) => {
        if (!old) return old;
        return old.map((config) => {
          if (config.tipo === data.tipo) {
            const categorias = (config.categorias as Categoria[]) || [];
            return {
              ...config,
              categorias: [...categorias, data.categoria],
              updated_at: new Date().toISOString()
            };
          }
          return config;
        });
      });
      
      // Forçar refetch para garantir sincronização
      await queryClient.invalidateQueries({ queryKey: ['configuracoes_categorias'] });
      
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
      const { data: config } = await supabase
        .from('configuracoes_categorias')
        .select('categorias')
        .eq('tipo', tipo)
        .single();

      const categorias = (config?.categorias as unknown as Categoria[]) || [];
      const updated = categorias.map(c =>
        c.value === value ? { ...c, ativa: !c.ativa } : c
      );

      const { error } = await supabase
        .from('configuracoes_categorias')
        .update({ categorias: toJson(updated) })
        .eq('tipo', tipo);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['configuracoes_categorias'] });
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
      const { data: config } = await supabase
        .from('configuracoes_categorias')
        .select('categorias')
        .eq('tipo', tipo)
        .single();

      const categorias = (config?.categorias as unknown as Categoria[]) || [];
      const updated = categorias.map(c =>
        c.value === value ? { ...c, label: novoLabel } : c
      );

      const { error } = await supabase
        .from('configuracoes_categorias')
        .update({ categorias: toJson(updated) })
        .eq('tipo', tipo);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['configuracoes_categorias'] });
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
      const { data: config } = await supabase
        .from('configuracoes_categorias')
        .select('categorias')
        .eq('tipo', tipo)
        .single();

      const categorias = (config?.categorias as unknown as Categoria[]) || [];
      const categoriaExiste = categorias.find(c => c.value === value);
      
      if (!categoriaExiste) {
        throw new Error('Categoria não encontrada');
      }

      const updated = categorias.filter(c => c.value !== value);

      const { error } = await supabase
        .from('configuracoes_categorias')
        .update({ categorias: toJson(updated) })
        .eq('tipo', tipo);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['configuracoes_categorias'] });
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
