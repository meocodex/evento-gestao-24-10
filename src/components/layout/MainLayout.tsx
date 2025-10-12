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
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        
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
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
