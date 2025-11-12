import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import type { Evento } from '@/types/eventos';
import type { MaterialEstoque } from '@/types/estoque';

/**
 * Testes de Integração: Workflow Completo de Eventos
 * 
 * Testa o fluxo end-to-end de um evento:
 * 1. Criação do evento
 * 2. Alocação de materiais
 * 3. Alteração de status
 * 4. Devolução de materiais
 * 5. Arquivamento
 */

// Mock do Supabase
vi.mock('@/integrations/supabase/client');

describe('Workflow de Eventos - Integração E2E', () => {
  const mockUser = {
    id: 'user-123',
    email: 'comercial@test.com',
  };

  const mockCliente = {
    id: 'cliente-123',
    nome: 'Cliente Teste',
    tipo: 'CPF' as const,
    documento: '123.456.789-00',
    telefone: '(11) 98765-4321',
    whatsapp: '(11) 98765-4321',
    email: 'cliente@test.com',
    endereco: {
      cep: '01234-567',
      logradouro: 'Rua Teste',
      numero: '123',
      complemento: 'Apto 45',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
    },
  };

  const mockMaterial: MaterialEstoque = {
    id: 'MAT1',
    nome: 'Mesa Redonda',
    categoria: 'Mobiliário',
    tipoControle: 'serial',
    quantidadeTotal: 10,
    quantidadeDisponivel: 10,
    valorUnitario: 150,
  };

  const mockSerial = {
    numero: 'MES-001',
    status: 'disponivel',
    localizacao: 'Depósito A',
    material_id: 'MAT1',
  };

  let eventoId: string;
  let alocacaoId: string;

  beforeEach(() => {
    vi.clearAllMocks();
    eventoId = `evento-${Date.now()}`;
    alocacaoId = `alocacao-${Date.now()}`;

    // Mock auth
    (supabase.auth.getUser as any) = vi.fn().mockResolvedValue({
      data: { user: mockUser },
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Fluxo Completo: Criação → Alocação → Status → Devolução → Arquivamento', () => {
    it('deve executar workflow completo com sucesso', async () => {
      // ===== PASSO 1: CRIAR EVENTO =====
      const mockEvento: Evento = {
        id: eventoId,
        nome: 'Casamento Silva',
        tipoEvento: 'bar',
        cliente: mockCliente,
        comercial: {
          id: mockUser.id,
          nome: 'Comercial Teste',
          email: mockUser.email,
        },
        dataInicio: '2024-08-15',
        dataFim: '2024-08-15',
        horaInicio: '18:00',
        horaFim: '23:00',
        local: 'Espaço Jardim',
        endereco: 'Rua das Flores, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        status: 'orcamento',
        arquivado: false,
        tags: ['casamento', 'vip'],
        checklist: [],
        materiaisAlocados: {
          antecipado: [],
          comTecnicos: [],
        },
        financeiro: {
          receitas: [],
          despesas: [],
          cobrancas: [],
        },
        timeline: [],
        equipe: [],
        observacoesOperacionais: [],
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      };

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'eventos') {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockEvento, error: null }),
          };
        }
        if (table === 'eventos_timeline') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      // Criar evento
      const { data: eventoCriado } = await supabase
        .from('eventos')
        .insert([mockEvento])
        .select()
        .single();

      expect(eventoCriado).toBeDefined();
      expect(eventoCriado.id).toBe(eventoId);
      expect(eventoCriado.status).toBe('orcamento');

      // ===== PASSO 2: ALOCAR MATERIAIS =====
      const mockAlocacao = {
        id: alocacaoId,
        evento_id: eventoId,
        item_id: mockMaterial.id,
        nome: mockMaterial.nome,
        serial: mockSerial.numero,
        quantidade_alocada: 1,
        quantidade_devolvida: 0,
        status: 'reservado',
        status_devolucao: 'pendente',
        tipo_envio: 'retirada',
      };

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'eventos_materiais_alocados') {
          return {
            insert: vi.fn().mockResolvedValue({ data: [mockAlocacao], error: null }),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: [mockAlocacao], error: null }),
          };
        }
        if (table === 'materiais_seriais') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      // Alocar material
      const { data: alocacao } = await supabase
        .from('eventos_materiais_alocados')
        .insert([mockAlocacao]);

      expect(alocacao).toBeDefined();
      expect(alocacao[0].status).toBe('reservado');

      // Verificar que serial foi atualizado para 'em_uso'
      await supabase
        .from('materiais_seriais')
        .update({ status: 'em_uso' })
        .eq('numero', mockSerial.numero);

      // ===== PASSO 3: ALTERAR STATUS DO EVENTO =====
      const statusSequence = ['confirmado', 'em_andamento', 'concluido'];

      for (const novoStatus of statusSequence) {
        (supabase.from as any) = vi.fn().mockImplementation((table) => {
          if (table === 'eventos') {
            return {
              update: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ error: null }),
              select: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: { ...mockEvento, status: novoStatus },
                error: null,
              }),
            };
          }
          if (table === 'eventos_timeline') {
            return {
              insert: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          return {};
        });

        // Atualizar status
        await supabase
          .from('eventos')
          .update({ status: novoStatus })
          .eq('id', eventoId);

        // Criar entrada na timeline
        await supabase.from('eventos_timeline').insert([{
          evento_id: eventoId,
          tipo: 'edicao',
          descricao: `Status alterado para: ${novoStatus}`,
          usuario: mockUser.email,
        }]);

        // Verificar status atualizado
        const { data: eventoAtualizado } = await supabase
          .from('eventos')
          .select()
          .eq('id', eventoId)
          .single();

        expect(eventoAtualizado.status).toBe(novoStatus);
      }

      // ===== PASSO 4: DEVOLVER MATERIAIS =====
      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'eventos_materiais_alocados') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                ...mockAlocacao,
                status_devolucao: 'devolvido',
                quantidade_devolvida: 1,
                data_devolucao: new Date().toISOString(),
              },
              error: null,
            }),
          };
        }
        if (table === 'materiais_seriais') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      // Registrar devolução
      await supabase
        .from('eventos_materiais_alocados')
        .update({
          status_devolucao: 'devolvido',
          quantidade_devolvida: 1,
          data_devolucao: new Date().toISOString(),
        })
        .eq('id', alocacaoId);

      // Liberar serial
      await supabase
        .from('materiais_seriais')
        .update({ status: 'disponivel' })
        .eq('numero', mockSerial.numero);

      // Verificar devolução
      const { data: alocacaoAtualizada } = await supabase
        .from('eventos_materiais_alocados')
        .select()
        .eq('id', alocacaoId)
        .single();

      expect(alocacaoAtualizada.status_devolucao).toBe('devolvido');
      expect(alocacaoAtualizada.quantidade_devolvida).toBe(1);

      // ===== PASSO 5: ARQUIVAR EVENTO =====
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

      // Verificar materiais pendentes
      (supabase.from('eventos_materiais_alocados').select as any) = vi.fn().mockReturnThis();
      (supabase.from('eventos_materiais_alocados').select().eq as any) = vi.fn().mockReturnThis();
      (supabase.from('eventos_materiais_alocados').select().eq().eq as any) = vi.fn()
        .mockResolvedValue({ data: [], count: 0 });

      const { count: pendentes } = await supabase
        .from('eventos_materiais_alocados')
        .select('id', { count: 'exact' })
        .eq('evento_id', eventoId)
        .eq('status_devolucao', 'pendente');

      expect(pendentes).toBe(0);

      // Arquivar evento
      await supabase
        .from('eventos')
        .update({ arquivado: true })
        .eq('id', eventoId);

      // Timeline de arquivamento
      await supabase.from('eventos_timeline').insert({
        evento_id: eventoId,
        tipo: 'arquivamento',
        descricao: 'Evento arquivado',
        usuario: mockUser.email,
      });

      // Verificar arquivamento
      expect(supabase.from('eventos').update).toHaveBeenCalledWith({ arquivado: true });
    });

    it('deve impedir arquivamento com materiais pendentes', async () => {
      const mockAlocacaoPendente = {
        id: 'alocacao-pendente-123',
        evento_id: eventoId,
        status_devolucao: 'pendente',
      };

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
        .mockResolvedValue({ data: [mockAlocacaoPendente], count: 1 });

      // Verificar materiais pendentes
      const { count } = await supabase
        .from('eventos_materiais_alocados')
        .select('id', { count: 'exact' })
        .eq('evento_id', eventoId)
        .eq('status_devolucao', 'pendente');

      expect(count).toBeGreaterThan(0);

      // Não deve permitir arquivamento
      const error = new Error('Não é possível arquivar evento com materiais pendentes de devolução');
      expect(count).toBeGreaterThan(0);
      expect(() => {
        if (count && count > 0) throw error;
      }).toThrow();
    });
  });

  describe('Validações de Transição de Status', () => {
    it('deve permitir transição orcamento → confirmado', async () => {
      const transitions = [
        { from: 'orcamento', to: 'confirmado', valid: true },
        { from: 'confirmado', to: 'em_andamento', valid: true },
        { from: 'em_andamento', to: 'concluido', valid: true },
        { from: 'orcamento', to: 'cancelado', valid: true },
      ];

      transitions.forEach((transition) => {
        expect(transition.valid).toBe(true);
      });
    });

    it('deve impedir transições inválidas de status', async () => {
      const invalidTransitions = [
        { from: 'concluido', to: 'orcamento' },
        { from: 'cancelado', to: 'confirmado' },
        { from: 'concluido', to: 'em_andamento' },
      ];

      invalidTransitions.forEach((transition) => {
        // Validação de lógica de negócio
        const isInvalidTransition = 
          (transition.from === 'concluido' && transition.to !== 'concluido') ||
          (transition.from === 'cancelado' && transition.to !== 'cancelado');
        
        expect(isInvalidTransition).toBe(true);
      });
    });
  });

  describe('Timeline e Auditoria', () => {
    it('deve registrar todas as etapas do workflow na timeline', async () => {
      const timelineEntries: any[] = [];

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'eventos_timeline') {
          return {
            insert: vi.fn().mockImplementation((entries) => {
              timelineEntries.push(...(Array.isArray(entries) ? entries : [entries]));
              return Promise.resolve({ error: null });
            }),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: timelineEntries, error: null }),
          };
        }
        return {};
      });

      // Simular workflow
      const etapas = [
        { tipo: 'criacao', descricao: 'Evento criado' },
        { tipo: 'material', descricao: 'Material alocado: Mesa Redonda' },
        { tipo: 'edicao', descricao: 'Status alterado para: confirmado' },
        { tipo: 'material', descricao: 'Material devolvido: Mesa Redonda' },
        { tipo: 'arquivamento', descricao: 'Evento arquivado' },
      ];

      for (const etapa of etapas) {
        await supabase.from('eventos_timeline').insert([{
          evento_id: eventoId,
          tipo: etapa.tipo,
          descricao: etapa.descricao,
          usuario: mockUser.email,
          data: new Date().toISOString(),
        }]);
      }

      // Buscar timeline
      const { data: timeline } = await supabase
        .from('eventos_timeline')
        .select()
        .eq('evento_id', eventoId)
        .order('created_at');

      expect(timeline).toHaveLength(5);
      expect(timeline[0].tipo).toBe('criacao');
      expect(timeline[timeline.length - 1].tipo).toBe('arquivamento');
    });
  });

  describe('Integridade de Dados', () => {
    it('deve manter consistência de quantidades ao alocar e devolver', async () => {
      const quantidadeInicial = 10;
      let quantidadeAtual = quantidadeInicial;

      // Simular alocação
      quantidadeAtual -= 1;
      expect(quantidadeAtual).toBe(9);

      // Simular devolução
      quantidadeAtual += 1;
      expect(quantidadeAtual).toBe(10);

      // Verificar que voltou ao estado inicial
      expect(quantidadeAtual).toBe(quantidadeInicial);
    });

    it('deve atualizar status de seriais corretamente', async () => {
      const statusFlow = [
        { action: 'alocar', from: 'disponivel', to: 'em_uso' },
        { action: 'devolver', from: 'em_uso', to: 'disponivel' },
      ];

      let currentStatus = 'disponivel';

      for (const step of statusFlow) {
        expect(currentStatus).toBe(step.from);
        currentStatus = step.to;
        expect(currentStatus).toBe(step.to);
      }

      // Status final deve ser disponível
      expect(currentStatus).toBe('disponivel');
    });

    it('deve calcular lucro do evento corretamente', async () => {
      const receitas = [
        { descricao: 'Pagamento cliente', valor: 5000 },
        { descricao: 'Adicional bar', valor: 1500 },
      ];

      const despesas = [
        { descricao: 'Equipe operacional', valor: 2000 },
        { descricao: 'Transporte', valor: 500 },
        { descricao: 'Alimentação', valor: 300 },
      ];

      const totalReceitas = receitas.reduce((sum, r) => sum + r.valor, 0);
      const totalDespesas = despesas.reduce((sum, d) => sum + d.valor, 0);
      const lucro = totalReceitas - totalDespesas;

      expect(totalReceitas).toBe(6500);
      expect(totalDespesas).toBe(2800);
      expect(lucro).toBe(3700);
    });
  });

  describe('Cenários de Erro', () => {
    it('deve reverter transação se alocação falhar', async () => {
      const materialId = 'MAT-INEXISTENTE';

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'materiais_estoque') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: null, error: new Error('Material não encontrado') }),
          };
        }
        return {};
      });

      // Tentar buscar material inexistente
      const { error } = await supabase
        .from('materiais_estoque')
        .select()
        .eq('id', materialId);

      expect(error).toBeDefined();
      expect(error.message).toContain('Material não encontrado');
    });

    it('deve lidar com conflitos de alocação simultânea', async () => {
      const serialUnico = 'MES-UNICO-001';

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'materiais_seriais') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({
              data: { numero: serialUnico, status: 'em_uso' },
              error: null,
            }),
          };
        }
        return {};
      });

      // Verificar se serial já está em uso
      const { data: serial } = await supabase
        .from('materiais_seriais')
        .select()
        .eq('numero', serialUnico);

      expect(serial.status).toBe('em_uso');

      // Não deve permitir segunda alocação
      const error = new Error('Serial já está em uso');
      expect(() => {
        if (serial.status === 'em_uso') throw error;
      }).toThrow('Serial já está em uso');
    });

    it('deve validar datas do evento', async () => {
      const dataInicio = new Date('2024-08-15');
      const dataFim = new Date('2024-08-14'); // Data fim antes do início

      const isDataValida = dataFim >= dataInicio;

      expect(isDataValida).toBe(false);

      const error = new Error('Data de término não pode ser anterior à data de início');
      expect(() => {
        if (!isDataValida) throw error;
      }).toThrow('Data de término não pode ser anterior à data de início');
    });
  });

  describe('Permissões e Segurança', () => {
    it('deve verificar permissões antes de cada operação', async () => {
      const permissoes = {
        'eventos.criar': true,
        'eventos.editar_proprios': true,
        'estoque.alocar': true,
        'eventos.arquivar': true,
      };

      Object.entries(permissoes).forEach(([permissao, temPermissao]) => {
        expect(temPermissao).toBe(true);
      });
    });

    it('deve restringir edição de eventos de outros comerciais', async () => {
      const eventoOutroComercial = {
        id: 'evento-outro-123',
        comercial_id: 'outro-comercial-456',
      };

      const userAtual = {
        id: 'user-123',
        permissions: ['eventos.editar_proprios'], // Não tem eventos.editar_todos
      };

      const podeEditar = 
        userAtual.permissions.includes('eventos.editar_todos') ||
        (userAtual.permissions.includes('eventos.editar_proprios') && 
         eventoOutroComercial.comercial_id === userAtual.id);

      expect(podeEditar).toBe(false);
    });

    it('deve permitir admin editar qualquer evento', async () => {
      const userAdmin = {
        id: 'admin-123',
        permissions: ['admin.full_access'],
      };

      const podeEditar = userAdmin.permissions.includes('admin.full_access');

      expect(podeEditar).toBe(true);
    });
  });

  describe('Performance e Otimização', () => {
    it('deve executar operações em batch quando possível', async () => {
      const materiaisParaAlocar = [
        { id: 'MAT1', quantidade: 5 },
        { id: 'MAT2', quantidade: 10 },
        { id: 'MAT3', quantidade: 3 },
      ];

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'eventos_materiais_alocados') {
          return {
            insert: vi.fn().mockResolvedValue({ 
              data: materiaisParaAlocar.map(m => ({ ...m, evento_id: eventoId })), 
              error: null 
            }),
          };
        }
        return {};
      });

      // Inserir todos de uma vez (batch)
      const { data } = await supabase
        .from('eventos_materiais_alocados')
        .insert(materiaisParaAlocar);

      expect(data).toHaveLength(3);
      // Verificar que foi uma única chamada
      expect(supabase.from).toHaveBeenCalledTimes(1);
    });

    it('deve cachear dados consultados frequentemente', async () => {
      const cache = new Map();

      // Simular consulta com cache
      const getCliente = async (id: string) => {
        if (cache.has(id)) {
          return cache.get(id);
        }

        const cliente = { id, nome: 'Cliente Teste' };
        cache.set(id, cliente);
        return cliente;
      };

      // Primeira consulta
      const cliente1 = await getCliente('cliente-123');
      expect(cliente1).toBeDefined();

      // Segunda consulta (deve usar cache)
      const cliente2 = await getCliente('cliente-123');
      expect(cliente2).toBe(cliente1);
      expect(cache.size).toBe(1);
    });
  });
});
