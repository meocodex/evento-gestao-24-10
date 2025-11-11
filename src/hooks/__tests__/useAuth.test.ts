import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

// Mock do AuthContext
const mockLogout = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      logout: mockLogout,
      isAuthenticated: false,
    });
  });

  describe('Estado Não Autenticado', () => {
    it('deve retornar estado inicial não autenticado', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.loading).toBe(false);
    });

    it('deve não estar autenticado', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBeNull();
    });
  });

  describe('Estado Autenticado', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'João Silva',
          email: 'joao@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: ['eventos:criar', 'eventos:editar'],
          isAdmin: false,
        },
        session: {
          access_token: 'mock-token',
          refresh_token: 'mock-refresh',
        },
        loading: false,
        logout: mockLogout,
        isAuthenticated: true,
        hydrating: false,
      });
    });

    it('deve retornar dados do usuário autenticado', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBeDefined();
      expect(result.current.user?.id).toBe('user-123');
      expect(result.current.user?.name).toBe('João Silva');
      expect(result.current.user?.email).toBe('joao@example.com');
    });

    it('deve indicar que está autenticado', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('deve estar autenticado', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('deve ter permissões carregadas', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user?.permissions).toHaveLength(2);
      expect(result.current.user?.permissions).toContain('eventos:criar');
    });
  });

  describe('Estado Admin', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'admin-123',
          name: 'Admin User',
          email: 'admin@example.com',
          tipo: 'sistema',
          role: 'admin',
          permissions: [],
          isAdmin: true,
        },
        session: { access_token: 'admin-token' },
        loading: false,
        logout: mockLogout,
        isAuthenticated: true,
        hydrating: false,
      });
    });

    it('deve identificar usuário admin', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user?.isAdmin).toBe(true);
      expect(result.current.user?.role).toBe('admin');
    });
  });

  describe('Estado de Carregamento', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      logout: mockLogout,
      isAuthenticated: false,
      });
    });

    it('deve indicar loading enquanto carrega dados', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.loading).toBe(true);
    });
  });

  describe('Função de Logout', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'João Silva',
          email: 'joao@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: [],
          isAdmin: false,
        },
        session: { access_token: 'mock-token' },
        loading: false,
        logout: mockLogout,
        isAuthenticated: true,
        hydrating: false,
      });
    });

    it('deve fornecer função de logout', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.logout).toBeDefined();
      expect(typeof result.current.logout).toBe('function');
    });

    it('deve chamar logout corretamente', async () => {
      const { result } = renderHook(() => useAuth());

      await result.current.logout();

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('Diferentes Roles', () => {
    it('deve suportar role comercial', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-1',
          name: 'Comercial',
          email: 'comercial@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: ['eventos:criar'],
          isAdmin: false,
        },
        session: { access_token: 'token' },
        loading: false,
        logout: mockLogout,
        isAuthenticated: true,
        hydrating: false,
      });

      const { result } = renderHook(() => useAuth());
      expect(result.current.user?.role).toBe('comercial');
    });

    it('deve suportar role suporte', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-2',
          name: 'Suporte',
          email: 'suporte@example.com',
          tipo: 'sistema',
          role: 'suporte',
          permissions: ['materiais:alocar'],
          isAdmin: false,
        },
        session: { access_token: 'token' },
        loading: false,
        logout: mockLogout,
        isAuthenticated: true,
        hydrating: false,
      });

      const { result } = renderHook(() => useAuth());
      expect(result.current.user?.role).toBe('suporte');
    });
  });
});
