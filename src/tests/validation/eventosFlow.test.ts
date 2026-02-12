import { supabase } from '@/integrations/supabase/client';

export interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  duration: number;
}

/**
 * Testes de fluxo completo de eventos
 */
export async function testEventosFlow(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  let eventoId: string | null = null;

  // Test 1: Criar evento
  try {
    const start = performance.now();
    const { data: clientes } = await supabase.from('clientes').select('id').limit(1).single();
    const { data: comerciais } = await supabase.from('profiles').select('id').limit(1).single();

    if (!clientes || !comerciais) {
      throw new Error('Dados necessários não encontrados');
    }

    const { data, error } = await supabase.from('eventos').insert({
      nome: '[TESTE] Evento Validação',
      tipo_evento: 'bar',
      data_inicio: new Date().toISOString(),
      data_fim: new Date(Date.now() + 86400000).toISOString(),
      hora_inicio: '18:00',
      hora_fim: '23:00',
      local: 'Local Teste',
      cidade: 'São Paulo',
      estado: 'SP',
      endereco: 'Rua Teste, 123',
      cliente_id: clientes.id,
      comercial_id: comerciais.id,
      status: 'orcamento'
    }).select().single();

    const duration = performance.now() - start;

    if (error) throw error;
    eventoId = data.id;

    results.push({
      name: 'Criar Evento',
      status: 'success',
      message: `Evento criado com sucesso (ID: ${eventoId.substring(0, 8)}...)`,
      duration
    });
  } catch (error: any) {
    results.push({
      name: 'Criar Evento',
      status: 'error',
      message: error.message,
      duration: 0
    });
  }

  // Test 2: Editar evento
  if (eventoId) {
    try {
      const start = performance.now();
      const { error } = await supabase
        .from('eventos')
        .update({ nome: '[TESTE] Evento Validação - Editado' })
        .eq('id', eventoId);

      const duration = performance.now() - start;

      if (error) throw error;

      results.push({
        name: 'Editar Evento',
        status: 'success',
        message: 'Evento editado com sucesso',
        duration
      });
    } catch (error: any) {
      results.push({
        name: 'Editar Evento',
        status: 'error',
        message: error.message,
        duration: 0
      });
    }
  }

  // Test 3: Adicionar material ao evento
  if (eventoId) {
    try {
      const start = performance.now();
      const { data: material } = await supabase
        .from('materiais_estoque')
        .select('id, nome')
        .gt('quantidade_disponivel', 0)
        .limit(1)
        .single();

      if (material) {
        const { error } = await supabase.from('eventos_materiais_alocados').insert({
          evento_id: eventoId,
          item_id: material.id,
          nome: material.nome,
          quantidade_alocada: 1,
          status: 'reservado' as const,
          tipo_envio: 'antecipado' as const,
        });

        const duration = performance.now() - start;

        if (error) throw error;

        results.push({
          name: 'Alocar Material',
          status: 'success',
          message: 'Material alocado com sucesso',
          duration
        });
      } else {
        results.push({
          name: 'Alocar Material',
          status: 'warning',
          message: 'Nenhum material disponível para teste',
          duration: performance.now() - start
        });
      }
    } catch (error: any) {
      results.push({
        name: 'Alocar Material',
        status: 'error',
        message: error.message,
        duration: 0
      });
    }
  }

  // Test 4: Excluir evento
  if (eventoId) {
    try {
      const start = performance.now();
      
      // Limpar materiais alocados
      await supabase.from('eventos_materiais_alocados').delete().eq('evento_id', eventoId);
      
      // Excluir evento
      const { error } = await supabase.from('eventos').delete().eq('id', eventoId);

      const duration = performance.now() - start;

      if (error) throw error;

      results.push({
        name: 'Excluir Evento',
        status: 'success',
        message: 'Evento excluído com sucesso',
        duration
      });
    } catch (error: any) {
      results.push({
        name: 'Excluir Evento',
        status: 'error',
        message: error.message,
        duration: 0
      });
    }
  }

  return results;
}
