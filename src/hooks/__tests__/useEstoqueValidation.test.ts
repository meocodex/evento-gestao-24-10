import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEstoqueValidation } from '../useEstoqueValidation';
import { supabase } from '@/integrations/supabase/client';

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock do toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe('useEstoqueValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('verificarDisponibilidade', () => {
    it('deve retornar disponível quando há estoque suficiente', async () => {
      const mockMaterial = {
        id: 'mat-1',
        nome: 'Cadeira',
        quantidade_total: 100,
        quantidade_disponivel: 80,
      };

      const mockSeriais = [
        { numero: 'SN001', status: 'disponivel' },
        { numero: 'SN002', status: 'disponivel' },
      ];

      const mockAlocados: any[] = [];

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'materiais_estoque') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockMaterial, error: null }),
          } as any;
        }
        if (table === 'materiais_seriais') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: mockSeriais, error: null }),
            })),
          } as any;
        }
        if (table === 'eventos_materiais_alocados') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({ data: mockAlocados, error: null }),
          } as any;
        }
        return {} as any;
      });

      const { result } = renderHook(() => useEstoqueValidation());

      let response: any;
      await act(async () => {
        response = await result.current.verificarDisponibilidade('mat-1', 2);
      });

      expect(response.disponivel).toBe(true);
      expect(response.detalhes).toEqual({
        itemId: 'mat-1',
        nome: 'Cadeira',
        disponiveis: 2,
        alocados: 0,
        total: 100,
      });
      expect(mockToast).not.toHaveBeenCalled();
    });

    it('deve retornar indisponível quando não há estoque suficiente', async () => {
      const mockMaterial = {
        id: 'mat-1',
        nome: 'Cadeira',
        quantidade_total: 100,
        quantidade_disponivel: 1,
      };

      const mockSeriais = [{ numero: 'SN001', status: 'disponivel' }];
      const mockAlocados: any[] = [];

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'materiais_estoque') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockMaterial, error: null }),
          } as any;
        }
        if (table === 'materiais_seriais') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: mockSeriais, error: null }),
            })),
          } as any;
        }
        if (table === 'eventos_materiais_alocados') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({ data: mockAlocados, error: null }),
          } as any;
        }
        return {} as any;
      });

      const { result } = renderHook(() => useEstoqueValidation());

      let response: any;
      await act(async () => {
        response = await result.current.verificarDisponibilidade('mat-1', 5);
      });

      expect(response.disponivel).toBe(false);
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Material indisponível',
        description: expect.stringContaining('apenas 1 disponível(is) de 5 solicitado(s)'),
        variant: 'destructive',
      });
    });

    it('deve excluir materiais já alocados para o mesmo evento', async () => {
      const mockMaterial = {
        id: 'mat-1',
        nome: 'Cadeira',
        quantidade_total: 100,
        quantidade_disponivel: 50,
      };

      const mockSeriais = Array.from({ length: 10 }, (_, i) => ({
        numero: `SN${String(i + 1).padStart(3, '0')}`,
        status: 'disponivel',
      }));

      const mockAlocados = [
        { item_id: 'mat-1', evento_id: 'evt-1' },
        { item_id: 'mat-1', evento_id: 'evt-1' },
        { item_id: 'mat-1', evento_id: 'evt-2' },
      ];

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'materiais_estoque') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockMaterial, error: null }),
          } as any;
        }
        if (table === 'materiais_seriais') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: mockSeriais, error: null }),
            })),
          } as any;
        }
        if (table === 'eventos_materiais_alocados') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({ data: mockAlocados, error: null }),
          } as any;
        }
        return {} as any;
      });

      const { result } = renderHook(() => useEstoqueValidation());

      let response: any;
      await act(async () => {
        response = await result.current.verificarDisponibilidade('mat-1', 5, 'evt-1');
      });

      // Deve considerar apenas 1 alocado (do evt-2), ignorando os 2 do evt-1
      expect(response.detalhes?.alocados).toBe(1);
      expect(response.detalhes?.disponiveis).toBe(9); // 10 seriais - 1 alocado
    });

    it('deve lidar com erro ao buscar material', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Material não encontrado' } 
        }),
      } as any));

      const { result } = renderHook(() => useEstoqueValidation());

      let response: any;
      await act(async () => {
        response = await result.current.verificarDisponibilidade('mat-999', 5);
      });

      expect(response.disponivel).toBe(false);
      expect(response.detalhes).toBe(null);
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Erro ao verificar disponibilidade',
        description: expect.any(String),
        variant: 'destructive',
      });
    });
  });

  describe('verificarConflitos', () => {
    it('deve detectar conflitos de data', async () => {
      const mockEventosConflito = [
        {
          id: 'evt-2',
          nome: 'Evento Conflitante',
          data_inicio: '2024-01-15',
          data_fim: '2024-01-20',
          materiais_alocados: [{ item_id: 'mat-1', status: 'reservado' }],
        },
      ];

      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockEventosConflito, error: null }),
      } as any));

      const { result } = renderHook(() => useEstoqueValidation());

      let response: any;
      await act(async () => {
        response = await result.current.verificarConflitos(
          'mat-1',
          '2024-01-18',
          '2024-01-22'
        );
      });

      expect(response.temConflito).toBe(true);
      expect(response.eventos).toHaveLength(1);
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Conflito de agenda',
        description: expect.stringContaining('1 evento(s) no mesmo período'),
        variant: 'destructive',
      });
    });

    it('não deve contar o evento atual como conflito', async () => {
      const mockEventosConflito = [
        {
          id: 'evt-1',
          nome: 'Evento Atual',
          data_inicio: '2024-01-15',
          data_fim: '2024-01-20',
          materiais_alocados: [{ item_id: 'mat-1', status: 'reservado' }],
        },
      ];

      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockEventosConflito, error: null }),
      } as any));

      const { result } = renderHook(() => useEstoqueValidation());

      let response: any;
      await act(async () => {
        response = await result.current.verificarConflitos(
          'mat-1',
          '2024-01-18',
          '2024-01-22',
          'evt-1' // Mesmo evento
        );
      });

      expect(response.temConflito).toBe(false);
      expect(response.eventos).toHaveLength(0);
      expect(mockToast).not.toHaveBeenCalled();
    });
  });

  describe('reservarMaterial', () => {
    it('deve reservar material com sucesso', async () => {
      const mockMaterial = {
        quantidade_disponivel: 10,
      };

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'materiais_seriais') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ error: null }),
            })),
          } as any;
        }
        if (table === 'materiais_estoque') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockMaterial, error: null }),
            update: vi.fn().mockReturnThis(),
          } as any;
        }
        return {} as any;
      });

      const { result } = renderHook(() => useEstoqueValidation());

      let response: boolean = false;
      await act(async () => {
        response = await result.current.reservarMaterial('mat-1', 'SN001', 'evt-1');
      });

      expect(response).toBe(true);
      expect(mockToast).not.toHaveBeenCalled();
    });

    it('deve lidar com erro ao reservar', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ 
            error: { message: 'Erro ao atualizar' } 
          }),
        })),
      } as any));

      const { result } = renderHook(() => useEstoqueValidation());

      let response: boolean = true;
      await act(async () => {
        response = await result.current.reservarMaterial('mat-1', 'SN001', 'evt-1');
      });

      expect(response).toBe(false);
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Erro ao reservar material',
        description: expect.any(String),
        variant: 'destructive',
      });
    });
  });

  describe('liberarMaterial', () => {
    it('deve liberar material com sucesso', async () => {
      const mockMaterial = {
        quantidade_disponivel: 5,
        quantidade_total: 10,
      };

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'materiais_seriais') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          } as any;
        }
        if (table === 'materiais_estoque') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockMaterial, error: null }),
            update: vi.fn().mockReturnThis(),
          } as any;
        }
        return {} as any;
      });

      const { result } = renderHook(() => useEstoqueValidation());

      let response: boolean = false;
      await act(async () => {
        response = await result.current.liberarMaterial('mat-1', 'SN001');
      });

      expect(response).toBe(true);
      expect(mockToast).not.toHaveBeenCalled();
    });

    it('não deve incrementar além do total', async () => {
      const mockMaterial = {
        quantidade_disponivel: 10,
        quantidade_total: 10,
      };

      const updateSpy = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'materiais_seriais') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          } as any;
        }
        if (table === 'materiais_estoque') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockMaterial, error: null }),
            update: updateSpy,
          } as any;
        }
        return {} as any;
      });

      const { result } = renderHook(() => useEstoqueValidation());

      await act(async () => {
        await result.current.liberarMaterial('mat-1', 'SN001');
      });

      // Não deve ter chamado update no estoque pois já está no máximo
      expect(updateSpy).not.toHaveBeenCalled();
    });
  });

  describe('isValidating', () => {
    it('deve indicar quando está validando', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve({ data: null, error: null }), 100))
        ),
      } as any));

      const { result } = renderHook(() => useEstoqueValidation());

      expect(result.current.isValidating).toBe(false);

      act(() => {
        result.current.verificarDisponibilidade('mat-1', 5);
      });

      // Deve estar validando após iniciar a chamada
      expect(result.current.isValidating).toBe(true);
    });
  });
});
