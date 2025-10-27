import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cpf?: string;
  avatar_url?: string;
  telefone?: string;
  tipo?: 'sistema' | 'operacional' | 'ambos';
  role?: 'admin' | 'comercial' | 'suporte';
  permissions?: string[];
  created_at: string;
}

export function useUsuarios() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: usuarios, isLoading, error } = useQuery({
    queryKey: ['usuarios'],
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000,
    queryFn: async () => {
      // 1. Buscar profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('nome');

      if (profilesError) throw profilesError;
      if (!profiles || profiles.length === 0) return [];

      const userIds = profiles.map(p => p.id);

      // 2. Buscar roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      // 3. Buscar permissions
      const { data: permissions } = await supabase
        .from('user_permissions')
        .select('user_id, permission_id')
        .in('user_id', userIds);

      console.log('📊 useUsuarios debug:', {
        profilesCount: profiles?.length,
        rolesCount: roles?.length,
        permissionsCount: permissions?.length,
        userIds: userIds.slice(0, 3)
      });

      // 4. Combinar dados
      return profiles.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        const userPerms = permissions?.filter(p => p.user_id === profile.id) || [];
        
        return {
          ...profile,
          role: userRole?.role || 'comercial',
          permissions: userPerms.map(p => p.permission_id)
        } as Usuario;
      });
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

  const criarOperador = useMutation({
    mutationFn: async (data: { 
      nome: string; 
      email: string; 
      cpf?: string;
      telefone?: string;
      senha: string;
      tipo?: 'sistema' | 'operacional' | 'ambos';
      permissions: string[];
    }) => {
      // Chamar Edge Function para criar usuário de forma segura
      const { data: result, error } = await supabase.functions.invoke('criar-operador', {
        body: data,
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);

      return result.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast({
        title: 'Operador criado com sucesso',
        description: 'O operador já pode acessar o sistema.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar operador',
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
    criarOperador,
  };
}
