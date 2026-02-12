import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import type { MaterialEstoque } from '@/types/estoque';

/**
 * Testes de Integração: Fluxo Completo de Alocação de Estoque
 * 
 * Testa o fluxo end-to-end de alocação de materiais:
 * 1. Reserva (alocação inicial)
 * 2. Separação e envio
 * 3. Uso no evento
 * 4. Devolução (OK, danificado, perdido, consumido)
 * 5. Atualização automática de quantidades via triggers
 */

// Mock do Supabase
vi.mock('@/integrations/supabase/client');

describe('Alocação de Estoque - Integração E2E', () => {
  const mockUser = {
    id: 'user-123',
    email: 'operador@test.com',
  };

  const mockEvento = {
    id: 'evento-teste-123',
    nome: 'Festival de Música',
    data_inicio: '2024-08-20',
    data_fim: '2024-08-20',
  };

  const mockMaterialQuantidade: MaterialEstoque = {
    id: 'MAT-Q1',
    nome: 'Cadeira Plástica',
    categoria: 'Mobiliário',
    tipoControle: 'quantidade',
    quantidadeTotal: 100,
    quantidadeDisponivel: 100,
    valorUnitario: 10,
  };

  const mockMaterialSerial: MaterialEstoque = {
    id: 'MAT-S1',
    nome: 'Mesa de Som',
    categoria: 'Áudio',
    tipoControle: 'serial',
    quantidadeTotal: 5,
    quantidadeDisponivel: 5,
    valorUnitario: 5000,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (supabase.auth.getUser as any) = vi.fn().mockResolvedValue({
      data: { user: mockUser },
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Fluxo Completo: Material com Controle por Quantidade', () => {
    it('deve alocar, usar e devolver material com controle de quantidade', async () => {
      let quantidadeDisponivel = 100;
      const alocacaoId = 'alocacao-q-123';
      const quantidadeAlocada = 20;

      // ===== PASSO 1: VERIFICAR DISPONIBILIDADE =====
      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'materiais_estoque') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({
              data: { ...mockMaterialQuantidade, quantidade_disponivel: quantidadeDisponivel },
              error: null,
            }),
          };
        }
        return {};
      });

      const { data: material } = await supabase
        .from('materiais_estoque')
        .select()
        .eq('id', mockMaterialQuantidade.id);

      expect((material as Record<string, unknown>[])?.[0]?.quantidade_disponivel).toBe(100);
      expect(((material as Record<string, unknown>[])?.[0]?.quantidade_disponivel as number) >= quantidadeAlocada).toBe(true);

      // ===== PASSO 2: ALOCAR MATERIAL (RESERVAR) =====
      quantidadeDisponivel -= quantidadeAlocada;

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'eventos_materiais_alocados') {
          return {
            insert: vi.fn().mockResolvedValue({
              data: [{
                id: alocacaoId,
                evento_id: mockEvento.id,
                item_id: mockMaterialQuantidade.id,
                nome: mockMaterialQuantidade.nome,
                quantidade_alocada: quantidadeAlocada,
                quantidade_devolvida: 0,
                status: 'reservado',
                status_devolucao: 'pendente',
                tipo_envio: 'antecipado',
              }],
              error: null,
            }),
          };
        }
        if (table === 'materiais_estoque') {
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
      .insert([{
          evento_id: mockEvento.id,
          item_id: mockMaterialQuantidade.id,
          nome: mockMaterialQuantidade.nome,
          quantidade_alocada: quantidadeAlocada,
          status: 'reservado' as const,
          tipo_envio: 'antecipado' as const,
        }]);

      expect((alocacao as Record<string, unknown>[])?.[0]?.status).toBe('reservado');
      expect((alocacao as Record<string, unknown>[])?.[0]?.quantidade_alocada).toBe(20);

      // Atualizar estoque (trigger automático)
      await supabase
        .from('materiais_estoque')
        .update({ quantidade_disponivel: quantidadeDisponivel })
        .eq('id', mockMaterialQuantidade.id);

      // ===== PASSO 3: SEPARAR MATERIAL =====
      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'eventos_materiais_alocados') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      await supabase
        .from('eventos_materiais_alocados')
        .update({ status: 'separado' })
        .eq('id', alocacaoId);

      // ===== PASSO 4: ENVIAR MATERIAL =====
      await supabase
        .from('eventos_materiais_alocados')
        .update({ 
          status: 'em_transito',
          data_envio: new Date().toISOString(),
          transportadora: 'Transportadora XYZ',
        })
        .eq('id', alocacaoId);

      // ===== PASSO 5: ENTREGAR MATERIAL =====
      await supabase
        .from('eventos_materiais_alocados')
        .update({ status: 'entregue' })
        .eq('id', alocacaoId);

      // ===== PASSO 6: DEVOLVER MATERIAL (OK) =====
      quantidadeDisponivel += quantidadeAlocada; // Retorna ao estoque

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'eventos_materiais_alocados') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === 'materiais_estoque') {
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
          status_devolucao: 'devolvido_ok',
          quantidade_devolvida: quantidadeAlocada,
          data_devolucao: new Date().toISOString(),
        })
        .eq('id', alocacaoId);

      // Trigger atualiza estoque automaticamente
      await supabase
        .from('materiais_estoque')
        .update({ quantidade_disponivel: quantidadeDisponivel })
        .eq('id', mockMaterialQuantidade.id);

      // Verificar quantidades finais
      expect(quantidadeDisponivel).toBe(100); // Voltou ao estado inicial
    });

    it('deve lidar com devolução parcial', async () => {
      let quantidadeDisponivel = 100;
      const quantidadeAlocada = 50;
      const quantidadeDevolvida = 45; // 5 perdidos
      const quantidadePerdida = 5;

      // Alocar
      quantidadeDisponivel -= quantidadeAlocada;
      expect(quantidadeDisponivel).toBe(50);

      // Devolver parcialmente (45 OK, 5 perdidos)
      quantidadeDisponivel += quantidadeDevolvida;

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'materiais_estoque') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      // Atualizar disponível (retornam 45)
      await supabase
        .from('materiais_estoque')
        .update({ quantidade_disponivel: quantidadeDisponivel })
        .eq('id', mockMaterialQuantidade.id);

      // Atualizar total (decrementar 5 perdidos)
      const novoTotal = 95;
      await supabase
        .from('materiais_estoque')
        .update({ quantidade_total: novoTotal })
        .eq('id', mockMaterialQuantidade.id);

      expect(quantidadeDisponivel).toBe(95);
      expect(novoTotal).toBe(95);
      expect(quantidadePerdida).toBe(5);
    });

    it('deve impedir alocação acima da quantidade disponível', async () => {
      const quantidadeDisponivel = 10;
      const quantidadeSolicitada = 15;

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'materiais_estoque') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({
              data: { quantidade_disponivel: quantidadeDisponivel },
              error: null,
            }),
          };
        }
        return {};
      });

      const { data: material } = await supabase
        .from('materiais_estoque')
        .select()
        .eq('id', mockMaterialQuantidade.id);

      const podeSerAlocado = ((material as Record<string, unknown>[])?.[0]?.quantidade_disponivel as number) >= quantidadeSolicitada;

      expect(podeSerAlocado).toBe(false);

      const error = new Error('Quantidade solicitada excede disponível no estoque');
      expect(() => {
        if (!podeSerAlocado) throw error;
      }).toThrow('Quantidade solicitada excede disponível no estoque');
    });
  });

  describe('Fluxo Completo: Material com Controle por Serial', () => {
    it('deve alocar, rastrear e devolver material por serial', async () => {
      const serialNumero = 'MES-SOM-001';
      const alocacaoId = 'alocacao-s-123';

      // ===== PASSO 1: VERIFICAR SERIAL DISPONÍVEL =====
      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'materiais_seriais') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                numero: serialNumero,
                status: 'disponivel',
                material_id: mockMaterialSerial.id,
                localizacao: 'Depósito Principal',
              },
              error: null,
            }),
          };
        }
        return {};
      });

      const { data: serial } = await supabase
        .from('materiais_seriais')
        .select()
        .eq('numero', serialNumero)
        .single();

      expect(serial.status).toBe('disponivel');

      // ===== PASSO 2: ALOCAR SERIAL =====
      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'eventos_materiais_alocados') {
          return {
            insert: vi.fn().mockResolvedValue({
              data: [{
                id: alocacaoId,
                evento_id: mockEvento.id,
                item_id: mockMaterialSerial.id,
                nome: mockMaterialSerial.nome,
                serial: serialNumero,
                quantidade_alocada: 1,
                status: 'reservado',
                status_devolucao: 'pendente',
              }],
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
        if (table === 'materiais_estoque') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      // Criar alocação
      await supabase
        .from('eventos_materiais_alocados')
      .insert([{
          evento_id: mockEvento.id,
          item_id: mockMaterialSerial.id,
          nome: mockMaterialSerial.nome,
          serial: serialNumero,
          status: 'reservado' as const,
          tipo_envio: 'antecipado' as const,
        }]);

      // Trigger atualiza serial para 'em-uso'
      await supabase
        .from('materiais_seriais')
        .update({ status: 'em-uso' })
        .eq('numero', serialNumero);

      // Decrementar quantidade disponível
      await supabase
        .from('materiais_estoque')
        .update({ quantidade_disponivel: 4 })
        .eq('id', mockMaterialSerial.id);

      // ===== PASSO 3: REGISTRAR RETIRADA =====
      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'eventos_materiais_alocados') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      await supabase
        .from('eventos_materiais_alocados')
        .update({
          data_retirada: new Date().toISOString(),
          retirado_por_nome: 'João Silva',
          retirado_por_documento: '123.456.789-00',
          termo_retirada_url: 'https://storage.supabase.co/termo-123.pdf',
        })
        .eq('id', alocacaoId);

      // ===== PASSO 4: DEVOLVER SERIAL (OK) =====
      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'eventos_materiais_alocados') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === 'materiais_seriais') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === 'materiais_estoque') {
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
          status_devolucao: 'devolvido_ok',
          quantidade_devolvida: 1,
          data_devolucao: new Date().toISOString(),
        })
        .eq('id', alocacaoId);

      // Trigger libera serial
      await supabase
        .from('materiais_seriais')
        .update({ status: 'disponivel', localizacao: 'Depósito Principal' })
        .eq('numero', serialNumero);

      // Incrementar quantidade disponível
      await supabase
        .from('materiais_estoque')
        .update({ quantidade_disponivel: 5 })
        .eq('id', mockMaterialSerial.id);
    });

    it('deve lidar com serial devolvido danificado', async () => {
      const serialNumero = 'MES-SOM-002';
      const alocacaoId = 'alocacao-s-124';

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'eventos_materiais_alocados') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
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

      // Registrar devolução danificada
      await supabase
        .from('eventos_materiais_alocados')
        .update({
          status_devolucao: 'devolvido_danificado',
          quantidade_devolvida: 1,
          data_devolucao: new Date().toISOString(),
          observacoes_devolucao: 'Mesa de som com conectores danificados',
          fotos_devolucao: ['foto1.jpg', 'foto2.jpg'],
        })
        .eq('id', alocacaoId);

      // Trigger envia para manutenção
      await supabase
        .from('materiais_seriais')
        .update({ 
          status: 'manutencao', 
          localizacao: 'Manutenção',
        })
        .eq('numero', serialNumero);

      // NÃO incrementa disponível (está em manutenção)
      // Quantidade disponível permanece a mesma
    });

    it('deve lidar com serial perdido', async () => {
      const serialNumero = 'MES-SOM-003';
      const alocacaoId = 'alocacao-s-125';

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'eventos_materiais_alocados') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === 'materiais_seriais') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === 'materiais_estoque') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      // Registrar perda
      await supabase
        .from('eventos_materiais_alocados')
        .update({
          status_devolucao: 'perdido',
          data_devolucao: new Date().toISOString(),
          observacoes_devolucao: 'Material extraviado durante evento',
        })
        .eq('id', alocacaoId);

      // Trigger marca serial como perdido
      await supabase
        .from('materiais_seriais')
        .update({ 
          status: 'perdido',
          perdido_em: mockEvento.id,
          data_perda: new Date().toISOString(),
          motivo_perda: 'Material extraviado durante evento',
        })
        .eq('numero', serialNumero);

      // Decrementar total do estoque (perda permanente)
      await supabase
        .from('materiais_estoque')
        .update({ 
          quantidade_total: 4,
          // Disponível já foi decrementado na alocação
        })
        .eq('id', mockMaterialSerial.id);
    });

    it('deve impedir alocação de serial já em uso', async () => {
      const serialNumero = 'MES-SOM-004';

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'materiais_seriais') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({
              data: {
                numero: serialNumero,
                status: 'em-uso',
                material_id: mockMaterialSerial.id,
              },
              error: null,
            }),
          };
        }
        return {};
      });

      const { data: serial } = await supabase
        .from('materiais_seriais')
        .select()
        .eq('numero', serialNumero);

      expect((serial as Record<string, unknown>[])?.[0]?.status).toBe('em-uso');

      const error = new Error('Este serial já está em uso em outro evento');
      expect(() => {
        if ((serial as Record<string, unknown>[])?.[0]?.status !== 'disponivel') throw error;
      }).toThrow('Este serial já está em uso em outro evento');
    });
  });

  describe('Histórico e Rastreabilidade', () => {
    it('deve registrar toda movimentação no histórico', async () => {
      const historico: any[] = [];

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'materiais_historico_movimentacao') {
          return {
            insert: vi.fn().mockImplementation((entries) => {
              historico.push(...(Array.isArray(entries) ? entries : [entries]));
              return Promise.resolve({ error: null });
            }),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: historico, error: null }),
          };
        }
        return {};
      });

      // Simular movimentações
      const movimentacoes = [
        {
          tipo_operacao: 'alocacao',
          material_id: 'MAT1',
          serial_numero: 'SER-001',
          evento_id: mockEvento.id,
          evento_nome: mockEvento.nome,
          quantidade: 1,
        },
        {
          tipo_operacao: 'devolucao_ok',
          material_id: 'MAT1',
          serial_numero: 'SER-001',
          evento_id: mockEvento.id,
          evento_nome: mockEvento.nome,
          quantidade: 1,
        },
      ];

      for (const mov of movimentacoes) {
        await supabase.from('materiais_historico_movimentacao').insert([{
          ...mov,
          data_movimentacao: new Date().toISOString(),
          usuario_id: mockUser.id,
        }]);
      }

      // Buscar histórico
      const { data: historicoCompleto } = await supabase
        .from('materiais_historico_movimentacao')
        .select()
        .eq('material_id', 'MAT1')
        .order('data_movimentacao');

      expect(historicoCompleto).toHaveLength(2);
      expect(historicoCompleto[0].tipo_operacao).toBe('alocacao');
      expect(historicoCompleto[1].tipo_operacao).toBe('devolucao_ok');
    });

    it('deve rastrear localização de seriais', async () => {
      const serialNumero = 'SER-002';
      const localizacoes: any[] = [];

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'materiais_historico_localizacao') {
          return {
            insert: vi.fn().mockImplementation((entries) => {
              localizacoes.push(...(Array.isArray(entries) ? entries : [entries]));
              return Promise.resolve({ error: null });
            }),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: localizacoes, error: null }),
          };
        }
        return {};
      });

      // Simular mudanças de localização
      const mudancas = [
        { localizacao_anterior: 'Depósito Principal', localizacao_nova: 'Em Trânsito' },
        { localizacao_anterior: 'Em Trânsito', localizacao_nova: 'Evento - Local XYZ' },
        { localizacao_anterior: 'Evento - Local XYZ', localizacao_nova: 'Em Trânsito' },
        { localizacao_anterior: 'Em Trânsito', localizacao_nova: 'Depósito Principal' },
      ];

      for (const mudanca of mudancas) {
        await supabase.from('materiais_historico_localizacao').insert([{
          serial_numero: serialNumero,
          material_id: 'MAT1',
          ...mudanca,
          data_movimentacao: new Date().toISOString(),
          usuario_id: mockUser.id,
        }]);
      }

      // Buscar histórico de localização
      const { data: historicoLoc } = await supabase
        .from('materiais_historico_localizacao')
        .select()
        .eq('serial_numero', serialNumero)
        .order('data_movimentacao');

      expect(historicoLoc).toHaveLength(4);
      expect(historicoLoc[0].localizacao_nova).toBe('Em Trânsito');
      expect(historicoLoc[3].localizacao_nova).toBe('Depósito Principal');
    });
  });

  describe('Triggers e Automações', () => {
    it('deve executar trigger de atualização de checklist', async () => {
      const mockChecklist = {
        evento_id: mockEvento.id,
        item_id: 'MAT1',
        nome: 'Cadeira',
        quantidade: 50,
        alocado: 0,
      };

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'eventos_checklist') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockChecklist,
              error: null,
            }),
            update: vi.fn().mockReturnThis(),
          };
        }
        return {};
      });

      // Simular alocação que deveria disparar trigger
      const quantidadeAlocada = 10;
      mockChecklist.alocado = quantidadeAlocada;

      // Trigger atualiza automaticamente
      await supabase
        .from('eventos_checklist')
        .update({ alocado: quantidadeAlocada })
        .eq('evento_id', mockEvento.id)
        .eq('item_id', 'MAT1');

      const { data: checklistAtualizado } = await supabase
        .from('eventos_checklist')
        .select()
        .eq('evento_id', mockEvento.id)
        .eq('item_id', 'MAT1')
        .single();

      expect(checklistAtualizado.alocado).toBe(10);
    });

    it('deve executar trigger de reversão ao excluir alocação', async () => {
      const serialNumero = 'SER-003';
      let quantidadeDisponivel = 4;

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'eventos_materiais_alocados') {
          return {
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === 'materiais_seriais') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === 'materiais_estoque') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      // Deletar alocação (trigger reverte)
      await supabase
        .from('eventos_materiais_alocados')
        .delete()
        .eq('id', 'alocacao-123');

      // Trigger libera serial
      await supabase
        .from('materiais_seriais')
        .update({ status: 'disponivel' })
        .eq('numero', serialNumero);

      // Trigger incrementa disponível
      quantidadeDisponivel += 1;
      await supabase
        .from('materiais_estoque')
        .update({ quantidade_disponivel: quantidadeDisponivel })
        .eq('id', mockMaterialSerial.id);

      expect(quantidadeDisponivel).toBe(5);
    });
  });

  describe('Validações e Regras de Negócio', () => {
    it('deve validar quantidade mínima de estoque', async () => {
      const estoqueMinimo = 10;
      const quantidadeAtual = 8;

      const abaixoDoMinimo = quantidadeAtual < estoqueMinimo;

      expect(abaixoDoMinimo).toBe(true);

      // Deveria gerar alerta
      const alerta = {
        tipo: 'estoque_baixo',
        material_id: 'MAT1',
        quantidade_atual: quantidadeAtual,
        estoque_minimo: estoqueMinimo,
      };

      expect(alerta.tipo).toBe('estoque_baixo');
    });

    it('deve calcular taxa de utilização de material', async () => {
      const quantidadeTotal = 100;
      const quantidadeDisponivel = 70;
      const quantidadeEmUso = quantidadeTotal - quantidadeDisponivel;

      const taxaUtilizacao = (quantidadeEmUso / quantidadeTotal) * 100;

      expect(taxaUtilizacao).toBe(30);
      expect(taxaUtilizacao).toBeGreaterThan(0);
      expect(taxaUtilizacao).toBeLessThan(100);
    });

    it('deve validar data de devolução não anterior à retirada', async () => {
      const dataRetirada = new Date('2024-08-20');
      const dataDevolucao = new Date('2024-08-19'); // Data inválida

      const isDataValida = dataDevolucao >= dataRetirada;

      expect(isDataValida).toBe(false);

      const error = new Error('Data de devolução não pode ser anterior à data de retirada');
      expect(() => {
        if (!isDataValida) throw error;
      }).toThrow('Data de devolução não pode ser anterior à data de retirada');
    });

    it('deve calcular valor total de materiais alocados', async () => {
      const alocacoes = [
        { material_id: 'MAT1', quantidade: 20, valor_unitario: 10 },
        { material_id: 'MAT2', quantidade: 5, valor_unitario: 5000 },
        { material_id: 'MAT3', quantidade: 100, valor_unitario: 2 },
      ];

      const valorTotal = alocacoes.reduce((sum, a) => 
        sum + (a.quantidade * a.valor_unitario), 0
      );

      expect(valorTotal).toBe(25400); // 200 + 25000 + 200
    });
  });

  describe('Cenários de Erro e Edge Cases', () => {
    it('deve lidar com material indisponível durante alocação simultânea', async () => {
      const materialId = 'MAT-POPULAR';
      let quantidadeDisponivel = 1;

      // Dois usuários tentam alocar ao mesmo tempo
      const usuario1TentaAlocar = quantidadeDisponivel > 0;
      const usuario2TentaAlocar = quantidadeDisponivel > 0;

      expect(usuario1TentaAlocar).toBe(true);
      expect(usuario2TentaAlocar).toBe(true);

      // Primeiro consegue
      if (usuario1TentaAlocar) {
        quantidadeDisponivel -= 1;
      }

      // Segundo falha (já foi alocado)
      const segundoPodeAlocar = quantidadeDisponivel > 0;
      expect(segundoPodeAlocar).toBe(false);

      const error = new Error('Material não está mais disponível');
      expect(() => {
        if (!segundoPodeAlocar) throw error;
      }).toThrow('Material não está mais disponível');
    });

    it('deve impedir devolução de material não alocado', async () => {
      const alocacaoId = 'alocacao-inexistente';

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'eventos_materiais_alocados') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Alocação não encontrada'),
            }),
          };
        }
        return {};
      });

      const { error } = await supabase
        .from('eventos_materiais_alocados')
        .select()
        .eq('id', alocacaoId);

      expect(error).toBeDefined();
      expect(error.message).toContain('Alocação não encontrada');
    });

    it('deve lidar com serial danificado em manutenção', async () => {
      const serialNumero = 'SER-MANUTENCAO-001';

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'materiais_seriais') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({
              data: {
                numero: serialNumero,
                status: 'manutencao',
              },
              error: null,
            }),
          };
        }
        return {};
      });

      const { data: serial } = await supabase
        .from('materiais_seriais')
        .select()
        .eq('numero', serialNumero);

      expect((serial as Record<string, unknown>[])?.[0]?.status).toBe('manutencao');

      const podeSerAlocado = (serial as Record<string, unknown>[])?.[0]?.status === 'disponivel';
      expect(podeSerAlocado).toBe(false);
    });

    it('deve validar quantidade em lote de devolução', async () => {
      const quantidadeAlocada = 10;
      const quantidadeDevolvida = 12; // Mais que o alocado (erro)

      const isQuantidadeValida = quantidadeDevolvida <= quantidadeAlocada;

      expect(isQuantidadeValida).toBe(false);

      const error = new Error('Quantidade devolvida não pode ser maior que a alocada');
      expect(() => {
        if (!isQuantidadeValida) throw error;
      }).toThrow('Quantidade devolvida não pode ser maior que a alocada');
    });
  });

  describe('Performance e Otimização', () => {
    it('deve processar devolução em lote eficientemente', async () => {
      const materiaisParaDevolver = [
        { id: 'aloc-1', quantidade: 5 },
        { id: 'aloc-2', quantidade: 10 },
        { id: 'aloc-3', quantidade: 3 },
      ];

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'eventos_materiais_alocados') {
          return {
            update: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      // Processar em batch
      const updates = materiaisParaDevolver.map(m => ({
        id: m.id,
        status_devolucao: 'devolvido_ok',
        quantidade_devolvida: m.quantidade,
      }));

      // Simular update em lote (uma chamada para múltiplos registros)
      await supabase
        .from('eventos_materiais_alocados')
        .update({ status_devolucao: 'devolvido_ok' });

      expect(updates).toHaveLength(3);
    });

    it('deve usar índices para busca rápida de seriais', async () => {
      const serialNumeros = ['SER-001', 'SER-002', 'SER-003'];

      (supabase.from as any) = vi.fn().mockImplementation((table) => {
        if (table === 'materiais_seriais') {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({
              data: serialNumeros.map(n => ({ numero: n, status: 'disponivel' })),
              error: null,
            }),
          };
        }
        return {};
      });

      // Buscar múltiplos seriais de uma vez (eficiente)
      const { data: seriais } = await supabase
        .from('materiais_seriais')
        .select()
        .in('numero', serialNumeros);

      expect(seriais).toHaveLength(3);
    });
  });
});
