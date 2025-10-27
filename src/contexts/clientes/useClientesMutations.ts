import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Cliente } from '@/types/eventos';
import { toast } from 'sonner';

export function useClientesMutations() {
  const queryClient = useQueryClient();

  const criarCliente = useMutation({
    mutationFn: async (novoCliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('clientes')
        .insert([{
          ...novoCliente,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar cliente:', error);
      toast.error('Erro ao criar cliente');
    },
  });

  const editarCliente = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Cliente> }) => {
      const { error } = await supabase
        .from('clientes')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
      return { id, data };
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['clientes'] });
      
      const previousClientes = queryClient.getQueryData(['clientes']);
      
      queryClient.setQueriesData({ queryKey: ['clientes'] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          clientes: old.clientes.map((c: Cliente) => 
            c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c
          )
        };
      });
      
      return { previousClientes };
    },
    onError: (err, variables, context) => {
      if (context?.previousClientes) {
        queryClient.setQueryData(['clientes'], context.previousClientes);
      }
      console.error('Erro ao editar cliente:', err);
      toast.error('Erro ao editar cliente');
    },
    onSuccess: () => {
      toast.success('Cliente atualizado com sucesso!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    }
  });

  const excluirCliente = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['clientes'] });
      
      const previousClientes = queryClient.getQueryData(['clientes']);
      
      queryClient.setQueriesData({ queryKey: ['clientes'] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          clientes: old.clientes.filter((c: Cliente) => c.id !== id),
          totalCount: old.totalCount - 1
        };
      });
      
      return { previousClientes };
    },
    onError: (err, variables, context) => {
      if (context?.previousClientes) {
        queryClient.setQueryData(['clientes'], context.previousClientes);
      }
      console.error('Erro ao excluir cliente:', err);
      toast.error('Erro ao excluir cliente');
    },
    onSuccess: () => {
      toast.success('Cliente excluído com sucesso!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    }
  });

  return {
    criarCliente,
    editarCliente,
    excluirCliente
  };
}
