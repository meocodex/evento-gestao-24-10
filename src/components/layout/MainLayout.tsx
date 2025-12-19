import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { NotificationCenter } from './NotificationCenter';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePrefetchPages } from '@/hooks/usePrefetchPages';
import { NavigationLoadingBar } from '@/components/shared/NavigationLoadingBar';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { useRealtimeSubscription } from '@/hooks/useRealtimeHub';

export function MainLayout() {
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Prefetch inteligente de páginas relacionadas
  usePrefetchPages();
  
  // Ativar hub centralizado de realtime
  useRealtimeSubscription();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <NavigationLoadingBar />
      <div className="flex min-h-screen w-full bg-background overflow-x-hidden">
        <AppSidebar collapsible="offcanvas" />
        
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-50 h-14 sm:h-16 bg-background/95 border-b border-border shadow-sm backdrop-blur-sm">
            <div className="h-full flex items-center justify-between px-3 sm:px-6">
              <div className="flex items-center gap-2 sm:gap-4">
                <SidebarTrigger className="hover:bg-accent rounded-lg transition-colors" />
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <ThemeToggle />
                <NotificationCenter />
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto bg-background">
            <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6 lg:py-8">
              <Suspense fallback={
                <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center animate-in fade-in-0 duration-200">
                  <div className="space-y-4 w-full max-w-4xl animate-pulse">
                    <LoadingSkeleton variant="text" className="h-8 w-64" />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <LoadingSkeleton variant="card" className="h-32" />
                      <LoadingSkeleton variant="card" className="h-32" />
                      <LoadingSkeleton variant="card" className="h-32" />
                    </div>
                  </div>
                </div>
              }>
                <div className="animate-page-enter" key={location.pathname}>
                  <Outlet />
                </div>
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
