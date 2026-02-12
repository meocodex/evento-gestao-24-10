import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEstoqueMutations } from '../useEstoqueMutations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { ReactNode } from 'react';

// Mocks
vi.mock('@/integrations/supabase/client');
vi.mock('@/hooks/use-toast');
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

const mockToast = vi.fn();
(toast as any).mockReturnValue({ toast: mockToast });

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => {
    return QueryClientProvider({ client: queryClient, children });
  };
  
  return Wrapper;
};

describe('useEstoqueMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('adicionarMaterial', () => {
    it('deve gerar ID sequencial automaticamente', async () => {
      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: 'MAT6', nome: 'Material Teste' },
        error: null,
      });

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'materiais_estoque') {
          return {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: [{ id: 'MAT5' }] }),
            insert: mockInsert,
          };
        }
        return {};
      });

      mockInsert.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        single: mockSingle,
      });

      const { result } = renderHook(() => useEstoqueMutations(), {
        wrapper: createWrapper(),
      });

      await result.current.adicionarMaterial.mutateAsync({
        nome: 'Material Teste',
        categoria: 'Categoria A',
        tipoControle: 'quantidade',
        quantidadeInicial: 10,
      });

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'MAT6',
          })
        );
      });
    });

    it('deve criar seriais automaticamente para tipo serial', async () => {
      const mockInsertSerial = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'materiais_estoque') {
          return {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: [{ id: 'MAT1' }] }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'MAT2', nome: 'Material Serial' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'materiais_seriais') {
          return {
            insert: mockInsertSerial,
          };
        }
        return {};
      });

      const { result } = renderHook(() => useEstoqueMutations(), {
        wrapper: createWrapper(),
      });

      await result.current.adicionarMaterial.mutateAsync({
        nome: 'Material Serial',
        categoria: 'Categoria B',
        tipoControle: 'serial',
        quantidadeSeriais: 3,
        localizacaoPadrao: 'Depósito A',
      });

      await waitFor(() => {
        expect(mockInsertSerial).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              numero: expect.stringMatching(/^MAT-\d{3}$/),
              status: 'disponivel',
              localizacao: 'Depósito A',
            }),
          ])
        );
      });

      expect(mockInsertSerial).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.any(Object),
          expect.any(Object),
          expect.any(Object),
        ])
      );
    });

    it('deve calcular quantidades corretamente', async () => {
      const mockInsert = vi.fn().mockReturnThis();

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'materiais_estoque') {
          return {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: [] }),
            insert: mockInsert,
          };
        }
        return {};
      });

      mockInsert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'MAT1' },
            error: null,
          }),
        }),
      });

      const { result } = renderHook(() => useEstoqueMutations(), {
        wrapper: createWrapper(),
      });

      await result.current.adicionarMaterial.mutateAsync({
        nome: 'Material Quantidade',
        categoria: 'Cat A',
        tipoControle: 'quantidade',
        quantidadeInicial: 50,
      });

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            quantidade_total: 50,
            quantidade_disponivel: 50,
          })
        );
      });
    });

    it('deve exibir toast de sucesso', async () => {
      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'materiais_estoque') {
          return {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: [] }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'MAT1', nome: 'Material Novo' },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      const { result } = renderHook(() => useEstoqueMutations(), {
        wrapper: createWrapper(),
      });

      await result.current.adicionarMaterial.mutateAsync({
        nome: 'Material Novo',
        categoria: 'Categoria',
        tipoControle: 'quantidade',
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Material cadastrado',
            description: expect.stringContaining('Material Novo'),
          })
        );
      });
    });

    it('deve tratar erro de permissão', async () => {
      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'materiais_estoque') {
          return {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: [] }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: new Error('permission denied'),
                }),
              }),
            }),
          };
        }
        return {};
      });

      const { result } = renderHook(() => useEstoqueMutations(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.adicionarMaterial.mutateAsync({
          nome: 'Material Teste',
          categoria: 'Categoria',
          tipoControle: 'quantidade',
        })
      ).rejects.toThrow();

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            description: expect.stringContaining('não tem permissão'),
            variant: 'destructive',
          })
        );
      });
    });
  });

  describe('editarMaterial', () => {
    it('deve editar material com sucesso', async () => {
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as any) = vi.fn().mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
      });

      const { result } = renderHook(() => useEstoqueMutations(), {
        wrapper: createWrapper(),
      });

      await result.current.editarMaterial.mutateAsync({
        id: 'MAT1',
        dados: {
          nome: 'Material Atualizado',
          categoria: 'Nova Categoria',
        },
      });

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            nome: 'Material Atualizado',
            categoria: 'Nova Categoria',
          })
        );
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Material atualizado',
        })
      );
    });
  });

  describe('excluirMaterial', () => {
    it('deve excluir material sem seriais em uso', async () => {
      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'materiais_seriais') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({
              data: [{ status: 'disponivel' }],
            }),
          };
        }
        if (table === 'materiais_estoque') {
          return {
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      const { result } = renderHook(() => useEstoqueMutations(), {
        wrapper: createWrapper(),
      });

      await result.current.excluirMaterial.mutateAsync('MAT1');

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Material excluído',
          })
        );
      });
    });

    it('deve impedir exclusão de material com seriais em uso', async () => {
      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'materiais_seriais') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({
              data: [
                { status: 'disponivel' },
                { status: 'em_uso' },
              ],
            }),
          };
        }
        return {};
      });

      const { result } = renderHook(() => useEstoqueMutations(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.excluirMaterial.mutateAsync('MAT1')
      ).rejects.toThrow('possui 1 unidade(s) em uso');

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Não é possível excluir',
            variant: 'destructive',
          })
        );
      });
    });
  });

  describe('adicionarSerial', () => {
    it('deve adicionar serial e atualizar contadores', async () => {
      const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null });

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'materiais_seriais') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null }),
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      (supabase.rpc as any) = mockRpc;

      const { result } = renderHook(() => useEstoqueMutations(), {
        wrapper: createWrapper(),
      });

      await result.current.adicionarSerial.mutateAsync({
        materialId: 'MAT1',
        dados: {
          numero: 'SER-001',
          status: 'disponivel',
          localizacao: 'Depósito A',
          tags: [],
        },
      });

      await waitFor(() => {
        expect(mockRpc).toHaveBeenCalledWith('increment_estoque_total', {
          p_material_id: 'MAT1',
        });
        expect(mockRpc).toHaveBeenCalledWith('increment_estoque_disponivel', {
          p_material_id: 'MAT1',
        });
      });
    });

    it('deve impedir serial duplicado', async () => {
      (supabase.from as any) = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { numero: 'SER-001' },
        }),
      });

      const { result } = renderHook(() => useEstoqueMutations(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.adicionarSerial.mutateAsync({
          materialId: 'MAT1',
          dados: {
            numero: 'SER-001',
            status: 'disponivel',
            localizacao: 'Depósito',
            tags: [],
          },
        })
      ).rejects.toThrow('Já existe um serial com este número');
    });

    it('não deve incrementar disponível se status não for disponível', async () => {
      const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null });

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'materiais_seriais') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null }),
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      (supabase.rpc as any) = mockRpc;

      const { result } = renderHook(() => useEstoqueMutations(), {
        wrapper: createWrapper(),
      });

      await result.current.adicionarSerial.mutateAsync({
        materialId: 'MAT1',
        dados: {
          numero: 'SER-002',
          status: 'em-uso',
          localizacao: 'Evento X',
          tags: [],
        },
      });

      await waitFor(() => {
        expect(mockRpc).toHaveBeenCalledWith('increment_estoque_total', {
          p_material_id: 'MAT1',
        });
      });

      // Não deve chamar increment_estoque_disponivel
      expect(mockRpc).not.toHaveBeenCalledWith('increment_estoque_disponivel', expect.any(Object));
    });
  });

  describe('editarSerial', () => {
    it('deve editar serial e atualizar disponível ao mudar status', async () => {
      const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null });

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'materiais_seriais') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { status: 'em_uso' },
              error: null,
            }),
            update: vi.fn().mockReturnThis(),
          };
        }
        return {};
      });

      (supabase.rpc as any) = mockRpc;

      const { result } = renderHook(() => useEstoqueMutations(), {
        wrapper: createWrapper(),
      });

      await result.current.editarSerial.mutateAsync({
        materialId: 'MAT1',
        numeroSerial: 'SER-001',
        dados: {
          status: 'disponivel',
          localizacao: 'Depósito',
        },
      });

      await waitFor(() => {
        expect(mockRpc).toHaveBeenCalledWith('increment_estoque_disponivel', {
          p_material_id: 'MAT1',
        });
      });
    });

    it('deve decrementar disponível ao mudar de disponível para outro status', async () => {
      const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null });

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'materiais_seriais') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { status: 'disponivel' },
              error: null,
            }),
            update: vi.fn().mockReturnThis(),
          };
        }
        return {};
      });

      (supabase.rpc as any) = mockRpc;

      const { result } = renderHook(() => useEstoqueMutations(), {
        wrapper: createWrapper(),
      });

      await result.current.editarSerial.mutateAsync({
        materialId: 'MAT1',
        numeroSerial: 'SER-001',
        dados: {
          status: 'em-uso',
        },
      });

      await waitFor(() => {
        expect(mockRpc).toHaveBeenCalledWith('decrement_estoque_disponivel', {
          p_material_id: 'MAT1',
        });
      });
    });
  });

  describe('excluirSerial', () => {
    it('deve excluir serial e atualizar contadores', async () => {
      const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null });

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'materiais_seriais') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { status: 'disponivel' },
            }),
            delete: vi.fn().mockReturnThis(),
          };
        }
        return {};
      });

      (supabase.from('materiais_seriais').delete as any) = vi.fn().mockReturnThis();
      (supabase.from('materiais_seriais').delete().eq as any) = vi.fn().mockReturnThis();
      (supabase.from('materiais_seriais').delete().eq('material_id', 'MAT1').eq as any) = vi.fn()
        .mockResolvedValue({ error: null });

      (supabase.rpc as any) = mockRpc;

      const { result } = renderHook(() => useEstoqueMutations(), {
        wrapper: createWrapper(),
      });

      await result.current.excluirSerial.mutateAsync({
        materialId: 'MAT1',
        numeroSerial: 'SER-001',
      });

      await waitFor(() => {
        expect(mockRpc).toHaveBeenCalledWith('decrement_estoque_disponivel', {
          p_material_id: 'MAT1',
        });
        expect(mockRpc).toHaveBeenCalledWith('decrement_estoque_total', {
          p_material_id: 'MAT1',
        });
      });
    });

    it('deve impedir exclusão de serial em uso', async () => {
      (supabase.from as any) = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { status: 'em_uso' },
        }),
      });

      const { result } = renderHook(() => useEstoqueMutations(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.excluirSerial.mutateAsync({
          materialId: 'MAT1',
          numeroSerial: 'SER-001',
        })
      ).rejects.toThrow('Este serial está em uso');
    });
  });
});
