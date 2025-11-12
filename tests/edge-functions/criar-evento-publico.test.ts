import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
};

// Funções auxiliares de validação
const validarCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  return digit === parseInt(cpf.charAt(10));
};

const validarCNPJ = (cnpj: string): boolean => {
  cnpj = cnpj.replace(/[^\d]/g, '');
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(1));
};

// Mock da função
const criarEventoPublico = async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { produtor, evento, configuracoes } = await req.json();

    // Validação de CPF/CNPJ
    const documento = produtor.cpf || produtor.cnpj;
    if (!documento) {
      return new Response(
        JSON.stringify({ error: 'CPF ou CNPJ é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isCPF = documento.length === 11 || documento.replace(/[^\d]/g, '').length === 11;
    const isValid = isCPF ? validarCPF(documento) : validarCNPJ(documento);

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: `${isCPF ? 'CPF' : 'CNPJ'} inválido` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validação de representante legal para CNPJ
    if (!isCPF) {
      if (!produtor.nomeRepresentanteLegal || !produtor.cpfRepresentanteLegal) {
        return new Response(
          JSON.stringify({ error: 'Dados do representante legal são obrigatórios para CNPJ' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!validarCPF(produtor.cpfRepresentanteLegal)) {
        return new Response(
          JSON.stringify({ error: 'CPF do representante legal inválido' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validação de idade do representante
      const dataNascimento = new Date(produtor.dataNascimentoRepresentante);
      const idade = new Date().getFullYear() - dataNascimento.getFullYear();
      if (idade < 18) {
        return new Response(
          JSON.stringify({ error: 'Representante legal deve ser maior de 18 anos' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Buscar ou criar cliente
    const { data: clienteExistente } = await mockSupabaseClient
      .from('clientes')
      .select('*')
      .eq(isCPF ? 'cpf' : 'cnpj', documento.replace(/[^\d]/g, ''))
      .maybeSingle();

    let clienteId;

    if (clienteExistente) {
      // Atualizar cliente existente
      const { data: clienteAtualizado } = await mockSupabaseClient
        .from('clientes')
        .update({
          nome: produtor.nome,
          email: produtor.email,
          telefone: produtor.telefone,
          whatsapp: produtor.whatsapp,
        })
        .eq('id', clienteExistente.id)
        .select()
        .single();

      clienteId = clienteAtualizado.id;
    } else {
      // Criar novo cliente
      const { data: novoCliente } = await mockSupabaseClient
        .from('clientes')
        .insert({
          nome: produtor.nome,
          email: produtor.email,
          telefone: produtor.telefone,
          whatsapp: produtor.whatsapp,
          cpf: isCPF ? documento.replace(/[^\d]/g, '') : null,
          cnpj: !isCPF ? documento.replace(/[^\d]/g, '') : null,
          tipo: 'produtor',
        })
        .select()
        .single();

      clienteId = novoCliente.id;
    }

    // Criar evento
    const { data: novoEvento } = await mockSupabaseClient
      .from('eventos')
      .insert({
        nome: evento.nome,
        data_inicio: evento.dataInicio,
        hora_inicio: evento.horaInicio,
        data_fim: evento.dataFim,
        hora_fim: evento.horaFim,
        local: evento.local,
        cidade: evento.cidade,
        estado: evento.estado,
        cliente_id: clienteId,
        status: 'orcamento',
        origem: 'publico',
      })
      .select()
      .single();

    // Registrar cadastro público
    await mockSupabaseClient.from('cadastros_publicos').insert({
      evento_id: novoEvento.id,
      cliente_id: clienteId,
      dados_completos: { produtor, evento, configuracoes },
    });

    // Criar timeline
    await mockSupabaseClient.from('eventos_timeline').insert({
      evento_id: novoEvento.id,
      tipo: 'cadastro',
      descricao: 'Evento criado através de cadastro público',
      usuario: produtor.nome,
    });

    return new Response(
      JSON.stringify({
        success: true,
        evento: novoEvento,
        cliente: { id: clienteId },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao criar evento público:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Erro interno',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

describe('Edge Function: criar-evento-publico', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const requestBase = {
    produtor: {
      nome: 'João Silva',
      email: 'joao@example.com',
      telefone: '11999999999',
      whatsapp: '11999999999',
      cpf: '123.456.789-09',
    },
    evento: {
      nome: 'Festa Teste',
      dataInicio: '2024-12-01',
      horaInicio: '20:00',
      dataFim: '2024-12-02',
      horaFim: '02:00',
      local: 'Espaço Teste',
      cidade: 'São Paulo',
      estado: 'SP',
    },
    configuracoes: {},
  };

  describe('CORS', () => {
    it('deve responder corretamente a requisições OPTIONS', async () => {
      const req = new Request('http://localhost', { method: 'OPTIONS' });
      const response = await criarEventoPublico(req);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });
  });

  describe('Validação de CPF', () => {
    it('deve aceitar CPF válido', async () => {
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'clientes') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: null }),
              })),
            })),
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'cliente-1', nome: 'João Silva' },
                }),
              })),
            })),
          };
        }
        if (table === 'eventos') {
          return {
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'evento-1', nome: 'Festa Teste' },
                }),
              })),
            })),
          };
        }
        if (table === 'cadastros_publicos' || table === 'eventos_timeline') {
          return {
            insert: vi.fn().mockResolvedValue({ data: null }),
          };
        }
        return {};
      });

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify(requestBase),
      });

      const response = await criarEventoPublico(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('deve rejeitar CPF inválido', async () => {
      const requestInvalid = {
        ...requestBase,
        produtor: { ...requestBase.produtor, cpf: '111.111.111-11' },
      };

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify(requestInvalid),
      });

      const response = await criarEventoPublico(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('CPF inválido');
    });

    it('deve exigir CPF ou CNPJ', async () => {
      const requestSemDocumento = {
        ...requestBase,
        produtor: { ...requestBase.produtor, cpf: undefined },
      };

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify(requestSemDocumento),
      });

      const response = await criarEventoPublico(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('CPF ou CNPJ é obrigatório');
    });
  });

  describe('Validação de CNPJ', () => {
    it('deve aceitar CNPJ válido com representante legal', async () => {
      const requestCNPJ = {
        ...requestBase,
        produtor: {
          nome: 'Empresa Teste LTDA',
          email: 'contato@empresa.com',
          telefone: '11999999999',
          whatsapp: '11999999999',
          cnpj: '11.222.333/0001-81',
          nomeRepresentanteLegal: 'Maria Silva',
          cpfRepresentanteLegal: '123.456.789-09',
          dataNascimentoRepresentante: '1990-01-01',
        },
      };

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'clientes') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: null }),
              })),
            })),
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'cliente-1', nome: 'Empresa Teste' },
                }),
              })),
            })),
          };
        }
        if (table === 'eventos') {
          return {
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'evento-1', nome: 'Festa Teste' },
                }),
              })),
            })),
          };
        }
        if (table === 'cadastros_publicos' || table === 'eventos_timeline') {
          return {
            insert: vi.fn().mockResolvedValue({ data: null }),
          };
        }
        return {};
      });

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify(requestCNPJ),
      });

      const response = await criarEventoPublico(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('deve rejeitar CNPJ sem representante legal', async () => {
      const requestCNPJ = {
        ...requestBase,
        produtor: {
          ...requestBase.produtor,
          cpf: undefined,
          cnpj: '11.222.333/0001-81',
        },
      };

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify(requestCNPJ),
      });

      const response = await criarEventoPublico(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('representante legal');
    });

    it('deve rejeitar representante legal menor de 18 anos', async () => {
      const dataRecente = new Date();
      dataRecente.setFullYear(dataRecente.getFullYear() - 17);

      const requestCNPJ = {
        ...requestBase,
        produtor: {
          nome: 'Empresa Teste LTDA',
          email: 'contato@empresa.com',
          telefone: '11999999999',
          whatsapp: '11999999999',
          cnpj: '11.222.333/0001-81',
          nomeRepresentanteLegal: 'João Menor',
          cpfRepresentanteLegal: '123.456.789-09',
          dataNascimentoRepresentante: dataRecente.toISOString().split('T')[0],
        },
      };

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify(requestCNPJ),
      });

      const response = await criarEventoPublico(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('maior de 18 anos');
    });
  });

  describe('Gestão de Clientes', () => {
    it('deve criar novo cliente quando não existe', async () => {
      const insertMock = vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { id: 'cliente-novo', nome: 'João Silva' },
          }),
        })),
      }));

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'clientes') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: null }),
              })),
            })),
            insert: insertMock,
          };
        }
        if (table === 'eventos') {
          return {
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'evento-1' },
                }),
              })),
            })),
          };
        }
        if (table === 'cadastros_publicos' || table === 'eventos_timeline') {
          return {
            insert: vi.fn().mockResolvedValue({ data: null }),
          };
        }
        return {};
      });

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify(requestBase),
      });

      await criarEventoPublico(req);

      expect(insertMock).toHaveBeenCalled();
    });

    it('deve atualizar cliente existente', async () => {
      const updateMock = vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { id: 'cliente-existente', nome: 'João Silva' },
            }),
          })),
        })),
      }));

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'clientes') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: 'cliente-existente', nome: 'João Silva' },
                }),
              })),
            })),
            update: updateMock,
          };
        }
        if (table === 'eventos') {
          return {
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'evento-1' },
                }),
              })),
            })),
          };
        }
        if (table === 'cadastros_publicos' || table === 'eventos_timeline') {
          return {
            insert: vi.fn().mockResolvedValue({ data: null }),
          };
        }
        return {};
      });

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify(requestBase),
      });

      await criarEventoPublico(req);

      expect(updateMock).toHaveBeenCalled();
    });
  });

  describe('Criação de Evento', () => {
    it('deve criar evento com status orcamento', async () => {
      const insertMock = vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'evento-1',
              status: 'orcamento',
              origem: 'publico',
            },
          }),
        })),
      }));

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'clientes') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: null }),
              })),
            })),
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'cliente-1' },
                }),
              })),
            })),
          };
        }
        if (table === 'eventos') {
          return { insert: insertMock };
        }
        if (table === 'cadastros_publicos' || table === 'eventos_timeline') {
          return {
            insert: vi.fn().mockResolvedValue({ data: null }),
          };
        }
        return {};
      });

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify(requestBase),
      });

      const response = await criarEventoPublico(req);
      const data = await response.json();

      expect(data.evento.status).toBe('orcamento');
      expect(data.evento.origem).toBe('publico');
    });

    it('deve registrar no cadastros_publicos', async () => {
      const insertPublicoMock = vi.fn().mockResolvedValue({ data: null });

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'clientes') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: null }),
              })),
            })),
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'cliente-1' },
                }),
              })),
            })),
          };
        }
        if (table === 'eventos') {
          return {
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'evento-1' },
                }),
              })),
            })),
          };
        }
        if (table === 'cadastros_publicos') {
          return { insert: insertPublicoMock };
        }
        if (table === 'eventos_timeline') {
          return {
            insert: vi.fn().mockResolvedValue({ data: null }),
          };
        }
        return {};
      });

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify(requestBase),
      });

      await criarEventoPublico(req);

      expect(insertPublicoMock).toHaveBeenCalledWith(
        expect.objectContaining({
          evento_id: 'evento-1',
          cliente_id: 'cliente-1',
        })
      );
    });

    it('deve criar registro na timeline', async () => {
      const insertTimelineMock = vi.fn().mockResolvedValue({ data: null });

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'clientes') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: null }),
              })),
            })),
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'cliente-1' },
                }),
              })),
            })),
          };
        }
        if (table === 'eventos') {
          return {
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'evento-1' },
                }),
              })),
            })),
          };
        }
        if (table === 'cadastros_publicos') {
          return {
            insert: vi.fn().mockResolvedValue({ data: null }),
          };
        }
        if (table === 'eventos_timeline') {
          return { insert: insertTimelineMock };
        }
        return {};
      });

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify(requestBase),
      });

      await criarEventoPublico(req);

      expect(insertTimelineMock).toHaveBeenCalledWith(
        expect.objectContaining({
          evento_id: 'evento-1',
          tipo: 'cadastro',
          usuario: 'João Silva',
        })
      );
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve tratar erros do Supabase', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        select: vi.fn().mockRejectedValue(new Error('Database error')),
      }));

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify(requestBase),
      });

      const response = await criarEventoPublico(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeTruthy();
    });
  });
});
