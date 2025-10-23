import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { TipoCategoria, Categoria } from '@/types/categorias';

export function useCategoriasMutations() {
  const queryClient = useQueryClient();

  const atualizarCategorias = useMutation({
    mutationFn: async ({ tipo, categorias }: { tipo: TipoCategoria; categorias: Categoria[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('configuracoes_categorias')
        .upsert({
          user_id: user.id,
          tipo,
          categorias: categorias as any,
        }, {
          onConflict: 'user_id,tipo'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes_categorias'] });
      toast({
        title: 'Categorias atualizadas',
        description: 'As configurações foram salvas com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar categorias',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const adicionarCategoria = useMutation({
    mutationFn: async ({ tipo, categoria }: { tipo: TipoCategoria; categoria: Categoria }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: config } = await supabase
        .from('configuracoes_categorias')
        .select('categorias')
        .eq('user_id', user.id)
        .eq('tipo', tipo)
        .single();

      const categorias = (config?.categorias as unknown as Categoria[]) || [];
      
      // Validar se categoria já existe
      const categoriaExiste = categorias.find(c => c.value === categoria.value);
      if (categoriaExiste) {
        throw new Error(`Categoria "${categoria.label}" já existe`);
      }
      
      console.log(`[${tipo}] Categorias antes:`, categorias.length);
      console.log(`[${tipo}] Adicionando:`, categoria);
      categorias.push(categoria);
      console.log(`[${tipo}] Categorias depois:`, categorias.length);

      const { error } = await supabase
        .from('configuracoes_categorias')
        .upsert({
          user_id: user.id,
          tipo,
          categorias: categorias as any,
        }, {
          onConflict: 'user_id,tipo'
        });

      if (error) throw error;
      
      return { tipo, categoria };
    },
    onSuccess: (data) => {
      // Atualização otimista sem refetch completo
      queryClient.setQueryData(['configuracoes_categorias'], (old: any) => {
        if (!old) return old;
        return old.map((config: any) => {
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
      
      toast({
        title: 'Categoria adicionada',
        description: 'A nova categoria foi criada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao adicionar categoria',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const toggleCategoria = useMutation({
    mutationFn: async ({ tipo, value }: { tipo: TipoCategoria; value: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: config } = await supabase
        .from('configuracoes_categorias')
        .select('categorias')
        .eq('user_id', user.id)
        .eq('tipo', tipo)
        .single();

      const categorias = (config?.categorias as unknown as Categoria[]) || [];
      const updated = categorias.map(c =>
        c.value === value ? { ...c, ativa: !c.ativa } : c
      );

      const { error } = await supabase
        .from('configuracoes_categorias')
        .update({ categorias: updated as any })
        .eq('user_id', user.id)
        .eq('tipo', tipo);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes_categorias'] });
      toast({
        title: 'Categoria atualizada',
        description: 'O status da categoria foi alterado.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar categoria',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const editarCategoria = useMutation({
    mutationFn: async ({ tipo, value, novoLabel }: { tipo: TipoCategoria; value: string; novoLabel: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: config } = await supabase
        .from('configuracoes_categorias')
        .select('categorias')
        .eq('user_id', user.id)
        .eq('tipo', tipo)
        .single();

      const categorias = (config?.categorias as unknown as Categoria[]) || [];
      const updated = categorias.map(c =>
        c.value === value ? { ...c, label: novoLabel } : c
      );

      const { error } = await supabase
        .from('configuracoes_categorias')
        .update({ categorias: updated as any })
        .eq('user_id', user.id)
        .eq('tipo', tipo);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes_categorias'] });
      toast({
        title: 'Categoria editada',
        description: 'O nome da categoria foi atualizado.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao editar categoria',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const excluirCategoria = useMutation({
    mutationFn: async ({ tipo, value }: { tipo: TipoCategoria; value: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: config } = await supabase
        .from('configuracoes_categorias')
        .select('categorias')
        .eq('user_id', user.id)
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
        .update({ categorias: updated as any })
        .eq('user_id', user.id)
        .eq('tipo', tipo);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes_categorias'] });
      toast({
        title: 'Categoria excluída',
        description: 'A categoria foi removida com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir categoria',
        description: error.message,
        variant: 'destructive',
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
