import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GlobalErrorBoundary } from "@/components/shared/GlobalErrorBoundary";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { MainLayout } from "@/components/layout/MainLayout";
import { AppProviders } from "@/providers/AppProviders";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { NavigationLoadingBar } from "@/components/shared/NavigationLoadingBar";

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
const TestesValidacao = lazy(() => import("./pages/TestesValidacao"));
const Performance = lazy(() => import("./pages/Performance"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CadastroEvento = lazy(() => import("./pages/public/CadastroEvento"));
const AcompanharCadastro = lazy(() => import("./pages/public/AcompanharCadastro"));

// Componente de loading para Suspense com fallback de erro
function PageLoader({ error }: { error?: Error }) {
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-2xl font-bold">Erro ao carregar página</h2>
          <p className="text-muted-foreground">
            Houve um problema ao carregar os recursos da página. 
            Tente recarregar ou limpar o cache do navegador.
          </p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Recarregar Página
            </button>
            <button 
              onClick={() => {
                if ('caches' in window) {
                  caches.keys().then(keys => {
                    keys.forEach(key => caches.delete(key));
                  }).then(() => window.location.reload());
                }
              }}
              className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
            >
              Limpar Cache
            </button>
          </div>
          {error.message && (
            <details className="text-xs text-left p-3 bg-muted rounded-md">
              <summary className="cursor-pointer font-medium mb-2">Detalhes técnicos</summary>
              <code className="text-destructive">{error.message}</code>
            </details>
          )}
        </div>
      </div>
    );
  }

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
        <Route path="testes-validacao" element={<TestesValidacao />} />
        <Route path="performance" element={<Performance />} />
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

// App simplificado com estrutura limpa
const App = () => (
  <GlobalErrorBoundary>
    <AppProviders>
      <NavigationLoadingBar />
      <InstallPrompt />
      <Toaster />
      <Sonner />
      <GlobalErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/auth" element={<AuthRoutes />} />
            <Route path="/cadastro-evento" element={<CadastroEvento />} />
            <Route path="/cadastro-evento/:protocolo" element={<AcompanharCadastro />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </Suspense>
      </GlobalErrorBoundary>
    </AppProviders>
  </GlobalErrorBoundary>
);

export default App;
