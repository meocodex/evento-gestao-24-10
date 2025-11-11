import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNotificacoes } from '@/hooks/useNotificacoes';
import { supabase } from '@/integrations/supabase/client';

const mockSupabase = vi.mocked(supabase);
const mockToast = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: any }) => 
    createElement(QueryClientProvider, { client: queryClient }, children);
}

const wrapper = createWrapper();

describe('useNotificacoes', () => {
  const mockUser = { id: 'user-123', email: 'user@example.com' };
  const mockNotificacoes = [
    {
      id: 'notif-1',
      user_id: 'user-123',
      tipo: 'evento',
      titulo: 'Novo evento',
      mensagem: 'Evento criado com sucesso',
      link: '/eventos/1',
      lida: false,
      created_at: '2025-01-15T10:00:00Z',
    },
    {
      id: 'notif-2',
      user_id: 'user-123',
      tipo: 'demanda',
      titulo: 'Demanda urgente',
      mensagem: 'Nova demanda criada',
      link: '/demandas/2',
      lida: true,
      created_at: '2025-01-14T09:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getUser = vi.fn().mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  it('deve carregar notificações do usuário', async () => {
    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: mockNotificacoes,
        error: null,
      }),
    })) as any;

    const { result } = renderHook(() => useNotificacoes(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.notificacoes).toHaveLength(2);
    expect(result.current.notificacoes[0].titulo).toBe('Novo evento');
  });

  it('deve contar notificações não lidas corretamente', async () => {
    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: mockNotificacoes,
        error: null,
      }),
    })) as any;

    const { result } = renderHook(() => useNotificacoes(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.naoLidas).toBe(1);
  });

  it('deve retornar array vazio se usuário não autenticado', async () => {
    mockSupabase.auth.getUser = vi.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const { result } = renderHook(() => useNotificacoes(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.notificacoes).toEqual([]);
  });

  it('deve marcar notificação como lida', async () => {
    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'notificacoes') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: mockNotificacoes,
            error: null,
          }),
          update: vi.fn().mockReturnThis(),
        };
      }
      return {
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
    }) as any;

    const { result } = renderHook(() => useNotificacoes(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.marcarComoLida('notif-1');
    });

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('notificacoes');
    });
  });

  it('deve marcar todas como lidas', async () => {
    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'notificacoes') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: mockNotificacoes,
            error: null,
          }),
          update: vi.fn().mockReturnThis(),
        };
      }
      return {
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
    }) as any;

    const { result } = renderHook(() => useNotificacoes(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.marcarTodasComoLidas();
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Notificações marcadas como lidas',
      });
    });
  });

  it('deve ordenar notificações por data decrescente', async () => {
    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn((field: string, options: any) => {
        expect(field).toBe('created_at');
        expect(options.ascending).toBe(false);
        return {
          limit: vi.fn().mockResolvedValue({
            data: mockNotificacoes,
            error: null,
          }),
        };
      }),
    })) as any;

    renderHook(() => useNotificacoes(), { wrapper });

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('notificacoes');
    });
  });

  it('deve limitar a 50 notificações', async () => {
    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn((count: number) => {
        expect(count).toBe(50);
        return Promise.resolve({
          data: mockNotificacoes,
          error: null,
        });
      }),
    })) as any;

    renderHook(() => useNotificacoes(), { wrapper });

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('notificacoes');
    });
  });
});
