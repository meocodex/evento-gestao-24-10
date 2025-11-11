import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePermissions } from '../usePermissions';
import { Evento } from '@/types/eventos';

// Mock do AuthContext
const mockUser = {
  id: 'user-123',
  isAdmin: false,
  permissions: [] as string[],
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: mockUser, loading: false })),
}));

describe('usePermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser.isAdmin = false;
    mockUser.permissions = [];
  });

  describe('Admin privileges', () => {
    it('deve dar todas as permissões para admin', () => {
      mockUser.isAdmin = true;
      mockUser.permissions = [];

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
      mockUser.permissions = ['eventos.criar', 'eventos.editar_todos'];

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('eventos.criar')).toBe(true);
      expect(result.current.hasPermission('eventos.editar_todos')).toBe(true);
    });

    it('deve retornar false para permissão inexistente', () => {
      mockUser.permissions = ['eventos.criar'];

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('eventos.deletar')).toBe(false);
    });

    it('deve retornar false quando usuário não tem permissões', () => {
      mockUser.permissions = [];

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('eventos.criar')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('deve retornar true se tiver pelo menos uma permissão (OR)', () => {
      mockUser.permissions = ['eventos.criar'];

      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAnyPermission(['eventos.criar', 'eventos.deletar'])
      ).toBe(true);
    });

    it('deve retornar false se não tiver nenhuma permissão', () => {
      mockUser.permissions = ['eventos.criar'];

      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAnyPermission(['eventos.deletar', 'eventos.arquivar'])
      ).toBe(false);
    });

    it('deve retornar false para array vazio', () => {
      mockUser.permissions = ['eventos.criar'];

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasAnyPermission([])).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('deve retornar true se tiver todas as permissões (AND)', () => {
      mockUser.permissions = ['eventos.criar', 'eventos.editar_todos', 'eventos.deletar'];

      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAllPermissions(['eventos.criar', 'eventos.editar_todos'])
      ).toBe(true);
    });

    it('deve retornar false se faltar alguma permissão', () => {
      mockUser.permissions = ['eventos.criar'];

      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAllPermissions(['eventos.criar', 'eventos.deletar'])
      ).toBe(false);
    });

    it('deve retornar true para array vazio', () => {
      mockUser.permissions = ['eventos.criar'];

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasAllPermissions([])).toBe(true);
    });
  });

  describe('canViewEvent', () => {
    it('deve permitir visualizar com eventos.visualizar_todos', () => {
      mockUser.permissions = ['eventos.visualizar_todos'];

      const evento: Partial<Evento> = {
        id: 'evt-1',
        comercial: { id: 'user-456', nome: 'Outro', email: 'outro@test.com' },
      };

      const { result } = renderHook(() => usePermissions(evento as Evento));

      expect(result.current.canViewEvent(evento as Evento)).toBe(true);
    });

    it('deve permitir visualizar próprio evento com eventos.visualizar_proprios', () => {
      mockUser.permissions = ['eventos.visualizar_proprios'];
      mockUser.id = 'user-123';

      const evento: Partial<Evento> = {
        id: 'evt-1',
        comercial: { id: 'user-123', nome: 'João', email: 'joao@test.com' },
      };

      const { result } = renderHook(() => usePermissions(evento as Evento));

      expect(result.current.canViewEvent(evento as Evento)).toBe(true);
    });

    it('não deve permitir visualizar evento de outro com eventos.visualizar_proprios', () => {
      mockUser.permissions = ['eventos.visualizar_proprios'];
      mockUser.id = 'user-123';

      const evento: Partial<Evento> = {
        id: 'evt-1',
        comercial: { id: 'user-456', nome: 'Outro', email: 'outro@test.com' },
      };

      const { result } = renderHook(() => usePermissions(evento as Evento));

      expect(result.current.canViewEvent(evento as Evento)).toBe(false);
    });

    it('deve permitir visualizar com eventos.visualizar genérico', () => {
      mockUser.permissions = ['eventos.visualizar'];

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canViewEvent()).toBe(true);
    });
  });

  describe('canEditEvent', () => {
    it('deve permitir editar com eventos.editar_todos', () => {
      mockUser.permissions = ['eventos.editar_todos'];

      const evento: Partial<Evento> = {
        id: 'evt-1',
        comercial: { id: 'user-456', nome: 'Outro', email: 'outro@test.com' },
      };

      const { result } = renderHook(() => usePermissions(evento as Evento));

      expect(result.current.canEditEvent(evento as Evento)).toBe(true);
    });

    it('deve permitir editar próprio evento com eventos.editar_proprios', () => {
      mockUser.permissions = ['eventos.editar_proprios'];
      mockUser.id = 'user-123';

      const evento: Partial<Evento> = {
        id: 'evt-1',
        comercial: { id: 'user-123', nome: 'João', email: 'joao@test.com' },
      };

      const { result } = renderHook(() => usePermissions(evento as Evento));

      expect(result.current.canEditEvent(evento as Evento)).toBe(true);
    });

    it('não deve permitir editar evento de outro com eventos.editar_proprios', () => {
      mockUser.permissions = ['eventos.editar_proprios'];
      mockUser.id = 'user-123';

      const evento: Partial<Evento> = {
        id: 'evt-1',
        comercial: { id: 'user-456', nome: 'Outro', email: 'outro@test.com' },
      };

      const { result } = renderHook(() => usePermissions(evento as Evento));

      expect(result.current.canEditEvent(evento as Evento)).toBe(false);
    });

    it('não deve permitir editar sem permissões adequadas', () => {
      mockUser.permissions = ['eventos.visualizar'];

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
      mockUser.permissions = ['eventos.criar'];

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canCreateEvent).toBe(true);
    });

    it('canDeleteEvent deve verificar eventos.deletar', () => {
      mockUser.permissions = ['eventos.deletar'];

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canDeleteEvent).toBe(true);
    });

    it('canViewFinancial deve verificar financeiro.visualizar ou visualizar_proprios', () => {
      mockUser.permissions = ['financeiro.visualizar'];

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canViewFinancial).toBe(true);

      mockUser.permissions = ['financeiro.visualizar_proprios'];
      const { result: result2 } = renderHook(() => usePermissions());

      expect(result2.current.canViewFinancial).toBe(true);
    });

    it('canEditFinancial deve verificar financeiro.editar', () => {
      mockUser.permissions = ['financeiro.editar'];

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canEditFinancial).toBe(true);
    });

    it('canAllocateMaterials deve verificar estoque.alocar', () => {
      mockUser.permissions = ['estoque.alocar'];

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canAllocateMaterials).toBe(true);
      expect(result.current.canAllocate).toBe(true); // Alias
    });

    it('canEditChecklist deve verificar múltiplas permissões', () => {
      mockUser.permissions = ['eventos.editar_todos'];

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canEditChecklist).toBe(true);

      mockUser.permissions = ['estoque.editar'];
      const { result: result2 } = renderHook(() => usePermissions());

      expect(result2.current.canEditChecklist).toBe(true);
    });

    it('canEditOperations deve verificar equipe.editar ou estoque.editar', () => {
      mockUser.permissions = ['equipe.editar'];

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canEditOperations).toBe(true);

      mockUser.permissions = ['estoque.editar'];
      const { result: result2 } = renderHook(() => usePermissions());

      expect(result2.current.canEditOperations).toBe(true);
    });
  });

  describe('Estado e propriedades', () => {
    it('deve expor lista de permissões', () => {
      mockUser.permissions = ['eventos.criar', 'eventos.editar_todos'];

      const { result } = renderHook(() => usePermissions());

      expect(result.current.permissions).toEqual(['eventos.criar', 'eventos.editar_todos']);
    });

    it('deve expor isLoading', () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.isLoading).toBe(false);
    });

    it('deve retornar array vazio quando usuário não tem permissões', () => {
      mockUser.permissions = [];

      const { result } = renderHook(() => usePermissions());

      expect(result.current.permissions).toEqual([]);
    });
  });

  describe('Sem usuário autenticado', () => {
    it('deve retornar permissões vazias quando não há usuário', () => {
      vi.mock('@/contexts/AuthContext', () => ({
        useAuth: vi.fn(() => ({ user: null, loading: false })),
      }));

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('eventos.criar')).toBe(false);
      expect(result.current.canCreateEvent).toBe(false);
      expect(result.current.permissions).toEqual([]);
    });
  });
});
