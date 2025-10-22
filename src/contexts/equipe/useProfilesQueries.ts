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

export function useProfilesQueries() {
  return useQuery({
    queryKey: ['profiles-equipe'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_permissions (
            permission_id
          )
        `)
        .order('nome', { ascending: true });

      if (error) throw error;

      // Transformar para incluir permissões
      return (data || []).map(profile => ({
        ...profile,
        permissions: profile.user_permissions?.map((up: any) => up.permission_id) || [],
        funcao_principal: 'Usuário do Sistema', // Placeholder
      })) as ProfileMembro[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
