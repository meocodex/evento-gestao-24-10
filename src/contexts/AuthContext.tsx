import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'comercial' | 'suporte';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Simulação de login - em produção seria uma chamada de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Demo users
    const demoUsers: Record<string, User> = {
      'admin@gestao.com': {
        id: '1',
        name: 'Administrador',
        email: 'admin@gestao.com',
        role: 'admin',
      },
      'comercial@gestao.com': {
        id: '2',
        name: 'Maria Santos',
        email: 'comercial@gestao.com',
        role: 'comercial',
      },
      'suporte@gestao.com': {
        id: '3',
        name: 'Carlos Silva',
        email: 'suporte@gestao.com',
        role: 'suporte',
      },
    };

    const foundUser = demoUsers[email];
    if (foundUser && password === '123456') {
      setUser(foundUser);
    } else {
      throw new Error('Credenciais inválidas');
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
