import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';

/**
 * Hook para prefetch inteligente de dados baseado na rota atual
 * Carrega dados das páginas relacionadas antes do usuário navegar
 */
export function usePrefetchPages() {
  const queryClient = useQueryClient();
  const location = useLocation();

  useEffect(() => {
    // Mapa de prefetch: define quais dados carregar para cada rota
    const prefetchMap: Record<string, string[]> = {
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
    const pagesToPrefetch = prefetchMap[currentPath] || [];

    // Prefetch com delay para não impactar a navegação atual
    const timeoutId = setTimeout(() => {
      pagesToPrefetch.forEach(page => {
        // Prefetch da primeira página de cada recurso
        queryClient.prefetchQuery({
          queryKey: [page, 1, 50, {}],
          staleTime: 1000 * 60 * 5, // 5 minutos
        });
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [location.pathname, queryClient]);
}
