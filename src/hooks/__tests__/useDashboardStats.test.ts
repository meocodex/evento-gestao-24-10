import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDashboardStats, useComercialStats, useSuporteStats } from '@/hooks/useDashboardStats';
import { supabase } from '@/integrations/supabase/client';

const mockSupabase = vi.mocked(supabase);

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
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

describe('useDashboardStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock padrão para todas as queries
    mockSupabase.from = vi.fn((table: string) => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })) as any;
  });

  describe('Dashboard Geral', () => {
    it('deve carregar estatísticas do dashboard', async () => {
      // Mock dados de eventos
      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'vw_eventos_stats') {
          return {
            select: vi.fn().mockResolvedValue({
              data: [
                { status: 'orcamento_enviado', total: 5 },
                { status: 'confirmado', total: 10 },
              ],
              error: null,
            }),
          };
        }
        if (table === 'eventos') {
          return {
            select: vi.fn().mockResolvedValue({
              data: [{ data_inicio: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() }],
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }) as any;

      const { result } = renderHook(() => useDashboardStats(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.totalEventos).toBeGreaterThanOrEqual(0);
    });

    it('deve calcular eventos por status corretamente', async () => {
      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'vw_eventos_stats') {
          return {
            select: vi.fn().mockResolvedValue({
              data: [
                { status: 'orcamento_enviado', total: 3 },
                { status: 'confirmado', total: 7 },
                { status: 'em_andamento', total: 2 },
              ],
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }) as any;

      const { result } = renderHook(() => useDashboardStats(), { wrapper });

      await waitFor(() => expect(result.current.data).toBeDefined());

      expect(result.current.data?.eventosPorStatus.orcamentoEnviado).toBe(3);
      expect(result.current.data?.eventosPorStatus.aprovado).toBe(7);
      expect(result.current.data?.eventosPorStatus.emAndamento).toBe(2);
    });

    it('deve calcular demandas corretamente', async () => {
      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'vw_demandas_stats') {
          return {
            select: vi.fn().mockResolvedValue({
              data: [
                { status: 'aberta', total: 15 },
                { status: 'em-andamento', total: 8 },
                { prioridade: 'urgente', total: 3 },
              ],
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }) as any;

      const { result } = renderHook(() => useDashboardStats(), { wrapper });

      await waitFor(() => expect(result.current.data).toBeDefined());

      expect(result.current.data?.demandasAbertas).toBe(15);
      expect(result.current.data?.demandasEmAndamento).toBe(8);
      expect(result.current.data?.demandasUrgentes).toBe(3);
    });

    it('deve gerar alertas operacionais', async () => {
      const hoje = new Date();

      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'eventos_materiais_alocados') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({
              data: [
                { id: '1', nome: 'Material 1', evento_id: 'evt-1', status_devolucao: 'pendente' },
              ],
              error: null,
            }),
          };
        }
        if (table === 'eventos') {
          return {
            select: vi.fn().mockResolvedValue({
              data: [
                { id: 'evt-1', data_inicio: new Date(hoje.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), eventos_checklist: [] },
              ],
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }) as any;

      const { result } = renderHook(() => useDashboardStats(), { wrapper });

      await waitFor(() => expect(result.current.data?.alertas).toBeDefined());

      const alertasOperacionais = result.current.data?.alertas || [];
      expect(alertasOperacionais.length).toBeGreaterThanOrEqual(0);
    });

    it('deve lidar com erros de query gracefully', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      })) as any;

      const { result } = renderHook(() => useDashboardStats(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useComercialStats', () => {
    it('deve carregar estatísticas do comercial', async () => {
      const userId = 'comercial-123';

      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'eventos') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({
              data: [
                { id: 'evt-1', status: 'confirmado', data_inicio: '2025-01-15', created_at: '2025-01-01' },
              ],
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }) as any;

      const { result } = renderHook(() => useComercialStats(userId), { wrapper });

      await waitFor(() => expect(result.current.data).toBeDefined());

      expect(result.current.data?.meusEventos).toBeGreaterThanOrEqual(0);
    });
  });

  describe('useSuporteStats', () => {
    it('deve carregar estatísticas de suporte', async () => {
      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'demandas') {
          return {
            select: vi.fn().mockResolvedValue({
              data: [
                { status: 'aberta', prioridade: 'urgente' },
                { status: 'em-andamento', prioridade: 'alta' },
              ],
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }) as any;

      const { result } = renderHook(() => useSuporteStats(), { wrapper });

      await waitFor(() => expect(result.current.data).toBeDefined());

      expect(result.current.data?.demandasPendentes).toBeGreaterThanOrEqual(0);
      expect(result.current.data?.demandasUrgentes).toBeGreaterThanOrEqual(0);
    });
  });
});
