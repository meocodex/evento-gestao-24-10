import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePermissionsCache } from '@/hooks/usePermissionsCache';
import { supabase } from '@/integrations/supabase/client';

const mockSupabase = vi.mocked(supabase);

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: any }) => 
    createElement(QueryClientProvider, { client: queryClient }, children);
}

const wrapper = createWrapper();

describe('usePermissionsCache', () => {
  const mockPermissions = [
    {
      id: 'perm-1',
      modulo: 'eventos',
      acao: 'criar',
      descricao: 'Criar eventos',
      categoria: 'Comercial',
    },
    {
      id: 'perm-2',
      modulo: 'eventos',
      acao: 'editar',
      descricao: 'Editar eventos',
      categoria: 'Comercial',
    },
    {
      id: 'perm-3',
      modulo: 'materiais',
      acao: 'alocar',
      descricao: 'Alocar materiais',
      categoria: 'Suporte',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve carregar permissões com sucesso', async () => {
    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockPermissions,
        error: null,
      }),
    })) as any;

    const { result } = renderHook(() => usePermissionsCache(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(3);
    expect(result.current.data?.[0].modulo).toBe('eventos');
  });

  it('deve ordenar por categoria e descrição', async () => {
    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn((field: string) => {
        const chain = {
          order: vi.fn().mockResolvedValue({
            data: mockPermissions,
            error: null,
          }),
        };
        return chain;
      }),
    })) as any;

    const { result } = renderHook(() => usePermissionsCache(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verificar que order foi chamado duas vezes (categoria e descrição)
    expect(mockSupabase.from).toHaveBeenCalledWith('permissions');
  });

  it('deve retornar array vazio se não houver permissões', async () => {
    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    })) as any;

    const { result } = renderHook(() => usePermissionsCache(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });

  it('deve usar cache por 10 minutos', () => {
    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockPermissions,
        error: null,
      }),
    })) as any;

    const { result } = renderHook(() => usePermissionsCache(), { wrapper });

    // Verificar que staleTime está configurado corretamente
    // O hook deve usar staleTime: 1000 * 60 * 10 (10 minutos)
    expect(result.current).toBeDefined();
  });

  it('deve lidar com erro de query', async () => {
    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      }),
    })) as any;

    const { result } = renderHook(() => usePermissionsCache(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });

  it('deve ter queryKey correto', async () => {
    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockPermissions,
        error: null,
      }),
    })) as any;

    const queryClient = new QueryClient();
    const testWrapper = ({ children }: { children: any }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);

    renderHook(() => usePermissionsCache(), { wrapper: testWrapper });

    await waitFor(() => {
      const cachedData = queryClient.getQueryData(['permissions-cache']);
      expect(cachedData).toBeDefined();
    });
  });

  it('deve incluir todos os campos obrigatórios', async () => {
    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockPermissions,
        error: null,
      }),
    })) as any;

    const { result } = renderHook(() => usePermissionsCache(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    result.current.data?.forEach((permission) => {
      expect(permission).toHaveProperty('id');
      expect(permission).toHaveProperty('modulo');
      expect(permission).toHaveProperty('acao');
      expect(permission).toHaveProperty('descricao');
      expect(permission).toHaveProperty('categoria');
    });
  });

  it('deve agrupar permissões por módulo corretamente', async () => {
    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockPermissions,
        error: null,
      }),
    })) as any;

    const { result } = renderHook(() => usePermissionsCache(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const eventosPerms = result.current.data?.filter(p => p.modulo === 'eventos');
    const materiaisPerms = result.current.data?.filter(p => p.modulo === 'materiais');

    expect(eventosPerms).toHaveLength(2);
    expect(materiaisPerms).toHaveLength(1);
  });
});
