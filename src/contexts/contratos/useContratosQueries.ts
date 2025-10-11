import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformContrato, transformTemplate } from './transformContrato';

export function useContratosQueries() {
  const { data: templates, isLoading: loadingTemplates } = useQuery({
    queryKey: ['contratos-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contratos_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(transformTemplate);
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: contratos, isLoading: loadingContratos, refetch } = useQuery({
    queryKey: ['contratos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contratos')
        .select(`
          *,
          cliente:clientes(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(transformContrato);
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    templates: templates || [],
    contratos: contratos || [],
    loading: loadingTemplates || loadingContratos,
    refetch,
  };
}
