import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'comercial' | 'suporte';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('nome')
                .eq('id', session.user.id)
                .single();

              const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .single();

              setUser({
                id: session.user.id,
                name: profile?.nome || 'Usuário',
                email: session.user.email || '',
                role: (roleData?.role as UserRole) || 'comercial',
              });
            } catch (error) {
              // Silently fail in production - user will be set to null
            } finally {
              setLoading(false);
            }
          }, 0);
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
