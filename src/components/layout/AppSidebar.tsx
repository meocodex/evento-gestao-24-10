import { Link, useLocation } from 'react-router-dom';
import {
  Calendar,
  Users,
  Package,
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
  RefreshCw,
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
import { supabase } from '@/integrations/supabase/client';

type MenuItem = { title: string; url: string; icon: React.ComponentType<{ className?: string }> };
type MenuGroup = { label: string; items: MenuItem[] };

const menuGroups: MenuGroup[] = [
  {
    label: 'Menu Principal',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: Home },
      { title: 'Eventos', url: '/eventos', icon: Calendar },
    ],
  },
  {
    label: 'Pessoas',
    items: [
      { title: 'Clientes', url: '/clientes', icon: Users },
      { title: 'Equipe', url: '/equipe', icon: UserCog },
      { title: 'Demandas', url: '/demandas', icon: ClipboardList },
    ],
  },
  {
    label: 'Operacional',
    items: [
      { title: 'Estoque', url: '/estoque', icon: Package },
      { title: 'Transportadoras', url: '/transportadoras', icon: Truck },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { title: 'Financeiro', url: '/financeiro', icon: DollarSign },
      { title: 'Relatórios', url: '/relatorios', icon: BarChart3 },
      { title: 'Performance', url: '/performance', icon: Activity },
      { title: 'Configurações', url: '/configuracoes', icon: Settings },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout, loading } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();
  const { hasAnyPermission } = usePermissions();

  const isAdmin = user?.isAdmin === true;

  const canSeeItem = (title: string): boolean => {
    if (isAdmin) return true;
    switch (title) {
      case 'Dashboard':
        return true;
      case 'Eventos':
        return hasAnyPermission(['eventos.visualizar', 'eventos.visualizar_proprios', 'eventos.visualizar_todos', 'eventos.criar', 'eventos.editar_proprios', 'eventos.editar_todos']);
      case 'Clientes':
        return hasAnyPermission(['clientes.visualizar', 'clientes.criar', 'clientes.editar']);
      case 'Demandas':
        return hasAnyPermission(['demandas.visualizar', 'demandas.criar', 'demandas.editar', 'demandas.atribuir']);
      case 'Equipe':
        return hasAnyPermission(['equipe.visualizar', 'equipe.editar']);
      case 'Estoque':
        return hasAnyPermission(['estoque.visualizar', 'estoque.editar', 'estoque.alocar']);
      case 'Transportadoras':
        return hasAnyPermission(['transportadoras.visualizar', 'transportadoras.editar']);
      case 'Financeiro':
        return hasAnyPermission(['financeiro.visualizar', 'financeiro.visualizar_proprios', 'financeiro.editar']);
      case 'Relatórios':
        return hasAnyPermission(['relatorios.visualizar', 'relatorios.gerar', 'relatorios.exportar']);
      case 'Performance':
      case 'Configurações':
        return false;
      default:
        return false;
    }
  };

  const filteredGroups = menuGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => canSeeItem(item.title)),
    }))
    .filter(group => group.items.length > 0);

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="border-r-0 bg-sidebar" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/30 p-4 md:p-6">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-gradient-to-br from-[#8B7E41] via-[#A69548] to-[#1E2433] flex items-center justify-center shadow-md shadow-primary/20 ring-1 ring-primary/30">
            <span className="text-white font-display font-bold text-sm md:text-base drop-shadow-sm">T</span>
          </div>
          
          {state !== 'collapsed' && (
            <div>
              <p className="text-sm md:text-base font-display font-bold text-sidebar-foreground">
                Ticket Up
              </p>
              <p className="text-xs text-sidebar-foreground/70 truncate max-w-[150px]">
                {user?.name}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {filteredGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 px-4">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1 px-2">
                {group.items.map((item) => (
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
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/30 p-3 md:p-4">
        <div className="space-y-3">
          {state !== 'collapsed' && (
            <>
              {process.env.NODE_ENV === 'development' && (
                <div className="px-3 md:px-4 py-2 text-xs text-sidebar-foreground/60 space-y-1">
                  <p>Permissões: {user?.permissions?.length || 0}</p>
                  <p>Role: {user?.role}</p>
                  <p>Roles: {user?.roles?.join(', ') || 'nenhuma'}</p>
                  <p>Admin: {user?.isAdmin ? 'Sim' : 'Não'}</p>
                </div>
              )}
              
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
          
          <div className="flex gap-2">
            {!isAdmin && state !== 'collapsed' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  await supabase.auth.refreshSession();
                  window.location.reload();
                }}
                className="text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
                title="Recarregar Permissões"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              onClick={logout}
              className="flex-1 justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive transition-all duration-200 group min-h-[44px]"
            >
              <LogOut className="h-4 w-4 md:mr-3 group-hover:rotate-12 transition-transform" />
              {state !== 'collapsed' && <span>Sair</span>}
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
