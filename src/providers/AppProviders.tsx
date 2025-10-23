import { ReactNode } from "react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CategoriasProvider } from "@/contexts/CategoriasContext";
import { ConfiguracoesProvider } from "@/contexts/ConfiguracoesContext";
import { CadastrosPublicosProvider } from "@/contexts/CadastrosPublicosContext";
import { ContratosProvider } from "@/contexts/ContratosContext";

// QueryClient com cache otimizado
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30, // 30 minutos
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
            <ConfiguracoesProvider>
              <CadastrosPublicosProvider>
                <ContratosProvider>
                  <TooltipProvider>
                    {children}
                  </TooltipProvider>
                </ContratosProvider>
              </CadastrosPublicosProvider>
            </ConfiguracoesProvider>
          </CategoriasProvider>
        </AuthProvider>
      </BrowserRouter>
    </PersistQueryClientProvider>
  );
}
