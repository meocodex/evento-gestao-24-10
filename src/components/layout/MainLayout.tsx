import { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

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
        {/* Premium animated background */}
        <div className="fixed inset-0 -z-10">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          
          {/* Animated gradient orbs */}
          <div className="absolute top-0 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-glow" />
          <div className="absolute bottom-0 -right-40 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse-subtle" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl opacity-30" />
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
          
          {/* Noise texture for depth */}
          <div className="absolute inset-0 bg-noise opacity-[0.015]" />
        </div>

        <AppSidebar />
        
        <div className="flex-1 flex flex-col relative">
          {/* Premium glassmorphic header */}
          <header className="sticky top-0 z-10 h-14 border-b border-border/40 bg-background/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/40">
            <div className="flex h-14 items-center gap-4 px-6">
              <SidebarTrigger className="hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-lg" />
              <div className="flex-1" />
            </div>
          </header>
          
          {/* Main content with premium spacing */}
          <main className="flex-1 overflow-auto">
            <div className="min-h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
