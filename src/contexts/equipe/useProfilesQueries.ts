import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface ProfileMembro {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  cpf: string | null;
  avatar_url: string | null;
  tipo: string;
  created_at: string;
  updated_at: string;
  // Campos para compatibilidade com interface unificada
  funcao_principal?: string;
  permissions?: string[];
  roles?: string[]; // Múltiplas roles
  role?: 'admin' | 'comercial' | 'suporte'; // Primeira role (compatibilidade)
}

export function useProfilesQueries(enabled = true) {
  const queryClient = useQueryClient();

  // Real-time listeners
  useEffect(() => {
    const channel = supabase
      .channel('profiles-equipe-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => queryClient.invalidateQueries({ queryKey: ['profiles-equipe'] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_roles' },
        () => queryClient.invalidateQueries({ queryKey: ['profiles-equipe'] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_permissions' },
        () => queryClient.invalidateQueries({ queryKey: ['profiles-equipe'] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['profiles-equipe'],
    enabled,
    queryFn: async () => {
      // Buscar profiles sem joins aninhados
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('nome', { ascending: true });

      if (profilesError) throw profilesError;

      // Buscar roles separadamente
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        // Silently handle - roles are optional
      }

      // Buscar permissões separadamente
      const { data: permsData, error: permsError } = await supabase
        .from('user_permissions')
        .select('user_id, permission_id');

      if (permsError) {
        // Silently handle - permissions are optional
      }

      // Mapear múltiplas roles por usuário
      const rolesByUser = (rolesData || []).reduce((acc, r) => {
        if (!acc[r.user_id]) acc[r.user_id] = [];
        acc[r.user_id].push(r.role);
        return acc;
      }, {} as Record<string, string[]>);

      // Mapear permissões por usuário
      const permsByUser = (permsData || []).reduce((acc, perm) => {
        if (!acc[perm.user_id]) acc[perm.user_id] = [];
        acc[perm.user_id].push(perm.permission_id);
        return acc;
      }, {} as Record<string, string[]>);

      // Transformar para incluir permissões e múltiplas roles
      return (profilesData || []).map(profile => ({
        ...profile,
        roles: rolesByUser[profile.id] || [],
        role: (rolesByUser[profile.id]?.[0]) || undefined, // ⭐ SEM FALLBACK
        permissions: permsByUser[profile.id] || [],
        funcao_principal: 'Usuário do Sistema',
      })) as ProfileMembro[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
