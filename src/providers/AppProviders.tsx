import { ReactNode } from "react";
import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { performanceMonitor } from "@/lib/performance";

/**
 * QueryClient com configurações otimizadas de cache e performance monitoring.
 * 
 * Estratégia de cache:
 * - staleTime: Tempo que os dados são considerados "frescos" (não refetch automático)
 * - gcTime: Tempo que dados inativos permanecem em cache antes de serem limpos
 * - refetchOnWindowFocus: Desabilitado para evitar refetches desnecessários
 * - retry: 1 tentativa de retry em caso de erro
 * 
 * Performance Monitoring:
 * - Trackeia duração de todas as queries
 * - Monitora taxa de sucesso/erro
 * - Identifica queries lentas automaticamente
 */
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onSuccess: (data, query) => {
      const duration = query.state.dataUpdatedAt - query.state.dataUpdatedAt;
      performanceMonitor.trackQuery(query.queryKey, duration || 0, true);
    },
    onError: (error, query) => {
      performanceMonitor.trackQuery(
        query.queryKey,
        0,
        false,
        error instanceof Error ? error.message : String(error)
      );
    },
  }),
  mutationCache: new MutationCache({
    onSuccess: (data, variables, context, mutation) => {
      performanceMonitor.trackQuery(
        ['mutation', ...(mutation.options.mutationKey || [])],
        0,
        true
      );
    },
    onError: (error, variables, context, mutation) => {
      performanceMonitor.trackQuery(
        ['mutation', ...(mutation.options.mutationKey || [])],
        0,
        false,
        error instanceof Error ? error.message : String(error)
      );
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos (padrão para dados moderadamente voláteis)
      gcTime: 1000 * 60 * 30, // 30 minutos (mantém cache por tempo razoável)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

// Persister para cache local
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'gercao-cache',
});

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Consolidação de todos os providers da aplicação.
 * Centraliza a configuração de React Query, autenticação, e contextos essenciais.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <PersistQueryClientProvider 
      client={queryClient} 
      persistOptions={{ persister }}
    >
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </PersistQueryClientProvider>
  );
}
