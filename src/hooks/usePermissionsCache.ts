import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Permission {
  id: string;
  modulo: string;
  acao: string;
  descricao: string;
  categoria: string;
}

/**
 * Hook para cache global de permissões do sistema
 * Evita múltiplas queries desnecessárias
 */
export function usePermissionsCache() {
  return useQuery({
    queryKey: ['permissions-cache'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('categoria', { ascending: true })
        .order('descricao', { ascending: true });

      if (error) throw error;
      return data as Permission[];
    },
    staleTime: 1000 * 60 * 10, // Cache por 10 minutos
  });
}
