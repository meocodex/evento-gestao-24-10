import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
};

// Mock da função
const validarRemocaoMaterial = async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { alocacaoId } = await req.json();

    if (!alocacaoId) {
      return new Response(
        JSON.stringify({ 
          podeRemover: false, 
          motivo: 'ID da alocação não fornecido' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { data: alocacao, error } = await mockSupabaseClient
      .from('eventos_materiais_alocados')
      .select(`
        *,
        eventos (
          id,
          status,
          data_inicio,
          hora_inicio
        )
      `)
      .eq('id', alocacaoId)
      .single();

    if (error || !alocacao) {
      return new Response(
        JSON.stringify({ 
          podeRemover: false, 
          motivo: 'Alocação não encontrada' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validação 1: Evento já iniciou
    const agora = new Date();
    const dataEvento = new Date(`${alocacao.eventos.data_inicio}T${alocacao.eventos.hora_inicio}`);
    
    if (dataEvento <= agora) {
      return new Response(
        JSON.stringify({ 
          podeRemover: false, 
          motivo: 'Não é possível remover material de evento já iniciado' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validação 2: Material vinculado a frete
    if (alocacao.vinculado_frete) {
      return new Response(
        JSON.stringify({ 
          podeRemover: false, 
          motivo: 'Material está vinculado a um frete e não pode ser removido' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validação 3: Material já devolvido
    if (alocacao.devolvido) {
      return new Response(
        JSON.stringify({ 
          podeRemover: false, 
          motivo: 'Material já foi devolvido e não pode ser removido' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validação 4: Status do evento
    const statusPermitidos = ['em_negociacao', 'confirmado'];
    if (!statusPermitidos.includes(alocacao.eventos.status)) {
      return new Response(
        JSON.stringify({ 
          podeRemover: false, 
          motivo: `Material não pode ser removido com evento no status: ${alocacao.eventos.status}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ podeRemover: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao validar remoção:', error);
    return new Response(
      JSON.stringify({ 
        podeRemover: false, 
        motivo: error instanceof Error ? error.message : 'Erro interno' 
      }),
      { 
        status: 500, 
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
};

describe('Edge Function: validar-remocao-material', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CORS', () => {
    it('deve responder corretamente a requisições OPTIONS', async () => {
      const req = new Request('http://localhost', { method: 'OPTIONS' });
      const response = await validarRemocaoMaterial(req);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('authorization');
    });
  });

  describe('Validação de Input', () => {
    it('deve retornar erro quando alocacaoId não é fornecido', async () => {
      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await validarRemocaoMaterial(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.podeRemover).toBe(false);
      expect(data.motivo).toContain('ID da alocação não fornecido');
    });

    it('deve retornar erro quando alocação não existe', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      });

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ alocacaoId: 'invalid-id' }),
      });

      const response = await validarRemocaoMaterial(req);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.podeRemover).toBe(false);
      expect(data.motivo).toContain('Alocação não encontrada');
    });
  });

  describe('Regras de Negócio', () => {
    it('deve bloquear remoção de material de evento já iniciado', async () => {
      const dataPassada = new Date();
      dataPassada.setHours(dataPassada.getHours() - 2);

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'alocacao-1',
            vinculado_frete: false,
            devolvido: false,
            eventos: {
              id: 'evento-1',
              status: 'confirmado',
              data_inicio: dataPassada.toISOString().split('T')[0],
              hora_inicio: dataPassada.toTimeString().split(' ')[0].substring(0, 5),
            },
          },
          error: null,
        }),
      });

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ alocacaoId: 'alocacao-1' }),
      });

      const response = await validarRemocaoMaterial(req);
      const data = await response.json();

      expect(data.podeRemover).toBe(false);
      expect(data.motivo).toContain('evento já iniciado');
    });

    it('deve bloquear remoção de material vinculado a frete', async () => {
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 1);

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'alocacao-1',
            vinculado_frete: true,
            devolvido: false,
            eventos: {
              id: 'evento-1',
              status: 'confirmado',
              data_inicio: dataFutura.toISOString().split('T')[0],
              hora_inicio: '10:00',
            },
          },
          error: null,
        }),
      });

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ alocacaoId: 'alocacao-1' }),
      });

      const response = await validarRemocaoMaterial(req);
      const data = await response.json();

      expect(data.podeRemover).toBe(false);
      expect(data.motivo).toContain('vinculado a um frete');
    });

    it('deve bloquear remoção de material já devolvido', async () => {
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 1);

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'alocacao-1',
            vinculado_frete: false,
            devolvido: true,
            eventos: {
              id: 'evento-1',
              status: 'confirmado',
              data_inicio: dataFutura.toISOString().split('T')[0],
              hora_inicio: '10:00',
            },
          },
          error: null,
        }),
      });

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ alocacaoId: 'alocacao-1' }),
      });

      const response = await validarRemocaoMaterial(req);
      const data = await response.json();

      expect(data.podeRemover).toBe(false);
      expect(data.motivo).toContain('já foi devolvido');
    });

    it('deve bloquear remoção quando evento não está em status permitido', async () => {
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 1);

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'alocacao-1',
            vinculado_frete: false,
            devolvido: false,
            eventos: {
              id: 'evento-1',
              status: 'em_execucao',
              data_inicio: dataFutura.toISOString().split('T')[0],
              hora_inicio: '10:00',
            },
          },
          error: null,
        }),
      });

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ alocacaoId: 'alocacao-1' }),
      });

      const response = await validarRemocaoMaterial(req);
      const data = await response.json();

      expect(data.podeRemover).toBe(false);
      expect(data.motivo).toContain('status: em_execucao');
    });

    it('deve permitir remoção quando todas as validações passam', async () => {
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 1);

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'alocacao-1',
            vinculado_frete: false,
            devolvido: false,
            eventos: {
              id: 'evento-1',
              status: 'confirmado',
              data_inicio: dataFutura.toISOString().split('T')[0],
              hora_inicio: '10:00',
            },
          },
          error: null,
        }),
      });

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ alocacaoId: 'alocacao-1' }),
      });

      const response = await validarRemocaoMaterial(req);
      const data = await response.json();

      expect(data.podeRemover).toBe(true);
      expect(data.motivo).toBeUndefined();
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve tratar erros do Supabase adequadamente', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockRejectedValue(new Error('Database error')),
      });

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ alocacaoId: 'alocacao-1' }),
      });

      const response = await validarRemocaoMaterial(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.podeRemover).toBe(false);
      expect(data.motivo).toBeTruthy();
    });
  });

  describe('Headers de Resposta', () => {
    it('deve incluir headers CORS em respostas de sucesso', async () => {
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 1);

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'alocacao-1',
            vinculado_frete: false,
            devolvido: false,
            eventos: {
              id: 'evento-1',
              status: 'confirmado',
              data_inicio: dataFutura.toISOString().split('T')[0],
              hora_inicio: '10:00',
            },
          },
          error: null,
        }),
      });

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ alocacaoId: 'alocacao-1' }),
      });

      const response = await validarRemocaoMaterial(req);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('deve incluir headers CORS em respostas de erro', async () => {
      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await validarRemocaoMaterial(req);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });
});
