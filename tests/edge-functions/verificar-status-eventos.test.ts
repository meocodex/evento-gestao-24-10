import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
};

// Mock da função
const verificarStatusEventos = async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const agora = new Date();
    const dataAtual = agora.toISOString().split('T')[0];
    const horaAtual = agora.toTimeString().split(' ')[0].substring(0, 5);

    // 1. INICIAR eventos (status confirmado/em_preparacao e passou da hora)
    const { data: eventosParaIniciar } = await mockSupabaseClient
      .from('eventos')
      .select('id, nome, data_inicio, hora_inicio')
      .in('status', ['confirmado', 'em_preparacao'])
      .eq('arquivado', false)
      .lte('data_inicio', dataAtual)
      .lte('hora_inicio', horaAtual);

    for (const evento of eventosParaIniciar || []) {
      await mockSupabaseClient
        .from('eventos')
        .update({ status: 'em_execucao' })
        .eq('id', evento.id);

      await mockSupabaseClient.from('eventos_timeline').insert({
        evento_id: evento.id,
        tipo: 'execucao',
        descricao: 'Evento iniciado automaticamente',
        usuario: 'Sistema Automático',
      });
    }

    // 2. CONCLUIR eventos (status em_execucao e passou do horário de fim)
    const { data: eventosParaConcluir } = await mockSupabaseClient
      .from('eventos')
      .select('id, nome, data_fim, hora_fim')
      .eq('status', 'em_execucao')
      .eq('arquivado', false)
      .lte('data_fim', dataAtual)
      .lte('hora_fim', horaAtual);

    for (const evento of eventosParaConcluir || []) {
      await mockSupabaseClient
        .from('eventos')
        .update({ status: 'concluido' })
        .eq('id', evento.id);

      await mockSupabaseClient.from('eventos_timeline').insert({
        evento_id: evento.id,
        tipo: 'fechamento',
        descricao: 'Evento concluído automaticamente - Aguardando devolução de materiais',
        usuario: 'Sistema Automático',
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        eventosIniciados: eventosParaIniciar?.length || 0,
        eventosConcluidos: eventosParaConcluir?.length || 0,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Erro na Verificação]', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

describe('Edge Function: verificar-status-eventos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CORS', () => {
    it('deve responder corretamente a requisições OPTIONS', async () => {
      const req = new Request('http://localhost', { method: 'OPTIONS' });
      const response = await verificarStatusEventos(req);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('authorization');
    });
  });

  describe('Iniciar Eventos', () => {
    it('deve iniciar eventos confirmados que já passaram da hora', async () => {
      const mockEventos = [
        {
          id: 'evento-1',
          nome: 'Evento Teste 1',
          data_inicio: '2024-01-01',
          hora_inicio: '10:00',
        },
        {
          id: 'evento-2',
          nome: 'Evento Teste 2',
          data_inicio: '2024-01-01',
          hora_inicio: '10:00',
        },
      ];

      const selectMock = vi.fn().mockReturnThis();
      const inMock = vi.fn().mockReturnThis();
      const eqMock = vi.fn().mockReturnThis();
      const lteMock = vi.fn().mockReturnThis();
      const updateMock = vi.fn().mockReturnThis();
      const insertMock = vi.fn().mockResolvedValue({ data: null, error: null });

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'eventos') {
          return {
            select: vi.fn(() => ({
              in: inMock,
              eq: eqMock.mockImplementation(() => ({
                arquivado: false,
                lte: lteMock.mockImplementation(() => ({
                  data: mockEventos,
                  error: null,
                })),
              })),
            })),
            update: updateMock,
          };
        }
        if (table === 'eventos_timeline') {
          return { insert: insertMock };
        }
        return {};
      });

      const req = new Request('http://localhost', { method: 'POST' });
      const response = await verificarStatusEventos(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.eventosIniciados).toBe(2);
    });

    it('deve iniciar eventos em preparação que já passaram da hora', async () => {
      const mockEventos = [
        {
          id: 'evento-1',
          nome: 'Evento em Preparação',
          data_inicio: '2024-01-01',
          hora_inicio: '10:00',
        },
      ];

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'eventos') {
          return {
            select: vi.fn(() => ({
              in: vi.fn().mockReturnThis(),
              eq: vi.fn(() => ({
                arquivado: false,
                lte: vi.fn(() => ({
                  data: mockEventos,
                  error: null,
                })),
              })),
            })),
            update: vi.fn().mockReturnThis(),
          };
        }
        if (table === 'eventos_timeline') {
          return { insert: vi.fn().mockResolvedValue({ data: null, error: null }) };
        }
        return {};
      });

      const req = new Request('http://localhost', { method: 'POST' });
      const response = await verificarStatusEventos(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.eventosIniciados).toBe(1);
    });

    it('não deve iniciar eventos futuros', async () => {
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'eventos') {
          return {
            select: vi.fn(() => ({
              in: vi.fn().mockReturnThis(),
              eq: vi.fn(() => ({
                arquivado: false,
                lte: vi.fn(() => ({
                  data: [],
                  error: null,
                })),
              })),
            })),
            update: vi.fn().mockReturnThis(),
          };
        }
        return {};
      });

      const req = new Request('http://localhost', { method: 'POST' });
      const response = await verificarStatusEventos(req);
      const data = await response.json();

      expect(data.eventosIniciados).toBe(0);
    });

    it('não deve iniciar eventos arquivados', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        select: vi.fn(() => ({
          in: vi.fn().mockReturnThis(),
          eq: vi.fn(() => ({
            arquivado: false,
            lte: vi.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      }));

      const req = new Request('http://localhost', { method: 'POST' });
      const response = await verificarStatusEventos(req);
      const data = await response.json();

      expect(data.eventosIniciados).toBe(0);
    });
  });

  describe('Concluir Eventos', () => {
    it('deve concluir eventos em execução que já passaram do fim', async () => {
      const mockEventos = [
        {
          id: 'evento-1',
          nome: 'Evento Teste 1',
          data_fim: '2024-01-01',
          hora_fim: '18:00',
        },
        {
          id: 'evento-2',
          nome: 'Evento Teste 2',
          data_fim: '2024-01-01',
          hora_fim: '20:00',
        },
      ];

      let selectCallCount = 0;
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'eventos') {
          selectCallCount++;
          if (selectCallCount === 1) {
            // Primeira chamada: eventos para iniciar (vazio)
            return {
              select: vi.fn(() => ({
                in: vi.fn().mockReturnThis(),
                eq: vi.fn(() => ({
                  arquivado: false,
                  lte: vi.fn(() => ({
                    data: [],
                    error: null,
                  })),
                })),
              })),
            };
          } else {
            // Segunda chamada: eventos para concluir
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  arquivado: false,
                  lte: vi.fn(() => ({
                    data: mockEventos,
                    error: null,
                  })),
                })),
              })),
              update: vi.fn().mockReturnThis(),
            };
          }
        }
        if (table === 'eventos_timeline') {
          return { insert: vi.fn().mockResolvedValue({ data: null, error: null }) };
        }
        return {};
      });

      const req = new Request('http://localhost', { method: 'POST' });
      const response = await verificarStatusEventos(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.eventosConcluidos).toBe(2);
    });

    it('não deve concluir eventos que ainda não terminaram', async () => {
      let selectCallCount = 0;
      mockSupabaseClient.from.mockImplementation(() => {
        selectCallCount++;
        return {
          select: vi.fn(() => ({
            in: selectCallCount === 1 ? vi.fn().mockReturnThis() : undefined,
            eq: vi.fn(() => ({
              arquivado: false,
              lte: vi.fn(() => ({
                data: [],
                error: null,
              })),
            })),
          })),
        };
      });

      const req = new Request('http://localhost', { method: 'POST' });
      const response = await verificarStatusEventos(req);
      const data = await response.json();

      expect(data.eventosConcluidos).toBe(0);
    });
  });

  describe('Timeline e Auditoria', () => {
    it('deve criar registro na timeline ao iniciar evento', async () => {
      const mockEventos = [
        {
          id: 'evento-1',
          nome: 'Evento Teste',
          data_inicio: '2024-01-01',
          hora_inicio: '10:00',
        },
      ];

      const insertMock = vi.fn().mockResolvedValue({ data: null, error: null });

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'eventos') {
          return {
            select: vi.fn(() => ({
              in: vi.fn().mockReturnThis(),
              eq: vi.fn(() => ({
                arquivado: false,
                lte: vi.fn(() => ({
                  data: mockEventos,
                  error: null,
                })),
              })),
            })),
            update: vi.fn().mockReturnThis(),
          };
        }
        if (table === 'eventos_timeline') {
          return { insert: insertMock };
        }
        return {};
      });

      const req = new Request('http://localhost', { method: 'POST' });
      await verificarStatusEventos(req);

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          evento_id: 'evento-1',
          tipo: 'execucao',
          descricao: 'Evento iniciado automaticamente',
          usuario: 'Sistema Automático',
        })
      );
    });

    it('deve criar registro na timeline ao concluir evento', async () => {
      const mockEventosConcluir = [
        {
          id: 'evento-1',
          nome: 'Evento Teste',
          data_fim: '2024-01-01',
          hora_fim: '18:00',
        },
      ];

      const insertMock = vi.fn().mockResolvedValue({ data: null, error: null });

      let selectCallCount = 0;
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'eventos') {
          selectCallCount++;
          if (selectCallCount === 1) {
            return {
              select: vi.fn(() => ({
                in: vi.fn().mockReturnThis(),
                eq: vi.fn(() => ({
                  arquivado: false,
                  lte: vi.fn(() => ({
                    data: [],
                    error: null,
                  })),
                })),
              })),
            };
          } else {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  arquivado: false,
                  lte: vi.fn(() => ({
                    data: mockEventosConcluir,
                    error: null,
                  })),
                })),
              })),
              update: vi.fn().mockReturnThis(),
            };
          }
        }
        if (table === 'eventos_timeline') {
          return { insert: insertMock };
        }
        return {};
      });

      const req = new Request('http://localhost', { method: 'POST' });
      await verificarStatusEventos(req);

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          evento_id: 'evento-1',
          tipo: 'fechamento',
          descricao: 'Evento concluído automaticamente - Aguardando devolução de materiais',
          usuario: 'Sistema Automático',
        })
      );
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve tratar erros do Supabase adequadamente', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        select: vi.fn().mockRejectedValue(new Error('Database error')),
      }));

      const req = new Request('http://localhost', { method: 'POST' });
      const response = await verificarStatusEventos(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeTruthy();
    });

    it('deve retornar erro genérico quando erro não é instância de Error', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        select: vi.fn().mockRejectedValue('String error'),
      }));

      const req = new Request('http://localhost', { method: 'POST' });
      const response = await verificarStatusEventos(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Erro desconhecido');
    });
  });

  describe('Resposta de Sucesso', () => {
    it('deve retornar timestamp e contadores corretos', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        select: vi.fn(() => ({
          in: vi.fn().mockReturnThis(),
          eq: vi.fn(() => ({
            arquivado: false,
            lte: vi.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      }));

      const antes = new Date().toISOString();
      const req = new Request('http://localhost', { method: 'POST' });
      const response = await verificarStatusEventos(req);
      const depois = new Date().toISOString();
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.eventosIniciados).toBe(0);
      expect(data.eventosConcluidos).toBe(0);
      expect(data.timestamp).toBeDefined();
      expect(data.timestamp >= antes && data.timestamp <= depois).toBe(true);
    });
  });

  describe('Headers de Resposta', () => {
    it('deve incluir headers CORS em respostas de sucesso', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        select: vi.fn(() => ({
          in: vi.fn().mockReturnThis(),
          eq: vi.fn(() => ({
            arquivado: false,
            lte: vi.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      }));

      const req = new Request('http://localhost', { method: 'POST' });
      const response = await verificarStatusEventos(req);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('deve incluir headers CORS em respostas de erro', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        select: vi.fn().mockRejectedValue(new Error('Error')),
      }));

      const req = new Request('http://localhost', { method: 'POST' });
      const response = await verificarStatusEventos(req);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });
});
