import { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { NotificationCenter } from './NotificationCenter';

export function MainLayout() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full relative overflow-hidden bg-background">
        {/* Premium animated background - more subtle */}
        <div className="fixed inset-0 -z-10">
          {/* Base gradient - reduced opacity */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background to-accent/3" />
          
          {/* Animated gradient orbs - more subtle */}
          <div className="absolute top-0 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-glow" />
          <div className="absolute bottom-0 -right-40 w-96 h-96 bg-accent/8 rounded-full blur-3xl animate-pulse-subtle" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl opacity-20" />
          
          {/* Grid pattern overlay - more subtle */}
          <div className="absolute inset-0 opacity-[0.015]">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary) / 0.08) 1px, transparent 0)`,
              backgroundSize: '48px 48px'
            }} />
          </div>
        </div>

        <AppSidebar />
        
        <div className="flex-1 flex flex-col relative">
          {/* Premium glassmorphic header */}
          <header className="sticky top-0 z-10 h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
            <div className="flex h-16 items-center gap-4 px-6 lg:px-8">
              <SidebarTrigger className="hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-lg" />
              <div className="flex-1" />
              <NotificationCenter />
            </div>
          </header>
          
          {/* Main content with premium container and spacing */}
          <main className="flex-1 overflow-auto">
            <div className="container max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-12">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
