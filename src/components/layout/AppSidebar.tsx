import { NavLink } from 'react-router-dom';
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
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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
  { title: 'Configurações', url: '/configuracoes', icon: Settings, roles: ['admin'] },
];

export function AppSidebar() {
  const { user, logout } = useAuth();

  const filteredItems = menuItems.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  );

  return (
    <Sidebar className="border-r border-sidebar-border/50">
      <SidebarHeader className="border-b border-sidebar-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-display font-bold text-sidebar-foreground">Gestão Eventos</p>
            <p className="text-xs text-sidebar-foreground/70">{user?.name}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-sidebar-foreground border-l-2 border-primary font-semibold shadow-sm'
                          : 'hover:bg-sidebar-accent/50 hover:translate-x-1 transition-all duration-200'
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 p-4">
        <div className="space-y-3">
          <div className="px-3 py-2.5 bg-gradient-to-r from-sidebar-accent/40 to-sidebar-accent/20 rounded-xl border border-sidebar-border/30">
            <p className="text-xs text-sidebar-foreground/60 font-medium">Perfil</p>
            <p className="text-sm font-semibold text-sidebar-foreground capitalize mt-0.5">{user?.role}</p>
          </div>
          <Separator className="bg-sidebar-border/30" />
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive transition-all duration-200 group"
          >
            <LogOut className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
            Sair
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
