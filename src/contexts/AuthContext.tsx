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
  permissions: string[];
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
  const navigate = useNavigate();

  useEffect(() => {
    // Setup auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth state changed:', event, '| Session:', !!session);
        setSession(session);
        
        if (session?.user) {
          // Set minimal user immediately to allow redirect
          setUser({
            id: session.user.id,
            name: session.user.email?.split('@')[0] || 'Usuário',
            email: session.user.email || '',
            tipo: 'sistema',
            role: 'comercial',
            permissions: [],
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

  // Hydrate user profile, roles, and permissions separately
  useEffect(() => {
    if (!session?.user?.id) return;
    
    console.log('💧 Hydrating user profile for:', session.user.id);
    
    (async () => {
      try {
        const userId = session.user.id;
        const [{ data: profile }, { data: roles }, { data: perms }] = await Promise.all([
          supabase.from('profiles').select('nome, tipo').eq('id', userId).single(),
          supabase.from('user_roles').select('role').eq('user_id', userId),
          supabase.from('user_permissions').select('permission_id').eq('user_id', userId),
        ]);
        
        console.log('✅ Profile hydrated:', { profile, roles: roles?.length, perms: perms?.length });
        
        setUser(prev => ({
          id: userId,
          name: profile?.nome ?? prev?.name ?? 'Usuário',
          email: session.user.email || prev?.email || '',
          tipo: (profile?.tipo as 'sistema' | 'operacional' | 'ambos') || prev?.tipo || 'sistema',
          role: (roles?.[0]?.role as UserRole) ?? prev?.role ?? 'comercial',
          permissions: (perms || []).map(p => p.permission_id),
        }));
      } catch (e) {
        console.warn('⚠️ Não foi possível hidratar perfil/roles/permissões, usando defaults:', e);
      }
    })();
  }, [session?.user?.id]);

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    navigate('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, logout, isAuthenticated: !!session, loading }}>
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
