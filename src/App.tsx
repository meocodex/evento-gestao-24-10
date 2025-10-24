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
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/auth" element={<AuthRoutes />} />
          <Route path="/cadastro-evento" element={<CadastroEvento />} />
          <Route path="/cadastro-evento/:protocolo" element={<AcompanharCadastro />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </Suspense>
    </AppProviders>
  </GlobalErrorBoundary>
);

export default App;
