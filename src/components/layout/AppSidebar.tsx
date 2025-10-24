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
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home, roles: ['admin', 'comercial', 'suporte'] },
  { title: 'Eventos', url: '/eventos', icon: Calendar, roles: ['admin', 'comercial', 'suporte'] },
  { title: 'Clientes', url: '/clientes', icon: Users, roles: ['admin', 'comercial'] },
  { title: 'Estoque', url: '/estoque', icon: Package, roles: ['admin', 'suporte'] },
  { title: 'Demandas', url: '/demandas', icon: Bell, roles: ['admin', 'comercial', 'suporte'] },
  { title: 'Transportadoras', url: '/transportadoras', icon: Truck, roles: ['admin', 'suporte'] },
  { title: 'Financeiro', url: '/financeiro', icon: DollarSign, roles: ['admin'] },
  { title: 'Contratos', url: '/contratos', icon: FileText, roles: ['admin', 'comercial'] },
  { title: 'Relatórios', url: '/relatorios', icon: BarChart3, roles: ['admin', 'comercial', 'suporte'] },
  { title: 'Equipe', url: '/equipe', icon: UserCog, roles: ['admin', 'suporte'] },
  { title: 'Performance', url: '/performance', icon: Activity, roles: ['admin'] },
  { title: 'Configurações', url: '/configuracoes', icon: Settings, roles: ['admin'] },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout, loading } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();

  const filteredItems = user?.role === 'admin'
    ? menuItems
    : (user?.role ? menuItems.filter((item) => item.roles.includes(user.role)) : []);

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
                  <Link
                    to={item.url}
                    aria-current={isActive(item.url) ? 'page' : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 px-3 md:px-4 py-3 rounded-xl mx-2 transition-all duration-200 min-h-[44px] w-full",
                      isActive(item.url)
                        ? "bg-sidebar-accent border-l-4 border-accent text-sidebar-foreground shadow-md"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {state !== 'collapsed' && (
                      <>
                        <span className="font-medium">
                          {item.title}
                        </span>
                        {isActive(item.url) && (
                          <div className="absolute right-3 w-2 h-2 rounded-full bg-accent animate-pulse" />
                        )}
                      </>
                    )}
                  </Link>
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
