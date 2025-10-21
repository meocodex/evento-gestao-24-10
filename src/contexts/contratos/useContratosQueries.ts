import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformContrato, transformTemplate } from './transformContrato';

export interface FiltrosContrato {
  searchTerm?: string;
  status?: string;
}

export interface FiltrosTemplate {
  searchTerm?: string;
}

export function useContratosQueries(
  pageContratos = 1,
  pageSizeContratos = 50,
  filtrosContratos?: FiltrosContrato,
  pageTemplates = 1,
  pageSizeTemplates = 50,
  filtrosTemplates?: FiltrosTemplate
) {
  const { data: templatesData, isLoading: loadingTemplates } = useQuery({
    queryKey: ['contratos-templates', pageTemplates, pageSizeTemplates, filtrosTemplates],
    queryFn: async () => {
      let query = supabase
        .from('contratos_templates')
        .select('*', { count: 'exact' });

      if (filtrosTemplates?.searchTerm) {
        query = query.or(`nome.ilike.%${filtrosTemplates.searchTerm}%,descricao.ilike.%${filtrosTemplates.searchTerm}%`);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((pageTemplates - 1) * pageSizeTemplates, pageTemplates * pageSizeTemplates - 1);
      
      if (error) throw error;
      return {
        templates: (data || []).map(transformTemplate),
        totalCount: count || 0,
      };
    },
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

  const { data: contratosData, isLoading: loadingContratos, refetch } = useQuery({
    queryKey: ['contratos', pageContratos, pageSizeContratos, filtrosContratos],
    queryFn: async () => {
      let query = supabase
        .from('contratos')
        .select(`
          *,
          cliente:clientes(*)
        `, { count: 'exact' });

      if (filtrosContratos?.searchTerm) {
        query = query.or(`titulo.ilike.%${filtrosContratos.searchTerm}%,numero.ilike.%${filtrosContratos.searchTerm}%`);
      }

      if (filtrosContratos?.status && filtrosContratos.status !== 'todos') {
        if (filtrosContratos.status === 'propostas') {
          query = query.in('status', ['proposta', 'em_negociacao', 'aprovada']);
        } else if (filtrosContratos.status === 'contratos') {
          query = query.in('status', ['rascunho', 'em_revisao', 'aguardando_assinatura', 'assinado']);
        } else {
          query = query.eq('status', filtrosContratos.status);
        }
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((pageContratos - 1) * pageSizeContratos, pageContratos * pageSizeContratos - 1);
      
      if (error) throw error;
      return {
        contratos: (data || []).map(transformContrato),
        totalCount: count || 0,
      };
    },
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

  return {
    templates: templatesData?.templates || [],
    totalTemplates: templatesData?.totalCount || 0,
    contratos: contratosData?.contratos || [],
    totalContratos: contratosData?.totalCount || 0,
    loading: loadingTemplates || loadingContratos,
    refetch,
  };
}
