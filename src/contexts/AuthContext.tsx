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
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile and role
          (async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select(`
                  nome,
                  tipo,
                  user_roles(role),
                  user_permissions(permission_id)
                `)
                .eq('id', session.user.id)
                .single();

              if (profile) {
                const permissions = profile.user_permissions?.map((up: any) => up.permission_id) || [];
                
                setUser({
                  id: session.user.id,
                  name: profile.nome ?? 'Usuário',
                  email: session.user.email || '',
                  tipo: profile.tipo || 'sistema',
                  role: (profile.user_roles?.[0]?.role as UserRole) ?? 'comercial',
                  permissions,
                });
              }
            } catch (error) {
              console.error('Erro ao carregar perfil:', error);
              setUser(null);
            } finally {
              setLoading(false);
            }
          })();
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    navigate('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, logout, isAuthenticated: !!user, loading }}>
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
