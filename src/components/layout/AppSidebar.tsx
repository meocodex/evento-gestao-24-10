import { Link, useLocation } from 'react-router-dom';
import logoTicketUp from '@/assets/logo-ticket-up.png';
import {
  Calendar,
  Users,
  Package,
  Truck,
  DollarSign,
  BarChart3,
  Settings,
  Home,
  LogOut,
  UserCog,
  Activity,
  ClipboardList,
  RefreshCw,
  BookOpen,
  ChevronDown,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
import { supabase } from '@/integrations/supabase/client';

type MenuItem = { title: string; url: string; icon: React.ComponentType<{ className?: string }> };

const mainMenuItems: MenuItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Eventos', url: '/eventos', icon: Calendar },
  { title: 'Clientes', url: '/clientes', icon: Users },
  { title: 'Financeiro', url: '/financeiro', icon: DollarSign },
  { title: 'Demandas', url: '/demandas', icon: ClipboardList },
  { title: 'Base de Conhecimento', url: '/base-conhecimento', icon: BookOpen },
  { title: 'Estoque', url: '/estoque', icon: Package },
  { title: 'Transportadoras', url: '/transportadoras', icon: Truck },
  { title: 'Relatórios', url: '/relatorios', icon: BarChart3 },
];

const configSubItems: MenuItem[] = [
  { title: 'Geral', url: '/configuracoes', icon: Settings },
  { title: 'Equipe', url: '/equipe', icon: UserCog },
  { title: 'Performance', url: '/performance', icon: Activity },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();
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
      case 'Estoque':
        return hasAnyPermission(['estoque.visualizar', 'estoque.editar', 'estoque.alocar']);
      case 'Transportadoras':
        return hasAnyPermission(['transportadoras.visualizar', 'transportadoras.editar']);
      case 'Financeiro':
        return hasAnyPermission(['financeiro.visualizar', 'financeiro.visualizar_proprios', 'financeiro.editar']);
      case 'Relatórios':
        return hasAnyPermission(['relatorios.visualizar', 'relatorios.gerar', 'relatorios.exportar']);
      case 'Base de Conhecimento':
        return true;
      // Config sub-items
      case 'Geral':
      case 'Performance':
        return false; // admin only
      case 'Equipe':
        return hasAnyPermission(['equipe.visualizar', 'equipe.editar']);
      default:
        return false;
    }
  };

  const filteredMainItems = mainMenuItems.filter(item => canSeeItem(item.title));
  const filteredConfigItems = configSubItems.filter(item => canSeeItem(item.title));
  const showConfig = filteredConfigItems.length > 0;

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');
  const isConfigActive = configSubItems.some(item => isActive(item.url));

  return (
    <Sidebar className="border-r-0 bg-sidebar" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/30 p-4 md:p-6">
        <div className="flex items-center justify-center">
          <div className="relative p-3 rounded-2xl bg-[radial-gradient(circle,hsl(48_38%_40%/0.15)_0%,transparent_70%)] shadow-[0_0_24px_4px_hsl(48_38%_40%/0.12)]">
            <img src={logoTicketUp} alt="Ticket Up" className="h-10 w-10 md:h-12 md:w-12 rounded-lg object-contain drop-shadow-[0_0_6px_hsl(48_38%_40%/0.4)]" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {filteredMainItems.map((item) => (
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

              {showConfig && (
                <SidebarMenuItem>
                  <Collapsible defaultOpen={isConfigActive}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={isConfigActive}
                        className={cn(
                          "mx-2 min-h-[44px] transition-all duration-200",
                          isConfigActive && "border-l-4 border-accent shadow-md"
                        )}
                        tooltip={state === 'collapsed' ? 'Configurações' : undefined}
                      >
                        <Settings className="h-5 w-5" />
                        <span className="font-medium">Configurações</span>
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenu className="ml-4 mt-1 space-y-1 border-l border-sidebar-border/30 pl-2">
                        {filteredConfigItems.map((sub) => (
                          <SidebarMenuItem key={sub.title}>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive(sub.url)}
                              className={cn(
                                "min-h-[38px] transition-all duration-200",
                                isActive(sub.url) && "border-l-2 border-accent"
                              )}
                            >
                              <Link to={sub.url}>
                                <sub.icon className="h-4 w-4" />
                                <span className="text-sm">{sub.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
