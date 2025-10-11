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
      categorias.push(categoria);

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

  return {
    atualizarCategorias,
    adicionarCategoria,
    toggleCategoria,
  };
}
