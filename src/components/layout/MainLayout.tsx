import { useEffect, Suspense } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { NotificationCenter } from './NotificationCenter';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePrefetchPages } from '@/hooks/usePrefetchPages';
import { NavigationLoadingBar } from '@/components/shared/NavigationLoadingBar';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';

export function MainLayout() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Prefetch inteligente de páginas relacionadas
  usePrefetchPages();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <NavigationLoadingBar />
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar collapsible="offcanvas" />
        
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-50 h-16 bg-white border-b border-navy-100 shadow-sm backdrop-blur-sm bg-white/95">
            <div className="h-full flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-navy-50 rounded-lg transition-colors" />
              </div>
              
              <div className="flex items-center gap-3">
                <NotificationCenter />
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto bg-background">
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 lg:py-8">
              <Suspense fallback={
                <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                  <div className="space-y-4 w-full max-w-4xl">
                    <LoadingSkeleton variant="text" className="h-8 w-64" />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <LoadingSkeleton variant="card" className="h-32" />
                      <LoadingSkeleton variant="card" className="h-32" />
                      <LoadingSkeleton variant="card" className="h-32" />
                    </div>
                  </div>
                </div>
              }>
                <Outlet />
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
