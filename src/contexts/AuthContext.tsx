import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'comercial' | 'suporte';

export interface User {
  id: string;
  name: string;
  email: string;
  tipo?: 'sistema' | 'operacional' | 'ambos';
  role: UserRole;
  roles?: string[]; // Array completo de roles
  permissions: string[];
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hydrating, setHydrating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Setup auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth state changed:', event, '| Session:', !!session);
        setSession(session);
        
        if (session?.user) {
          // Only set minimal user if there's no existing user (first time)
          setUser(prev => prev ?? {
            id: session.user.id,
            name: session.user.email?.split('@')[0] || 'Usuário',
            email: session.user.email || '',
            tipo: 'sistema',
            role: 'comercial',
            permissions: [],
            isAdmin: false,
          });
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 Initial session check:', !!session);
      setSession(session);
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Hydrate user profile and permissions (sistema 100% granular)
  useEffect(() => {
    if (!session?.user?.id) return;
    
    let isCancelled = false;
    setHydrating(true);
    
    const timeoutId = setTimeout(async () => {
      console.log('💧 Hydrating user profile for:', session.user.id);
      
      try {
        const userId = session.user.id;
        const [
          { data: profile }, 
          { data: perms },
          { data: userRoles }
        ] = await Promise.all([
          supabase.from('profiles').select('nome, tipo').eq('id', userId).single(),
          supabase.from('user_permissions').select('permission_id').eq('user_id', userId),
          supabase.from('user_roles').select('role').eq('user_id', userId)
        ]);
        
        if (isCancelled) return;
        
        // Detecção de admin: verifica se possui admin.full_access
        const isAdminFinal = perms?.some(p => p.permission_id === 'admin.full_access') ?? false;
        const rolesArray = userRoles?.map(r => r.role) || [];
        const finalRole: UserRole = isAdminFinal ? 'admin' : (rolesArray[0] as UserRole || 'comercial');
        
        console.log('✅ Profile hydrated:', { 
          profile, 
          permsLen: perms?.length,
          hasAdminFullAccess: isAdminFinal,
          rolesArray,
          finalRole
        });
        console.log('👑 isAdmin=', isAdminFinal, 'finalRole=', finalRole, 'allRoles=', rolesArray);
        
        setUser(prev => ({
          id: userId,
          name: profile?.nome || prev?.name || 'Usuário',
          email: session.user.email || prev?.email || '',
          tipo: (profile?.tipo as 'sistema' | 'operacional' | 'ambos') || prev?.tipo || 'sistema',
          role: finalRole,
          roles: rolesArray,
          permissions: (perms || []).map(p => p.permission_id),
          isAdmin: isAdminFinal,
        }));
      } catch (e) {
        if (!isCancelled) {
          console.warn('⚠️ Não foi possível hidratar perfil/permissões:', e);
        }
      } finally {
        if (!isCancelled) {
          setHydrating(false);
        }
      }
    }, 50);
    
    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [session?.user?.id]);

  // Listener para mudanças em tempo real nas permissões
  useEffect(() => {
    if (!session?.user?.id) return;

    const permissionsChannel = supabase
      .channel('user-permissions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_permissions',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          console.log('🔄 Permissões atualizadas em tempo real:', payload);
          // Re-hidratar usuário
          setHydrating(true);
          setTimeout(() => {
            // Trigger re-hydration
            setSession(prev => prev ? { ...prev } : null);
          }, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(permissionsChannel);
    };
  }, [session?.user?.id]);

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    navigate('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, logout, isAuthenticated: !!session, loading: loading || hydrating }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
