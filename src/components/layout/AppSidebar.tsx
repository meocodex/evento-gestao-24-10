import { Link, useLocation } from 'react-router-dom';
import {
  Calendar,
  Users,
  Package,
  Bell,
  Truck,
  DollarSign,
  FileText,
  BarChart3,
  Settings,
  Home,
  LogOut,
  UserCog,
  Activity,
  ClipboardList,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Eventos', url: '/eventos', icon: Calendar },
  { title: 'Clientes', url: '/clientes', icon: Users },
  { title: 'Demandas', url: '/demandas', icon: ClipboardList },
  { title: 'Equipe', url: '/equipe', icon: UserCog },
  { title: 'Contratos', url: '/contratos', icon: FileText },
  { title: 'Estoque', url: '/estoque', icon: Package },
  { title: 'Transportadoras', url: '/transportadoras', icon: Truck },
  { title: 'Financeiro', url: '/financeiro', icon: DollarSign },
  { title: 'Relatórios', url: '/relatorios', icon: BarChart3 },
  { title: 'Performance', url: '/performance', icon: Activity },
  { title: 'Configurações', url: '/configuracoes', icon: Settings },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout, loading } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();
  const { hasAnyPermission } = usePermissions();

  const isAdmin = user?.isAdmin === true;

  const filteredItems = menuItems.filter(item => {
    // Admin vê tudo
    if (isAdmin) return true;
    
    // Itens restritos apenas ao admin
    if (item.title === 'Financeiro') {
      return hasAnyPermission(['financeiro.visualizar', 'financeiro.visualizar_proprios', 'financeiro.editar']);
    }
    if (item.title === 'Configurações' || item.title === 'Performance') {
      return false; // Apenas admin
    }
    
    // Itens com permissões específicas
    if (item.title === 'Equipe') {
      return hasAnyPermission(['equipe.visualizar', 'equipe.editar']);
    }
    if (item.title === 'Contratos') {
      return hasAnyPermission(['contratos.visualizar', 'contratos.editar']);
    }
    if (item.title === 'Estoque') {
      return hasAnyPermission(['estoque.editar', 'estoque.alocar']);
    }
    if (item.title === 'Transportadoras') {
      return hasAnyPermission(['transportadoras.visualizar', 'transportadoras.editar']);
    }
    
    // Itens básicos (Dashboard, Eventos, Clientes, Demandas, Relatórios) - todos veem
    return true;
  });

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="border-r-0 bg-sidebar" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/30 p-4 md:p-6">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-accent/20 backdrop-blur-sm rounded-xl shadow-lg shadow-accent/30 ring-2 ring-accent/50">
            <Calendar className="h-5 w-5 md:h-6 md:w-6 text-accent" />
          </div>
          
          {state !== 'collapsed' && (
            <div>
              <p className="text-sm md:text-base font-display font-bold text-sidebar-foreground">
                Gestão Eventos
              </p>
              <p className="text-xs text-sidebar-foreground/70 truncate max-w-[150px]">
                {user?.name}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 px-4">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url)}
                    className={cn(
                      "mx-2 min-h-[44px] transition-all duration-200",
                      isActive(item.url) && "border-l-4 border-accent shadow-md"
                    )}
                    tooltip={state === 'collapsed' ? item.title : undefined}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                      {isActive(item.url) && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-accent animate-pulse" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/30 p-3 md:p-4">
        <div className="space-y-3">
          {state !== 'collapsed' && (
            <>
              <div className="px-3 md:px-4 py-2 md:py-3 bg-sidebar-accent/50 backdrop-blur-sm rounded-xl border border-sidebar-border/30">
                <p className="text-xs text-sidebar-foreground/60 font-medium uppercase tracking-wide">
                  Perfil
                </p>
                <p className="text-sm font-semibold text-sidebar-foreground capitalize mt-1 truncate">
                  {user?.role}
                </p>
              </div>
              
              <Separator className="bg-sidebar-border/30" />
            </>
          )}
          
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive transition-all duration-200 group min-h-[44px]"
          >
            <LogOut className="h-4 w-4 md:mr-3 group-hover:rotate-12 transition-transform" />
            {state !== 'collapsed' && <span>Sair</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
