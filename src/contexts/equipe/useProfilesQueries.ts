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
}

export function useProfilesQueries(enabled = true) {
  return useQuery({
    queryKey: ['profiles-equipe'],
    enabled,
    queryFn: async () => {
      console.log('🔍 Buscando profiles...');
      
      // Buscar profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('nome', { ascending: true });

      if (profilesError) throw profilesError;

      // Buscar permissões separadamente
      const { data: permsData, error: permsError } = await supabase
        .from('user_permissions')
        .select('user_id, permission_id');

      if (permsError) {
        console.warn('⚠️ Erro ao buscar permissões:', permsError);
      }

      // Mapear permissões por usuário
      const permsByUser = (permsData || []).reduce((acc, perm) => {
        if (!acc[perm.user_id]) acc[perm.user_id] = [];
        acc[perm.user_id].push(perm.permission_id);
        return acc;
      }, {} as Record<string, string[]>);

      // Transformar para incluir permissões
      return (profilesData || []).map(profile => ({
        ...profile,
        permissions: permsByUser[profile.id] || [],
        funcao_principal: 'Usuário do Sistema',
      })) as ProfileMembro[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
