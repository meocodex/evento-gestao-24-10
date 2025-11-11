import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUsuarios } from '@/hooks/useUsuarios';
import { supabase } from '@/integrations/supabase/client';

const mockSupabase = vi.mocked(supabase);
const mockToast = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    functions: {
      invoke: vi.fn(),
    },
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

describe('useUsuarios', () => {
  const mockProfiles = [
    {
      id: 'user-1',
      nome: 'João Silva',
      email: 'joao@example.com',
      cpf: '12345678900',
      telefone: '11999999999',
      tipo: 'sistema',
    },
    {
      id: 'user-2',
      nome: 'Maria Santos',
      email: 'maria@example.com',
      tipo: 'operacional',
    },
  ];

  const mockRoles = [
    { user_id: 'user-1', role: 'comercial' },
    { user_id: 'user-2', role: 'suporte' },
  ];

  const mockPermissions = [
    { user_id: 'user-1', permission_id: 'eventos:criar' },
    { user_id: 'user-1', permission_id: 'eventos:editar' },
    { user_id: 'user-2', permission_id: 'materiais:alocar' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Buscar Usuários', () => {
    it('deve carregar usuários com sucesso', async () => {
      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: mockProfiles,
              error: null,
            }),
          };
        }
        if (table === 'user_roles') {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({
              data: mockRoles,
              error: null,
            }),
          };
        }
        if (table === 'user_permissions') {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({
              data: mockPermissions,
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }) as any;

      const { result } = renderHook(() => useUsuarios(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.usuarios).toHaveLength(2);
      expect(result.current.usuarios?.[0].nome).toBe('João Silva');
    });

    it('deve combinar dados de profiles, roles e permissions', async () => {
      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: mockProfiles,
              error: null,
            }),
          };
        }
        if (table === 'user_roles') {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({
              data: mockRoles,
              error: null,
            }),
          };
        }
        if (table === 'user_permissions') {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({
              data: mockPermissions,
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }) as any;

      const { result } = renderHook(() => useUsuarios(), { wrapper });

      await waitFor(() => expect(result.current.usuarios).toBeDefined());

      const user1 = result.current.usuarios?.find(u => u.id === 'user-1');
      expect(user1?.role).toBe('comercial');
      expect(user1?.permissions).toHaveLength(2);
    });

    it('deve atribuir role padrão "comercial" se não houver role', async () => {
      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: [{ id: 'user-3', nome: 'Novo User', email: 'novo@example.com' }],
              error: null,
            }),
          };
        }
        if (table === 'user_roles') {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          };
        }
        if (table === 'user_permissions') {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }) as any;

      const { result } = renderHook(() => useUsuarios(), { wrapper });

      await waitFor(() => expect(result.current.usuarios).toBeDefined());

      expect(result.current.usuarios?.[0].role).toBe('comercial');
    });

    it('deve retornar array vazio se não houver profiles', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      })) as any;

      const { result } = renderHook(() => useUsuarios(), { wrapper });

      await waitFor(() => expect(result.current.usuarios).toEqual([]));
    });
  });

  describe('Alterar Função', () => {
    it('deve alterar função do usuário com sucesso', async () => {
      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: mockProfiles,
              error: null,
            }),
          };
        }
        if (table === 'user_roles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({
              data: [{ user_id: 'user-1', role: 'admin' }],
              error: null,
            }),
            in: vi.fn().mockResolvedValue({
              data: mockRoles,
              error: null,
            }),
            delete: vi.fn().mockResolvedValue({ error: null }),
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === 'user_permissions') {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({
              data: mockPermissions,
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }) as any;

      const { result } = renderHook(() => useUsuarios(), { wrapper });

      await waitFor(() => expect(result.current.usuarios).toBeDefined());

      act(() => {
        result.current.alterarFuncao.mutate({
          userId: 'user-1',
          newRole: 'suporte',
        });
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Função alterada',
          description: 'A função do usuário foi atualizada com sucesso.',
        });
      });
    });

    it('deve impedir remoção do último admin', async () => {
      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'user_roles') {
          return {
            select: vi.fn((fields: string, options?: any) => {
              if (options?.count) {
                return {
                  eq: vi.fn().mockResolvedValue({
                    data: [{ user_id: 'admin-1' }], // Apenas 1 admin
                    error: null,
                  }),
                };
              }
              return {
                eq: vi.fn().mockResolvedValue({
                  data: [{ role: 'admin' }],
                  error: null,
                }),
              };
            }),
          };
        }
        return {
          select: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }) as any;

      const { result } = renderHook(() => useUsuarios(), { wrapper });

      act(() => {
        result.current.alterarFuncao.mutate({
          userId: 'admin-1',
          newRole: 'comercial',
        });
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Erro ao alterar função',
            description: 'Não é possível remover o último administrador do sistema',
            variant: 'destructive',
          })
        );
      });
    });
  });

  describe('Criar Operador', () => {
    it('deve criar operador com sucesso', async () => {
      mockSupabase.functions.invoke = vi.fn().mockResolvedValue({
        data: { user: { id: 'new-user', email: 'novo@example.com' } },
        error: null,
      });

      mockSupabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockProfiles, error: null }),
        in: vi.fn().mockResolvedValue({ data: [], error: null }),
      })) as any;

      const { result } = renderHook(() => useUsuarios(), { wrapper });

      await waitFor(() => expect(result.current.usuarios).toBeDefined());

      act(() => {
        result.current.criarOperador.mutate({
          nome: 'Novo Operador',
          email: 'novo@example.com',
          senha: 'senha123',
          tipo: 'operacional',
          permissions: ['materiais:visualizar'],
        });
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Operador criado com sucesso',
          description: 'O operador já pode acessar o sistema.',
        });
      });
    });

    it('deve lidar com erro ao criar operador', async () => {
      mockSupabase.functions.invoke = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Email já cadastrado' },
      });

      mockSupabase.from = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockProfiles, error: null }),
        in: vi.fn().mockResolvedValue({ data: [], error: null }),
      })) as any;

      const { result } = renderHook(() => useUsuarios(), { wrapper });

      await waitFor(() => expect(result.current.usuarios).toBeDefined());

      act(() => {
        result.current.criarOperador.mutate({
          nome: 'Operador Duplicado',
          email: 'existente@example.com',
          senha: 'senha123',
          tipo: 'operacional',
          permissions: [],
        });
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Erro ao criar operador',
            variant: 'destructive',
          })
        );
      });
    });
  });
});
