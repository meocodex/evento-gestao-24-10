import { Page } from '@playwright/test';

/**
 * Helper functions para testes de eventos
 */

export interface TestCliente {
  id?: string;
  nome: string;
  email: string;
  telefone: string;
  documento: string;
  tipo: 'pf' | 'pj';
}

export interface TestMaterial {
  id?: string;
  nome: string;
  categoria: string;
  serial?: string;
}

export interface TestEvento {
  id?: string;
  nome: string;
  tipo_evento: 'ingresso' | 'bar' | 'hibrido';
  data_inicio: string;
  data_fim: string;
  hora_inicio: string;
  hora_fim: string;
  local: string;
  cidade: string;
  estado: string;
  endereco: string;
}

export class EventosTestHelper {
  constructor(private page: Page) {}

  /**
   * Cria cliente de teste via API
   */
  async criarClienteTeste(cliente: TestCliente): Promise<string> {
    const response = await this.page.evaluate(async (clienteData) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('clientes')
        .insert(clienteData)
        .select('id')
        .single();
      
      if (error) throw error;
      return data.id;
    }, cliente);
    
    return response;
  }

  /**
   * Cria material de teste via API
   */
  async criarMaterialTeste(material: TestMaterial): Promise<string> {
    const materialId = `TEST_${Date.now()}`;
    
    await this.page.evaluate(async ({ materialId, materialData }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Criar material no estoque
      const { error: materialError } = await supabase
        .from('materiais_estoque')
        .insert({
          id: materialId,
          nome: materialData.nome,
          categoria: materialData.categoria,
          tipo_controle: 'serial',
          quantidade_total: 1,
          quantidade_disponivel: 1,
        });
      
      if (materialError) throw materialError;

      // Criar serial se fornecido
      if (materialData.serial) {
        const { error: serialError } = await supabase
          .from('materiais_seriais')
          .insert({
            material_id: materialId,
            numero: materialData.serial,
            status: 'disponivel',
            localizacao: 'Estoque Principal',
          });
        
        if (serialError) throw serialError;
      }
    }, { materialId, materialData: material });
    
    return materialId;
  }

  /**
   * Cria evento de teste via API
   */
  async criarEventoTeste(evento: TestEvento, clienteId: string, comercialId: string): Promise<string> {
    const response = await this.page.evaluate(async ({ eventoData, clienteId, comercialId }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('eventos')
        .insert({
          ...eventoData,
          cliente_id: clienteId,
          comercial_id: comercialId,
          status: 'orcamento',
        })
        .select('id')
        .single();
      
      if (error) throw error;
      return data.id;
    }, { eventoData: evento, clienteId, comercialId });
    
    return response;
  }

  /**
   * Limpa dados de teste
   */
  async limparDadosTeste(eventoId?: string, clienteId?: string, materialId?: string) {
    await this.page.evaluate(async ({ eventoId, clienteId, materialId }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      if (eventoId) {
        // Limpar dados relacionados ao evento
        await supabase.from('eventos_materiais_alocados').delete().eq('evento_id', eventoId);
        await supabase.from('eventos_equipe').delete().eq('evento_id', eventoId);
        await supabase.from('eventos_receitas').delete().eq('evento_id', eventoId);
        await supabase.from('eventos_despesas').delete().eq('evento_id', eventoId);
        await supabase.from('eventos_timeline').delete().eq('evento_id', eventoId);
        await supabase.from('eventos_checklist').delete().eq('evento_id', eventoId);
        await supabase.from('eventos').delete().eq('id', eventoId);
      }
      
      if (clienteId) {
        await supabase.from('clientes').delete().eq('id', clienteId);
      }
      
      if (materialId) {
        await supabase.from('materiais_seriais').delete().eq('material_id', materialId);
        await supabase.from('materiais_estoque').delete().eq('id', materialId);
      }
    }, { eventoId, clienteId, materialId });
  }

  /**
   * Aguarda carregamento de dados
   */
  async aguardarCarregamento() {
    await this.page.waitForTimeout(1000);
  }

  /**
   * Navega para página de detalhes do evento
   */
  async navegarParaDetalhes(eventoId: string) {
    await this.page.goto(`/eventos/${eventoId}`);
    await this.aguardarCarregamento();
  }

  /**
   * Abre aba específica
   */
  async abrirAba(aba: 'dados' | 'materiais' | 'operacao' | 'demandas' | 'financeiro' | 'contratos') {
    await this.page.click(`[role="tab"]:has-text("${this.getNomeAba(aba)}")`);
    await this.aguardarCarregamento();
  }

  private getNomeAba(aba: string): string {
    const nomes: Record<string, string> = {
      dados: 'Dados',
      materiais: 'Materiais',
      operacao: 'Operação',
      demandas: 'Demandas',
      financeiro: 'Financeiro',
      contratos: 'Contratos',
    };
    return nomes[aba];
  }

  /**
   * Formata data para input HTML
   */
  formatarDataParaInput(data: string): string {
    return data.split('T')[0];
  }

  /**
   * Gera dados aleatórios para testes
   */
  gerarDadosAleatorios() {
    const timestamp = Date.now();
    return {
      cliente: {
        nome: `Cliente Teste ${timestamp}`,
        email: `cliente${timestamp}@teste.com`,
        telefone: '11999999999',
        documento: `${timestamp}`.substring(0, 11),
        tipo: 'pf' as const,
      },
      material: {
        nome: `Material Teste ${timestamp}`,
        categoria: 'Equipamentos',
        serial: `SN${timestamp}`,
      },
      evento: {
        nome: `Evento Teste ${timestamp}`,
        tipo_evento: 'hibrido' as const,
        data_inicio: '2025-12-15',
        data_fim: '2025-12-15',
        hora_inicio: '20:00',
        hora_fim: '23:59',
        local: 'Local Teste',
        cidade: 'São Paulo',
        estado: 'SP',
        endereco: 'Rua Teste, 123',
      },
    };
  }
}
