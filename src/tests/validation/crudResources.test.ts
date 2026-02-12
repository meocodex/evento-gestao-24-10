import { supabase } from '@/integrations/supabase/client';
import type { TestResult } from './eventosFlow.test';

/**
 * Testes de CRUD para recursos principais
 */
export async function testCrudResources(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Test 1: CRUD Cliente
  let clienteId: string | null = null;
  try {
    const start = performance.now();

    // Criar
    const { data: created, error: createError } = await supabase
      .from('clientes')
      .insert({
        nome: '[TESTE] Cliente Validação',
        tipo: 'CPF',
        documento: '12345678901',
        email: 'teste.validacao@exemplo.com',
        telefone: '11987654321',
        endereco: {
          cep: '01310100',
          logradouro: 'Avenida Paulista',
          numero: '1000',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          estado: 'SP'
        }
      })
      .select()
      .single();

    if (createError) throw createError;
    clienteId = created.id;

    // Editar
    const { error: updateError } = await supabase
      .from('clientes')
      .update({ telefone: '11999999999' })
      .eq('id', clienteId);

    if (updateError) throw updateError;

    // Excluir
    const { error: deleteError } = await supabase
      .from('clientes')
      .delete()
      .eq('id', clienteId);

    if (deleteError) throw deleteError;

    const duration = performance.now() - start;

    results.push({
      name: 'CRUD Cliente',
      status: 'success',
      message: 'Operações de CRUD funcionando corretamente',
      duration
    });
  } catch (error: any) {
    results.push({
      name: 'CRUD Cliente',
      status: 'error',
      message: error.message,
      duration: 0
    });

    // Limpar se necessário
    if (clienteId) {
      await supabase.from('clientes').delete().eq('id', clienteId);
    }
  }

  // Test 2: CRUD Material Estoque
  let materialId: string | null = null;
  try {
    const start = performance.now();

    // Criar
    const { data: created, error: createError } = await supabase
      .from('materiais_estoque')
      .insert({
        id: `TESTE-${Date.now()}`,
        nome: '[TESTE] Material Validação',
        categoria: 'iluminacao',
        quantidade_total: 10,
        quantidade_disponivel: 10
      })
      .select()
      .single();

    if (createError) throw createError;
    materialId = created.id;

    // Editar
    const { error: updateError } = await supabase
      .from('materiais_estoque')
      .update({ quantidade_total: 15, quantidade_disponivel: 15 })
      .eq('id', materialId);

    if (updateError) throw updateError;

    // Excluir
    const { error: deleteError } = await supabase
      .from('materiais_estoque')
      .delete()
      .eq('id', materialId);

    if (deleteError) throw deleteError;

    const duration = performance.now() - start;

    results.push({
      name: 'CRUD Estoque',
      status: 'success',
      message: 'Operações de CRUD funcionando corretamente',
      duration
    });
  } catch (error: any) {
    results.push({
      name: 'CRUD Estoque',
      status: 'error',
      message: error.message,
      duration: 0
    });

    // Limpar se necessário
    if (materialId) {
      await supabase.from('materiais_estoque').delete().eq('id', materialId);
    }
  }

  // Test 3: CRUD Demanda
  let demandaId: string | null = null;
  try {
    const start = performance.now();

    // Criar
    const { data: created, error: createError } = await supabase
      .from('demandas')
      .insert({
        titulo: '[TESTE] Demanda Validação',
        descricao: 'Descrição da demanda de teste para validação',
        categoria: 'tecnica' as const,
        prioridade: 'media' as const,
        status: 'aberta' as const,
        solicitante: 'Sistema de Teste',
      })
      .select()
      .single();

    if (createError) throw createError;
    demandaId = created.id;

    // Editar
    const { error: updateError } = await supabase
      .from('demandas')
      .update({ status: 'em-andamento' })
      .eq('id', demandaId);

    if (updateError) throw updateError;

    // Excluir
    const { error: deleteError } = await supabase
      .from('demandas')
      .delete()
      .eq('id', demandaId);

    if (deleteError) throw deleteError;

    const duration = performance.now() - start;

    results.push({
      name: 'CRUD Demanda',
      status: 'success',
      message: 'Operações de CRUD funcionando corretamente',
      duration
    });
  } catch (error: any) {
    results.push({
      name: 'CRUD Demanda',
      status: 'error',
      message: error.message,
      duration: 0
    });

    // Limpar se necessário
    if (demandaId) {
      await supabase.from('demandas').delete().eq('id', demandaId);
    }
  }

  // Test 4: Queries com filtros
  try {
    const start = performance.now();

    // Testar query de eventos com filtros
    const { data: eventos, error: eventosError } = await supabase
      .from('eventos')
      .select('*')
      .eq('status', 'confirmado')
      .limit(10);

    if (eventosError) throw eventosError;

    // Testar query de clientes com busca
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select('*')
      .ilike('nome', '%teste%')
      .limit(10);

    if (clientesError) throw clientesError;

    // Testar query de estoque com joins
    const { data: estoque, error: estoqueError } = await supabase
      .from('materiais_estoque')
      .select('*, seriais:materiais_seriais(count)')
      .limit(10);

    if (estoqueError) throw estoqueError;

    const duration = performance.now() - start;

    results.push({
      name: 'Queries com Filtros',
      status: 'success',
      message: 'Queries complexas funcionando corretamente',
      duration
    });
  } catch (error: any) {
    results.push({
      name: 'Queries com Filtros',
      status: 'error',
      message: error.message,
      duration: 0
    });
  }

  return results;
}
