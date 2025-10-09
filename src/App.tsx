import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Eventos from "./pages/Eventos";
import Clientes from "./pages/Clientes";
import Estoque from "./pages/Estoque";
import Placeholder from "./pages/Placeholder";
import Demandas from "./pages/Demandas";
import NotFound from "./pages/NotFound";
import { Package, Truck, DollarSign, FileText, BarChart3, Settings } from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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
              <Route path="/transportadoras" element={<Placeholder icon={Truck} title="Transportadoras" description="Cadastro de transportadoras" />} />
              <Route path="/financeiro" element={<Placeholder icon={DollarSign} title="Financeiro" description="Gestão financeira completa" />} />
              <Route path="/contratos" element={<Placeholder icon={FileText} title="Contratos" description="Modelos e documentos" />} />
              <Route path="/relatorios" element={<Placeholder icon={BarChart3} title="Relatórios" description="Análises e relatórios" />} />
              <Route path="/configuracoes" element={<Placeholder icon={Settings} title="Configurações" description="Configurações do sistema" />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
