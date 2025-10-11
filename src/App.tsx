import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ClientesProvider } from "@/contexts/ClientesContext";
import { EstoqueProvider } from "@/contexts/EstoqueContext";
import { TransportadorasProvider } from "@/contexts/TransportadorasContext";
import { ContratosProvider } from "@/contexts/ContratosContext";
import { ConfiguracoesProvider } from "@/contexts/ConfiguracoesContext";
import { CadastrosPublicosProvider } from "@/contexts/CadastrosPublicosContext";
import { EventosProvider } from "@/contexts/EventosContext";
import { DemandasProvider } from "@/contexts/DemandasContext";
import { CategoriasProvider } from "@/contexts/CategoriasContext";
import { MainLayout } from "@/components/layout/MainLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Eventos from "./pages/Eventos";
import Clientes from "./pages/Clientes";
import Estoque from "./pages/Estoque";
import Demandas from "./pages/Demandas";
import Transportadoras from "./pages/Transportadoras";
import Financeiro from "./pages/Financeiro";
import Contratos from "./pages/Contratos";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import CadastrosPendentes from "./pages/CadastrosPendentes";
import NotFound from "./pages/NotFound";
import CadastroEvento from "./pages/public/CadastroEvento";
import AcompanharCadastro from "./pages/public/AcompanharCadastro";

const queryClient = new QueryClient();

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
        <Route path="clientes" element={<Clientes />} />
        <Route path="demandas" element={<Demandas />} />
        <Route path="estoque" element={<Estoque />} />
        <Route path="contratos" element={<Contratos />} />
        <Route path="transportadoras" element={<Transportadoras />} />
        <Route path="financeiro" element={<Financeiro />} />
        <Route path="relatorios" element={<Relatorios />} />
        <Route path="configuracoes" element={<Configuracoes />} />
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

  return <Auth />;
}

// Provider hierarchy fixed - QueryClient must be at the top level
const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <CategoriasProvider>
          <EventosProvider>
            <DemandasProvider>
              <ClientesProvider>
                <EstoqueProvider>
                  <ConfiguracoesProvider>
                    <CadastrosPublicosProvider>
                      <TransportadorasProvider>
                        <ContratosProvider>
                          <TooltipProvider>
                          <Toaster />
                          <Sonner />
                          <Routes>
                            <Route path="/auth" element={<AuthRoutes />} />
                            <Route path="/cadastro-evento" element={<CadastroEvento />} />
                            <Route path="/cadastro-evento/:protocolo" element={<AcompanharCadastro />} />
                            <Route path="/*" element={<ProtectedRoutes />} />
                          </Routes>
                          </TooltipProvider>
                        </ContratosProvider>
                      </TransportadorasProvider>
                    </CadastrosPublicosProvider>
                  </ConfiguracoesProvider>
                </EstoqueProvider>
              </ClientesProvider>
            </DemandasProvider>
          </EventosProvider>
        </CategoriasProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
