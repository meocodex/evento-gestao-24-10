import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  return useQuery({
    queryKey: ['profiles-equipe'],
    enabled,
    queryFn: async () => {
      console.log('🔍 Buscando profiles...');
      
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
        console.warn('⚠️ Erro ao buscar roles:', rolesError);
      }

      // Buscar permissões separadamente
      const { data: permsData, error: permsError } = await supabase
        .from('user_permissions')
        .select('user_id, permission_id');

      if (permsError) {
        console.warn('⚠️ Erro ao buscar permissões:', permsError);
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

      console.log('✅ Profiles carregados:', profilesData?.length || 0);
      console.log('✅ Roles carregados:', rolesData?.length || 0);
      console.log('✅ Permissões carregadas:', permsData?.length || 0);

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
