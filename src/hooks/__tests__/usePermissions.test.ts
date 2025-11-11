import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePermissions } from '../usePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { Evento } from '@/types/eventos';

vi.mock('@/contexts/AuthContext');

describe('usePermissions', () => {
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

  describe('Admin privileges', () => {
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

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('qualquer.permissao')).toBe(true);
      expect(result.current.hasAnyPermission(['perm1', 'perm2'])).toBe(true);
      expect(result.current.hasAllPermissions(['perm1', 'perm2'])).toBe(true);
      expect(result.current.canCreateEvent).toBe(true);
      expect(result.current.canDeleteEvent).toBe(true);
      expect(result.current.canViewFinancial).toBe(true);
      expect(result.current.canEditFinancial).toBe(true);
      expect(result.current.canAllocateMaterials).toBe(true);
    });
  });

  describe('hasPermission', () => {
    it('deve retornar true para permissão existente', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: ['eventos.criar', 'eventos.editar_todos'],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('eventos.criar')).toBe(true);
      expect(result.current.hasPermission('eventos.editar_todos')).toBe(true);
    });

    it('deve retornar false para permissão inexistente', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: ['eventos.criar'],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('eventos.deletar')).toBe(false);
    });

    it('deve retornar false quando usuário não tem permissões', () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('eventos.criar')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('deve retornar true se tiver pelo menos uma permissão (OR)', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: ['eventos.criar'],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAnyPermission(['eventos.criar', 'eventos.deletar'])
      ).toBe(true);
    });

    it('deve retornar false se não tiver nenhuma permissão', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: ['eventos.criar'],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAnyPermission(['eventos.deletar', 'eventos.arquivar'])
      ).toBe(false);
    });

    it('deve retornar false para array vazio', () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasAnyPermission([])).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('deve retornar true se tiver todas as permissões (AND)', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: ['eventos.criar', 'eventos.editar_todos', 'eventos.deletar'],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAllPermissions(['eventos.criar', 'eventos.editar_todos'])
      ).toBe(true);
    });

    it('deve retornar false se faltar alguma permissão', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: ['eventos.criar'],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAllPermissions(['eventos.criar', 'eventos.deletar'])
      ).toBe(false);
    });

    it('deve retornar true para array vazio', () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasAllPermissions([])).toBe(true);
    });
  });

  describe('canViewEvent', () => {
    it('deve permitir visualizar com eventos.visualizar_todos', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: ['eventos.visualizar_todos'],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });

      const evento: Partial<Evento> = {
        id: 'evt-1',
        comercial: { id: 'user-456', nome: 'Outro', email: 'outro@test.com' },
      };

      const { result } = renderHook(() => usePermissions(evento as Evento));

      expect(result.current.canViewEvent(evento as Evento)).toBe(true);
    });

    it('deve permitir visualizar próprio evento com eventos.visualizar_proprios', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: ['eventos.visualizar_proprios'],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });

      const evento: Partial<Evento> = {
        id: 'evt-1',
        comercial: { id: 'user-123', nome: 'João', email: 'joao@test.com' },
      };

      const { result } = renderHook(() => usePermissions(evento as Evento));

      expect(result.current.canViewEvent(evento as Evento)).toBe(true);
    });

    it('não deve permitir visualizar evento de outro com eventos.visualizar_proprios', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: ['eventos.visualizar_proprios'],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });

      const evento: Partial<Evento> = {
        id: 'evt-1',
        comercial: { id: 'user-456', nome: 'Outro', email: 'outro@test.com' },
      };

      const { result } = renderHook(() => usePermissions(evento as Evento));

      expect(result.current.canViewEvent(evento as Evento)).toBe(false);
    });

    it('deve permitir visualizar com eventos.visualizar genérico', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: ['eventos.visualizar'],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canViewEvent()).toBe(true);
    });
  });

  describe('canEditEvent', () => {
    it('deve permitir editar com eventos.editar_todos', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: ['eventos.editar_todos'],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });

      const evento: Partial<Evento> = {
        id: 'evt-1',
        comercial: { id: 'user-456', nome: 'Outro', email: 'outro@test.com' },
      };

      const { result } = renderHook(() => usePermissions(evento as Evento));

      expect(result.current.canEditEvent(evento as Evento)).toBe(true);
    });

    it('deve permitir editar próprio evento com eventos.editar_proprios', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: ['eventos.editar_proprios'],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });

      const evento: Partial<Evento> = {
        id: 'evt-1',
        comercial: { id: 'user-123', nome: 'João', email: 'joao@test.com' },
      };

      const { result } = renderHook(() => usePermissions(evento as Evento));

      expect(result.current.canEditEvent(evento as Evento)).toBe(true);
    });

    it('não deve permitir editar evento de outro com eventos.editar_proprios', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: ['eventos.editar_proprios'],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });

      const evento: Partial<Evento> = {
        id: 'evt-1',
        comercial: { id: 'user-456', nome: 'Outro', email: 'outro@test.com' },
      };

      const { result } = renderHook(() => usePermissions(evento as Evento));

      expect(result.current.canEditEvent(evento as Evento)).toBe(false);
    });

    it('não deve permitir editar sem permissões adequadas', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: ['eventos.visualizar'],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });

      const evento: Partial<Evento> = {
        id: 'evt-1',
        comercial: { id: 'user-123', nome: 'João', email: 'joao@test.com' },
      };

      const { result } = renderHook(() => usePermissions(evento as Evento));

      expect(result.current.canEditEvent(evento as Evento)).toBe(false);
    });
  });

  describe('Helpers específicos', () => {
    it('canCreateEvent deve verificar eventos.criar', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: ['eventos.criar'],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canCreateEvent).toBe(true);
    });

    it('canDeleteEvent deve verificar eventos.deletar', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: ['eventos.deletar'],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canDeleteEvent).toBe(true);
    });

    it('canViewFinancial deve verificar financeiro.visualizar ou visualizar_proprios', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: ['financeiro.visualizar'],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canViewFinancial).toBe(true);
    });

    it('canEditFinancial deve verificar financeiro.editar', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: ['financeiro.editar'],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canEditFinancial).toBe(true);
    });

    it('canAllocateMaterials deve verificar estoque.alocar', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: ['estoque.alocar'],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canAllocateMaterials).toBe(true);
      expect(result.current.canAllocate).toBe(true);
    });

    it('canEditChecklist deve verificar múltiplas permissões', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: ['eventos.editar_todos'],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canEditChecklist).toBe(true);
    });

    it('canEditOperations deve verificar equipe.editar ou estoque.editar', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: ['equipe.editar'],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canEditOperations).toBe(true);
    });
  });

  describe('Estado e propriedades', () => {
    it('deve expor lista de permissões', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          tipo: 'sistema',
          role: 'comercial',
          permissions: ['eventos.criar', 'eventos.editar_todos'],
          isAdmin: false,
        },
        logout: vi.fn(),
        isAuthenticated: true,
        loading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.permissions).toEqual(['eventos.criar', 'eventos.editar_todos']);
    });

    it('deve expor isLoading', () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.isLoading).toBe(false);
    });

    it('deve retornar array vazio quando usuário não tem permissões', () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.permissions).toEqual([]);
    });
  });

  describe('Sem usuário autenticado', () => {
    it('deve retornar permissões vazias quando não há usuário', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        logout: vi.fn(),
        isAuthenticated: false,
        loading: false,
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('eventos.criar')).toBe(false);
      expect(result.current.canCreateEvent).toBe(false);
      expect(result.current.permissions).toEqual([]);
    });
  });
});
