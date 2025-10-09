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
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg">
            <Calendar className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-sidebar-foreground">Gestão Eventos</p>
            <p className="text-xs text-sidebar-foreground/60">{user?.name}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'hover:bg-sidebar-accent/50'
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

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="space-y-2">
          <div className="px-3 py-2 bg-sidebar-accent/30 rounded-lg">
            <p className="text-xs text-sidebar-foreground/60">Perfil</p>
            <p className="text-sm font-medium text-sidebar-foreground capitalize">{user?.role}</p>
          </div>
          <Separator className="bg-sidebar-border" />
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
