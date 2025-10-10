import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TransportadorasProvider } from "@/contexts/TransportadorasContext";
import { ContratosProvider } from "@/contexts/ContratosContext";
import { ConfiguracoesProvider } from "@/contexts/ConfiguracoesContext";
import { CadastrosPublicosProvider } from "@/contexts/CadastrosPublicosContext";
import { MainLayout } from "@/components/layout/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Eventos from "./pages/Eventos";
import Clientes from "./pages/Clientes";
import Estoque from "./pages/Estoque";
import Placeholder from "./pages/Placeholder";
import Demandas from "./pages/Demandas";
import Transportadoras from "./pages/Transportadoras";
import Financeiro from "./pages/Financeiro";
import Contratos from "./pages/Contratos";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import CadastrosPendentes from "./pages/CadastrosPendentes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ConfiguracoesProvider>
        <CadastrosPublicosProvider>
          <TransportadorasProvider>
            <ContratosProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route element={<MainLayout />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/eventos" element={<Eventos />} />
                      <Route path="/clientes" element={<Clientes />} />
                      <Route path="/estoque" element={<Estoque />} />
                      <Route path="/demandas" element={<Demandas />} />
                      <Route path="/transportadoras" element={<Transportadoras />} />
                      <Route path="/financeiro" element={<Financeiro />} />
                      <Route path="/contratos" element={<Contratos />} />
                      <Route path="/relatorios" element={<Relatorios />} />
                      <Route path="/configuracoes" element={<Configuracoes />} />
                      <Route path="/cadastros-pendentes" element={<CadastrosPendentes />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </ContratosProvider>
          </TransportadorasProvider>
        </CadastrosPublicosProvider>
      </ConfiguracoesProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
