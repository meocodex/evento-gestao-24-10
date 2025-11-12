import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock do react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('AuthContext', () => {
  const mockUser = {
    id: 'user-123',
    email: 'admin@test.com',
    aud: 'authenticated',
    created_at: '2024-01-01',
    app_metadata: {},
    user_metadata: {},
  };

  const mockSession = {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser,
  };

  const mockProfile = {
    id: 'user-123',
    nome: 'Admin User',
    tipo: 'sistema' as const,
  };

  const mockPermissions = [
    { permission_id: 'admin.full_access' },
    { permission_id: 'eventos.view' },
    { permission_id: 'estoque.edit' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Inicialização', () => {
    it('deve inicializar com loading true', async () => {
      const mockSubscribe = vi.fn();
      const mockUnsubscribe = vi.fn();

      (supabase.auth.onAuthStateChange as any).mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      });

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('deve configurar listener de auth state', () => {
      const mockUnsubscribe = vi.fn();
      (supabase.auth.onAuthStateChange as any).mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      });

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
      });

      const { unmount } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();

      unmount();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('Autenticação', () => {
    it('deve atualizar usuário quando há sessão', async () => {
      let authCallback: any;
      
      (supabase.auth.onAuthStateChange as any).mockImplementation((callback) => {
        authCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession },
      });

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProfile }),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      // Simular callback de auth change
      await act(async () => {
        authCallback('SIGNED_IN', mockSession);
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      }, { timeout: 3000 });

      expect(result.current.user?.email).toBe('admin@test.com');
    });

    it('deve hidratar perfil e permissões após login', async () => {
      vi.useFakeTimers();
      
      let authCallback: any;
      
      (supabase.auth.onAuthStateChange as any).mockImplementation((callback) => {
        authCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession },
      });

      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockProfile }),
          };
        }
        if (table === 'user_permissions') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: mockPermissions }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null }),
        };
      });

      (supabase.from as any) = mockFrom;

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        authCallback('SIGNED_IN', mockSession);
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.user?.name).toBe('Admin User');
      }, { timeout: 3000 });

      expect(result.current.user?.permissions).toHaveLength(3);
      expect(result.current.user?.isAdmin).toBe(true);
      expect(result.current.user?.role).toBe('admin');

      vi.useRealTimers();
    });

    it('deve detectar admin através de admin.full_access', async () => {
      vi.useFakeTimers();
      
      let authCallback: any;
      
      (supabase.auth.onAuthStateChange as any).mockImplementation((callback) => {
        authCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession },
      });

      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockProfile }),
          };
        }
        if (table === 'user_permissions') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: [{ permission_id: 'admin.full_access' }] }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
        };
      });

      (supabase.from as any) = mockFrom;

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        authCallback('SIGNED_IN', mockSession);
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.user?.isAdmin).toBe(true);
        expect(result.current.user?.role).toBe('admin');
      }, { timeout: 3000 });

      vi.useRealTimers();
    });

    it('deve definir role como comercial quando não é admin', async () => {
      vi.useFakeTimers();
      
      let authCallback: any;
      
      (supabase.auth.onAuthStateChange as any).mockImplementation((callback) => {
        authCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession },
      });

      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockProfile }),
          };
        }
        if (table === 'user_permissions') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ 
              data: [
                { permission_id: 'eventos.view' },
                { permission_id: 'clientes.edit' }
              ] 
            }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
        };
      });

      (supabase.from as any) = mockFrom;

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        authCallback('SIGNED_IN', mockSession);
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.user?.isAdmin).toBe(false);
        expect(result.current.user?.role).toBe('comercial');
      }, { timeout: 3000 });

      vi.useRealTimers();
    });
  });

  describe('Logout', () => {
    it('deve fazer logout e redirecionar para /auth', async () => {
      let authCallback: any;
      
      (supabase.auth.onAuthStateChange as any).mockImplementation((callback) => {
        authCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession },
      });

      (supabase.auth.signOut as any).mockResolvedValue({ error: null });

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProfile }),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        authCallback('SIGNED_IN', mockSession);
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/auth');
    });

    it('deve limpar estado do usuário após logout', async () => {
      let authCallback: any;
      
      (supabase.auth.onAuthStateChange as any).mockImplementation((callback) => {
        authCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession },
      });

      (supabase.auth.signOut as any).mockResolvedValue({ error: null });

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProfile }),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        authCallback('SIGNED_IN', mockSession);
      });

      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });

      await act(async () => {
        await result.current.logout();
        authCallback('SIGNED_OUT', null);
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
      });
    });
  });

  describe('Estados de Loading', () => {
    it('deve manter loading true durante hydration', async () => {
      vi.useFakeTimers();
      
      let authCallback: any;
      
      (supabase.auth.onAuthStateChange as any).mockImplementation((callback) => {
        authCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession },
      });

      (supabase.from as any).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve({ data: mockProfile }), 100))
        ),
      }));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        authCallback('SIGNED_IN', mockSession);
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      vi.useRealTimers();
    });
  });

  describe('Edge Cases', () => {
    it('deve lidar com erro ao hidratar perfil', async () => {
      vi.useFakeTimers();
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      let authCallback: any;
      
      (supabase.auth.onAuthStateChange as any).mockImplementation((callback) => {
        authCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession },
      });

      (supabase.from as any).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockRejectedValue(new Error('Database error')),
      }));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        authCallback('SIGNED_IN', mockSession);
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Deve manter usuário básico mesmo com erro
      expect(result.current.user).not.toBeNull();
      expect(result.current.user?.email).toBe('admin@test.com');
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
      vi.useRealTimers();
    });

    it('deve usar email como nome quando nome não está disponível', async () => {
      let authCallback: any;
      
      (supabase.auth.onAuthStateChange as any).mockImplementation((callback) => {
        authCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession },
      });

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null }),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        authCallback('SIGNED_IN', mockSession);
      });

      await waitFor(() => {
        expect(result.current.user?.name).toBe('admin');
      });
    });
  });

  describe('Hook fora do Provider', () => {
    it('deve lançar erro quando usado fora do AuthProvider', () => {
      // Suprimir erro do console durante o teste
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within AuthProvider');

      consoleErrorSpy.mockRestore();
    });
  });
});
