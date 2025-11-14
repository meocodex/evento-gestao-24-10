import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEventosMutations } from '../useEventosMutations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { ReactNode } from 'react';

// Mocks
vi.mock('@/integrations/supabase/client');
vi.mock('@/hooks/use-toast');

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

describe('useEventosMutations', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    (supabase.auth.getUser as any) = vi.fn().mockResolvedValue({
      data: { user: mockUser },
    });
  });

  describe('criarEvento', () => {
    it('deve criar evento com sucesso', async () => {
      const mockEvento = {
        id: 'evt-123',
        nome: 'Festival de Verão',
        tipo_evento: 'bar',
        cliente_id: 'cli-123',
        comercial_id: 'com-123',
        data_inicio: '2024-07-01',
        data_fim: '2024-07-03',
        status: 'em_negociacao',
      };

      (supabase.from as any) = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockEvento, error: null }),
      });

      const { result } = renderHook(() => useEventosMutations(), {
        wrapper: createWrapper(),
      });

      await result.current.adicionarEvento.mutateAsync({
        nome: 'Festival de Verão',
        tipoEvento: 'bar',
        clienteId: 'cli-123',
        comercialId: 'com-123',
        dataInicio: '2024-07-01',
        dataFim: '2024-07-03',
        horaInicio: '10:00',
        horaFim: '22:00',
        local: 'Praia Central',
        cidade: 'São Paulo',
        estado: 'SP',
        endereco: 'Rua Teste',
        tags: ['verão', 'festival'],
      });

      await waitFor(() => {
        expect(result.current.adicionarEvento.isSuccess).toBe(true);
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Evento criado!',
        })
      );
    });

    it('deve validar campos obrigatórios', async () => {
      const { result } = renderHook(() => useEventosMutations(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.adicionarEvento.mutateAsync({
          nome: 'Evento Teste',
          dataInicio: '2024-07-01',
          dataFim: '2024-07-03',
          horaInicio: '10:00',
          horaFim: '22:00',
          local: 'Local Teste',
          cidade: 'SP',
          estado: 'SP',
          endereco: 'Rua',
          tags: [],
        } as any)
      ).rejects.toThrow('Cliente é obrigatório');
    });

    it('deve validar data de término não anterior à data de início', async () => {
      const { result } = renderHook(() => useEventosMutations(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.adicionarEvento.mutateAsync({
          nome: 'Evento Teste',
          clienteId: 'cli-123',
          comercialId: 'com-123',
          dataInicio: '2024-07-03',
          dataFim: '2024-07-01',
          horaInicio: '10:00',
          horaFim: '22:00',
          local: 'Local Teste',
          cidade: 'SP',
          estado: 'SP',
          endereco: 'Rua',
          tags: [],
        })
      ).rejects.toThrow('Data de término não pode ser anterior à data de início');
    });

    it('deve criar entrada na timeline', async () => {
      const mockInsertTimeline = vi.fn().mockResolvedValue({ data: null, error: null });

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'eventos') {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ 
              data: { id: 'evt-123', nome: 'Evento Teste' }, 
              error: null 
            }),
          };
        }
        if (table === 'eventos_timeline') {
          return {
            insert: mockInsertTimeline,
          };
        }
        return {};
      });

      const { result } = renderHook(() => useEventosMutations(), {
        wrapper: createWrapper(),
      });

      await result.current.adicionarEvento.mutateAsync({
        nome: 'Evento Teste',
        clienteId: 'cli-123',
        comercialId: 'com-123',
        dataInicio: '2024-07-01',
        dataFim: '2024-07-03',
        horaInicio: '10:00',
        horaFim: '22:00',
        local: 'Local Teste',
        cidade: 'SP',
        estado: 'SP',
        endereco: 'Rua',
        tags: [],
      });

      await waitFor(() => {
        expect(mockInsertTimeline).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              evento_id: 'evt-123',
              tipo: 'criacao',
            })
          ])
        );
      });
    });

    it('deve exibir toast de erro ao falhar', async () => {
      (supabase.from as any) = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: null, 
          error: new Error('Erro ao criar evento') 
        }),
      });

      const { result } = renderHook(() => useEventosMutations(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.adicionarEvento.mutateAsync({
          nome: 'Evento Teste',
          clienteId: 'cli-123',
          comercialId: 'com-123',
          dataInicio: '2024-07-01',
          dataFim: '2024-07-03',
          horaInicio: '10:00',
          horaFim: '22:00',
          local: 'Local Teste',
          cidade: 'SP',
          estado: 'SP',
          endereco: 'Rua',
          tags: [],
        })
      ).rejects.toThrow();

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Erro ao criar evento',
            variant: 'destructive',
          })
        );
      });
    });
  });

  describe('editarEvento', () => {
    it('deve editar evento com sucesso', async () => {
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'eventos') {
          return {
            update: mockUpdate,
            eq: mockEq,
          };
        }
        if (table === 'eventos_timeline') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      const { result } = renderHook(() => useEventosMutations(), {
        wrapper: createWrapper(),
      });

      await result.current.editarEvento.mutateAsync({
        id: 'evt-123',
        data: { nome: 'Evento Atualizado' },
      });

      await waitFor(() => {
        expect(result.current.editarEvento.isSuccess).toBe(true);
      });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ nome: 'Evento Atualizado' })
      );
    });

    it('deve validar datas ao editar', async () => {
      const { result } = renderHook(() => useEventosMutations(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.editarEvento.mutateAsync({
          id: 'evt-123',
          data: {
            dataInicio: '2024-07-03',
            dataFim: '2024-07-01',
          },
        })
      ).rejects.toThrow('Data de término não pode ser anterior à data de início');
    });

    it('deve realizar update otimista', async () => {
      const queryClient = new QueryClient();
      const mockSetQueryData = vi.spyOn(queryClient, 'setQueriesData');

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'eventos') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === 'eventos_timeline') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      const Wrapper = ({ children }: { children: ReactNode }) => {
        return QueryClientProvider({ client: queryClient, children });
      };
      const wrapper = Wrapper;

      const { result } = renderHook(() => useEventosMutations(), { wrapper });

      await result.current.editarEvento.mutateAsync({
        id: 'evt-123',
        data: { nome: 'Nome Atualizado' },
      });

      expect(mockSetQueryData).toHaveBeenCalled();
    });
  });

  describe('excluirEvento', () => {
    it('deve excluir evento com sucesso', async () => {
      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as any) = vi.fn().mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      });

      const { result } = renderHook(() => useEventosMutations(), {
        wrapper: createWrapper(),
      });

      await result.current.excluirEvento.mutateAsync('evt-123');

      await waitFor(() => {
        expect(result.current.excluirEvento.isSuccess).toBe(true);
      });

      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'evt-123');
    });

    it('deve exibir toast de sucesso', async () => {
      (supabase.from as any) = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const { result } = renderHook(() => useEventosMutations(), {
        wrapper: createWrapper(),
      });

      await result.current.excluirEvento.mutateAsync('evt-123');

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Evento excluído!',
          })
        );
      });
    });
  });

  describe('alterarStatus', () => {
    it('deve alterar status com sucesso', async () => {
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'eventos') {
          return {
            update: mockUpdate,
            eq: mockEq,
          };
        }
        if (table === 'eventos_timeline') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      const { result } = renderHook(() => useEventosMutations(), {
        wrapper: createWrapper(),
      });

      await result.current.alterarStatus.mutateAsync({
        id: 'evt-123',
        novoStatus: 'confirmado',
      });

      await waitFor(() => {
        expect(result.current.alterarStatus.isSuccess).toBe(true);
      });

      expect(mockUpdate).toHaveBeenCalledWith({ status: 'confirmado' });
    });

    it('deve adicionar observação à timeline', async () => {
      const mockInsertTimeline = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'eventos') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === 'eventos_timeline') {
          return {
            insert: mockInsertTimeline,
          };
        }
        return {};
      });

      const { result } = renderHook(() => useEventosMutations(), {
        wrapper: createWrapper(),
      });

      await result.current.alterarStatus.mutateAsync({
        id: 'evt-123',
        novoStatus: 'cancelado',
        observacao: 'Cliente solicitou cancelamento',
      });

      await waitFor(() => {
        expect(mockInsertTimeline).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              descricao: expect.stringContaining('Cliente solicitou cancelamento'),
            })
          ])
        );
      });
    });

    it('deve realizar rollback em caso de erro', async () => {
      const queryClient = new QueryClient();
      queryClient.setQueryData(['eventos'], { eventos: [] });

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'eventos') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: new Error('Erro ao atualizar') }),
          };
        }
        return {};
      });

      const Wrapper = ({ children }: { children: ReactNode }) => {
        return QueryClientProvider({ client: queryClient, children });
      };
      const wrapper = Wrapper;

      const { result } = renderHook(() => useEventosMutations(), { wrapper });

      await expect(
        result.current.alterarStatus.mutateAsync({
          id: 'evt-123',
          novoStatus: 'confirmado',
        })
      ).rejects.toThrow();
    });
  });

  describe('arquivarEvento', () => {
    it('deve arquivar evento com sucesso', async () => {
      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'eventos_materiais_alocados') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            count: 'exact',
          };
        }
        if (table === 'eventos') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === 'eventos_timeline') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      (supabase.from('eventos_materiais_alocados').select as any) = vi.fn().mockReturnThis();
      (supabase.from('eventos_materiais_alocados').select().eq as any) = vi.fn().mockReturnThis();
      (supabase.from('eventos_materiais_alocados').select().eq().eq as any) = vi.fn()
        .mockResolvedValue({ data: [], count: 0 });

      const { result } = renderHook(() => useEventosMutations(), {
        wrapper: createWrapper(),
      });

      await result.current.arquivarEvento.mutateAsync('evt-123');

      await waitFor(() => {
        expect(result.current.arquivarEvento.isSuccess).toBe(true);
      });
    });

    it('deve impedir arquivamento com materiais pendentes', async () => {
      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'eventos_materiais_alocados') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            count: 'exact',
          };
        }
        return {};
      });

      (supabase.from('eventos_materiais_alocados').select as any) = vi.fn().mockReturnThis();
      (supabase.from('eventos_materiais_alocados').select().eq as any) = vi.fn().mockReturnThis();
      (supabase.from('eventos_materiais_alocados').select().eq().eq as any) = vi.fn()
        .mockResolvedValue({ 
          data: [{ id: 'mat-1' }], 
          count: 1 
        });

      const { result } = renderHook(() => useEventosMutations(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.arquivarEvento.mutateAsync('evt-123')
      ).rejects.toThrow('Não é possível arquivar evento com materiais pendentes de devolução');
    });
  });

  describe('Requisitos de autenticação', () => {
    it('deve exigir usuário autenticado para criar evento', async () => {
      (supabase.auth.getUser as any) = vi.fn().mockResolvedValue({
        data: { user: null },
      });

      const { result } = renderHook(() => useEventosMutations(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.adicionarEvento.mutateAsync({
          nome: 'Evento Teste',
          clienteId: 'cli-123',
          comercialId: 'com-123',
          dataInicio: '2024-07-01',
          dataFim: '2024-07-03',
          horaInicio: '10:00',
          horaFim: '22:00',
          local: 'Local Teste',
          cidade: 'SP',
          estado: 'SP',
          endereco: 'Rua',
          tags: [],
        })
      ).rejects.toThrow('Usuário não autenticado');
    });
  });
});
