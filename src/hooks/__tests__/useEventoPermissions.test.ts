import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEventoPermissions } from '../useEventoPermissions';
import { useAuth } from '@/contexts/AuthContext';
import { Evento } from '@/types/eventos';

vi.mock('@/contexts/AuthContext');

describe('useEventoPermissions (DEPRECATED)', () => {
  const mockUseAuth = vi.mocked(useAuth);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        tipo: 'sistema',
        role: 'comercial',
        permissions: [],
        isAdmin: false,
      },
      logout: vi.fn(),
      isAuthenticated: true,
      loading: false,
    });
  });

  describe('Permissões de Admin', () => {
    it('deve dar todas as permissões para admin', () => {
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
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });
      
      const { result } = renderHook(() => useEventoPermissions());

      expect(result.current.canEdit).toBe(true);
      expect(result.current.canAllocate).toBe(true);
      expect(result.current.canViewFinancial).toBe(true);
      expect(result.current.canEditFinancial).toBe(true);
      expect(result.current.canCreateEvent).toBe(true);
      expect(result.current.canDeleteEvent).toBe(true);
      expect(result.current.canEditChecklist).toBe(true);
      expect(result.current.canViewOperations).toBe(true);
      expect(result.current.canEditOperations).toBe(true);
    });
  });

  describe('Permissões de Comercial', () => {
    it('deve permitir criar eventos', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Comercial User',
          email: 'comercial@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: [],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });
      
      const { result } = renderHook(() => useEventoPermissions());

      expect(result.current.canCreateEvent).toBe(true);
    });

    it('deve permitir editar apenas seus próprios eventos', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Comercial User',
          email: 'comercial@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: [],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });
      
      const eventoPropio: Partial<Evento> = {
        id: 'evento-1',
        comercial: { id: 'user-123', nome: 'João', email: 'joao@test.com' },
      };

      const eventoOutro: Partial<Evento> = {
        id: 'evento-2',
        comercial: { id: 'user-456', nome: 'Maria', email: 'maria@test.com' },
      };

      const { result: result1 } = renderHook(() => 
        useEventoPermissions(eventoPropio as Evento)
      );
      expect(result1.current.canEdit).toBe(true);

      const { result: result2 } = renderHook(() => 
        useEventoPermissions(eventoOutro as Evento)
      );
      expect(result2.current.canEdit).toBe(false);
    });

    it('não deve permitir alocar materiais', () => {
      const { result } = renderHook(() => useEventoPermissions());

      expect(result.current.canAllocate).toBe(false);
    });

    it('não deve ver financeiro', () => {
      const { result } = renderHook(() => useEventoPermissions());

      expect(result.current.canViewFinancial).toBe(false);
      expect(result.current.canEditFinancial).toBe(false);
    });

    it('não deve deletar eventos', () => {
      const { result } = renderHook(() => useEventoPermissions());

      expect(result.current.canDeleteEvent).toBe(false);
    });

    it('deve editar checklist de seus eventos', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Comercial User',
          email: 'comercial@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: [],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });
      
      const eventoPropio: Partial<Evento> = {
        id: 'evento-1',
        comercial: { id: 'user-123', nome: 'João', email: 'joao@test.com' },
      };

      const { result } = renderHook(() => 
        useEventoPermissions(eventoPropio as Evento)
      );

      expect(result.current.canEditChecklist).toBe(true);
    });
  });

  describe('Permissões de Suporte', () => {
    it('deve permitir alocar materiais', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-suporte',
          name: 'Suporte User',
          email: 'suporte@example.com',
          tipo: 'sistema',
          role: 'suporte',
          permissions: [],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });
      
      const { result } = renderHook(() => useEventoPermissions());

      expect(result.current.canAllocate).toBe(true);
    });

    it('não deve permitir editar eventos', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-suporte',
          name: 'Suporte User',
          email: 'suporte@example.com',
          tipo: 'sistema',
          role: 'suporte',
          permissions: [],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });
      
      const { result } = renderHook(() => useEventoPermissions());

      expect(result.current.canEdit).toBe(false);
    });

    it('não deve ver financeiro', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-suporte',
          name: 'Suporte User',
          email: 'suporte@example.com',
          tipo: 'sistema',
          role: 'suporte',
          permissions: [],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });
      
      const { result } = renderHook(() => useEventoPermissions());

      expect(result.current.canViewFinancial).toBe(false);
      expect(result.current.canEditFinancial).toBe(false);
    });

    it('não deve criar eventos', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-suporte',
          name: 'Suporte User',
          email: 'suporte@example.com',
          tipo: 'sistema',
          role: 'suporte',
          permissions: [],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });
      
      const { result } = renderHook(() => useEventoPermissions());

      expect(result.current.canCreateEvent).toBe(false);
    });

    it('deve editar operações', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-suporte',
          name: 'Suporte User',
          email: 'suporte@example.com',
          tipo: 'sistema',
          role: 'suporte',
          permissions: [],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });
      
      const { result } = renderHook(() => useEventoPermissions());

      expect(result.current.canEditOperations).toBe(true);
    });
  });

  describe('Sem usuário autenticado', () => {
    it('deve retornar todas as permissões como false', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        logout: vi.fn(),
        isAuthenticated: false,
        loading: false,
      });

      const { result } = renderHook(() => useEventoPermissions());

      expect(result.current.canEdit).toBe(false);
      expect(result.current.canAllocate).toBe(false);
      expect(result.current.canViewFinancial).toBe(false);
      expect(result.current.canEditFinancial).toBe(false);
      expect(result.current.canCreateEvent).toBe(false);
      expect(result.current.canDeleteEvent).toBe(false);
      expect(result.current.canEditChecklist).toBe(false);
      expect(result.current.canViewOperations).toBe(false);
      expect(result.current.canEditOperations).toBe(false);
    });
  });

  describe('Avisos de Deprecação', () => {
    it('deve emitir warning em modo development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      renderHook(() => useEventoPermissions());

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('DEPRECATION WARNING')
      );

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });
  });
});
