import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { GlobalErrorBoundary } from "@/components/shared/GlobalErrorBoundary";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { ClientesProvider } from "@/contexts/ClientesContext";
import { EstoqueProvider } from "@/contexts/EstoqueContext";
import { TransportadorasProvider } from "@/contexts/TransportadorasContext";
import { ContratosProvider } from "@/contexts/ContratosContext";
import { ConfiguracoesProvider } from "@/contexts/ConfiguracoesContext";
import { CadastrosPublicosProvider } from "@/contexts/CadastrosPublicosContext";
import { EventosProvider } from "@/contexts/EventosContext";
import { DemandasProvider } from "@/contexts/DemandasContext";
import { CategoriasProvider } from "@/contexts/CategoriasContext";
import { EquipeProvider } from "@/contexts/EquipeContext";
import { MainLayout } from "@/components/layout/MainLayout";

// Lazy loading de páginas para code splitting
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Eventos = lazy(() => import("./pages/Eventos"));
const EventoDetalhes = lazy(() => import("./pages/EventoDetalhes"));
const Clientes = lazy(() => import("./pages/Clientes"));
const Estoque = lazy(() => import("./pages/Estoque"));
const Demandas = lazy(() => import("./pages/Demandas"));
const Transportadoras = lazy(() => import("./pages/Transportadoras"));
const Financeiro = lazy(() => import("./pages/Financeiro"));
const Contratos = lazy(() => import("./pages/Contratos"));
const Relatorios = lazy(() => import("./pages/Relatorios"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const Equipe = lazy(() => import("./pages/Equipe"));
const CadastrosPendentes = lazy(() => import("./pages/CadastrosPendentes"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CadastroEvento = lazy(() => import("./pages/public/CadastroEvento"));
const AcompanharCadastro = lazy(() => import("./pages/public/AcompanharCadastro"));

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

// Componente de loading para Suspense
function PageLoader() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 lg:py-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

function ProtectedRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="eventos" element={<Eventos />} />
        <Route path="eventos/:id" element={<EventoDetalhes />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="demandas" element={<Demandas />} />
        <Route path="estoque" element={<Estoque />} />
        <Route path="contratos" element={<Contratos />} />
        <Route path="transportadoras" element={<Transportadoras />} />
        <Route path="financeiro" element={<Financeiro />} />
        <Route path="relatorios" element={<Relatorios />} />
        <Route path="configuracoes" element={<Configuracoes />} />
        <Route path="equipe" element={<Equipe />} />
        <Route path="cadastros-pendentes" element={<CadastrosPendentes />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function AuthRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Auth />
    </Suspense>
  );
}

// App com todas as otimizações
const App = () => (
  <GlobalErrorBoundary>
    <ErrorBoundary>
      <PersistQueryClientProvider 
        client={queryClient} 
        persistOptions={{ persister }}
      >
        <BrowserRouter>
          <AuthProvider>
            <ErrorBoundary>
              <CategoriasProvider>
                <ErrorBoundary>
                  <EquipeProvider>
                    <ErrorBoundary>
                      <EventosProvider>
                        <ErrorBoundary>
                          <DemandasProvider>
                            <ErrorBoundary>
                              <ClientesProvider>
                                <ErrorBoundary>
                                  <EstoqueProvider>
                                    <ErrorBoundary>
                                      <ConfiguracoesProvider>
                                        <ErrorBoundary>
                                          <CadastrosPublicosProvider>
                                            <ErrorBoundary>
                                              <TransportadorasProvider>
                                                <ErrorBoundary>
                                                  <ContratosProvider>
                                                    <TooltipProvider>
                                                      <Toaster />
                                                      <Sonner />
                                                      <Suspense fallback={<PageLoader />}>
                                                        <Routes>
                                                          <Route path="/auth" element={<AuthRoutes />} />
                                                          <Route path="/cadastro-evento" element={<CadastroEvento />} />
                                                          <Route path="/cadastro-evento/:protocolo" element={<AcompanharCadastro />} />
                                                          <Route path="/*" element={<ProtectedRoutes />} />
                                                        </Routes>
                                                      </Suspense>
                                                    </TooltipProvider>
                                                  </ContratosProvider>
                                                </ErrorBoundary>
                                              </TransportadorasProvider>
                                            </ErrorBoundary>
                                          </CadastrosPublicosProvider>
                                        </ErrorBoundary>
                                      </ConfiguracoesProvider>
                                    </ErrorBoundary>
                                  </EstoqueProvider>
                                </ErrorBoundary>
                              </ClientesProvider>
                            </ErrorBoundary>
                          </DemandasProvider>
                        </ErrorBoundary>
                      </EventosProvider>
                    </ErrorBoundary>
                  </EquipeProvider>
                </ErrorBoundary>
              </CategoriasProvider>
            </ErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </PersistQueryClientProvider>
    </ErrorBoundary>
  </GlobalErrorBoundary>
);

export default App;
