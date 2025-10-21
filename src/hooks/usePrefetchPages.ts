import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { transformEvento } from '@/contexts/eventos/transformEvento';
import { transformDemanda } from '@/contexts/demandas/transformDemanda';

/**
 * Hook para prefetch inteligente de dados baseado na rota atual
 * Carrega dados das páginas relacionadas antes do usuário navegar
 */
export function usePrefetchPages() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigation = useNavigation();

  useEffect(() => {
    // Não fazer prefetch durante navegação
    if (navigation.state === 'loading') {
      return;
    }
    // Funções de fetch para cada tipo de recurso com tratamento de erros
    const fetchFunctions = {
      eventos: async () => {
        try {
          const { data, error, count } = await supabase
            .from('eventos')
            .select(`
              id,
              nome,
              status,
              data_inicio,
              data_fim,
              hora_inicio,
              hora_fim,
              local,
              endereco,
              cidade,
              estado,
              tipo_evento,
              tags,
              cliente_id,
              comercial_id,
              cliente:clientes(id, nome, email, tipo, documento, telefone, whatsapp, endereco),
              comercial:profiles!eventos_comercial_id_fkey(id, nome, email)
            `, { count: 'exact' })
            .order('data_inicio', { ascending: false })
            .range(0, 49);
          
          if (error) throw error;
          
          return {
            eventos: (data || []).map(transformEvento),
            totalCount: count || 0
          };
        } catch (error) {
          console.error('Erro ao fazer prefetch de eventos:', error);
          return { eventos: [], totalCount: 0 };
        }
      },
      
      clientes: async () => {
        try {
          const { data, error, count } = await supabase
            .from('clientes')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(0, 19);
          
          if (error) throw error;
          return { 
            clientes: data || [], 
            totalCount: count || 0 
          };
        } catch (error) {
          console.error('Erro ao fazer prefetch de clientes:', error);
          return { clientes: [], totalCount: 0 };
        }
      },
      
      demandas: async () => {
        try {
          const { data, error, count } = await supabase
            .from('demandas')
            .select(`
              *,
              comentarios:demandas_comentarios(*),
              anexos:demandas_anexos(*)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(0, 19);
          
          if (error) throw error;
          return {
            demandas: (data || []).map(transformDemanda),
            totalCount: count || 0
          };
        } catch (error) {
          console.error('Erro ao fazer prefetch de demandas:', error);
          return { demandas: [], totalCount: 0 };
        }
      },
      
      estoque: async () => {
        try {
          const { data, error, count } = await supabase
            .from('materiais_estoque')
            .select('*', { count: 'exact' })
            .order('nome')
            .range(0, 49);
          
          if (error) throw error;
          return {
            materiais: data || [],
            totalCount: count || 0
          };
        } catch (error) {
          console.error('Erro ao fazer prefetch de estoque:', error);
          return { materiais: [], totalCount: 0 };
        }
      },
      
      equipe: async () => {
        try {
          const { data, error, count } = await supabase
            .from('equipe_operacional')
            .select('*', { count: 'exact' })
            .order('nome', { ascending: true })
            .range(0, 49);
          
          if (error) throw error;
          return {
            operacionais: data || [],
            totalCount: count || 0
          };
        } catch (error) {
          console.error('Erro ao fazer prefetch de equipe:', error);
          return { operacionais: [], totalCount: 0 };
        }
      }
    };

    // Mapa de prefetch: define quais dados carregar para cada rota
    const prefetchMap: Record<string, Array<keyof typeof fetchFunctions>> = {
      '/dashboard': ['eventos', 'clientes'],
      '/eventos': ['clientes', 'demandas', 'estoque', 'equipe'],
      '/clientes': ['eventos'],
      '/demandas': ['eventos', 'equipe'],
      '/estoque': ['eventos'],
      '/equipe': ['eventos'],
      '/contratos': ['clientes', 'eventos'],
      '/transportadoras': ['eventos'],
    };

    const currentPath = location.pathname.split('/')[1] ? `/${location.pathname.split('/')[1]}` : '/dashboard';
    const resourcesToPrefetch = prefetchMap[currentPath] || [];

    // Prefetch com delay para não impactar a navegação atual
    const timeoutId = setTimeout(() => {
      resourcesToPrefetch.forEach(resource => {
        if (resource === 'eventos') {
          queryClient.prefetchQuery({
            queryKey: ['eventos', 1, 50],
            queryFn: fetchFunctions.eventos,
            staleTime: 1000 * 60 * 10,
          });
        } else if (resource === 'clientes') {
          queryClient.prefetchQuery({
            queryKey: ['clientes', 1, 20],
            queryFn: fetchFunctions.clientes,
            staleTime: 1000 * 60 * 10,
          });
        } else if (resource === 'demandas') {
          queryClient.prefetchQuery({
            queryKey: ['demandas', 1, 20],
            queryFn: fetchFunctions.demandas,
            staleTime: 1000 * 60 * 10,
          });
        } else if (resource === 'estoque') {
          queryClient.prefetchQuery({
            queryKey: ['materiais_estoque', 1, 50, undefined],
            queryFn: fetchFunctions.estoque,
            staleTime: 1000 * 60 * 5,
          });
        } else if (resource === 'equipe') {
          queryClient.prefetchQuery({
            queryKey: ['equipe-operacional', 1, 50, undefined],
            queryFn: fetchFunctions.equipe,
            staleTime: 1000 * 60 * 30,
          });
        }
      });
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [location.pathname, queryClient, navigation.state]);
}
