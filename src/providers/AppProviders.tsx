import { ReactNode } from "react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CategoriasProvider } from "@/contexts/CategoriasContext";

/**
 * QueryClient com configurações otimizadas de cache.
 * 
 * Estratégia de cache:
 * - staleTime: Tempo que os dados são considerados "frescos" (não refetch automático)
 * - gcTime: Tempo que dados inativos permanecem em cache antes de serem limpos
 * - refetchOnWindowFocus: Desabilitado para evitar refetches desnecessários
 * - retry: 1 tentativa de retry em caso de erro
 */
const queryClient = new QueryClient({
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
          <CategoriasProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </CategoriasProvider>
        </AuthProvider>
      </BrowserRouter>
    </PersistQueryClientProvider>
  );
}
