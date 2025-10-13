import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  avatar_url?: string;
  telefone?: string;
  role: 'admin' | 'comercial' | 'suporte';
  created_at: string;
}

export function useUsuarios() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: usuarios, isLoading, error } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('nome');

      if (profilesError) throw profilesError;

      // Buscar roles de cada usuário
      const usuariosComRoles = await Promise.all(
        profiles.map(async (profile) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id)
            .single();

          return {
            ...profile,
            role: roleData?.role || 'comercial',
          };
        })
      );

      return usuariosComRoles as Usuario[];
    },
  });

  const alterarFuncao = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: 'admin' | 'comercial' | 'suporte' }) => {
      // Verificar se não é o último admin
      if (newRole !== 'admin') {
        const { data: adminCount } = await supabase
          .from('user_roles')
          .select('user_id', { count: 'exact' })
          .eq('role', 'admin');

        if ((adminCount?.length || 0) <= 1) {
          const { data: currentRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .single();

          if (currentRole?.role === 'admin') {
            throw new Error('Não é possível remover o último administrador do sistema');
          }
        }
      }

      // Atualizar role
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast({
        title: 'Função alterada',
        description: 'A função do usuário foi atualizada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao alterar função',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const convidarUsuario = useMutation({
    mutationFn: async (data: { email: string; nome: string; role: 'admin' | 'comercial' | 'suporte' }) => {
      // Criar usuário via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        email_confirm: true,
        user_metadata: {
          nome: data.nome,
        },
      });

      if (authError) throw authError;

      // A role será criada automaticamente pelo trigger handle_new_user
      // Mas vamos atualizar para a role desejada se não for comercial
      if (data.role !== 'comercial' && authData.user) {
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', authData.user.id);

        await supabase
          .from('user_roles')
          .insert({ user_id: authData.user.id, role: data.role });
      }

      return authData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast({
        title: 'Usuário convidado',
        description: 'O convite foi enviado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao convidar usuário',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    usuarios,
    isLoading,
    error,
    alterarFuncao,
    convidarUsuario,
  };
}
