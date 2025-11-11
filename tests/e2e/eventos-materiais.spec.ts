import { test, expect } from '@playwright/test';
import { EventosTestHelper } from '../helpers/eventos-helpers';

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'admin@test.com',
  password: process.env.TEST_USER_PASSWORD || 'admin123',
};

test.describe('Eventos - Gestão de Materiais', () => {
  let helper: EventosTestHelper;
  let eventoId: string;
  let clienteId: string;
  let materialId: string;

  test.beforeEach(async ({ page }) => {
    helper = new EventosTestHelper(page);

    // Login
    await page.goto('/auth');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Criar dados de teste
    const dados = helper.gerarDadosAleatorios();
    
    const comercialId = await page.evaluate(async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || '';
    });

    clienteId = await helper.criarClienteTeste(dados.cliente);
    materialId = await helper.criarMaterialTeste(dados.material);
    eventoId = await helper.criarEventoTeste(dados.evento, clienteId, comercialId);
  });

  test.afterEach(async () => {
    await helper.limparDadosTeste(eventoId, clienteId, materialId);
  });

  test('deve adicionar material ao evento', async ({ page }) => {
    await helper.navegarParaDetalhes(eventoId);
    await helper.abrirAba('materiais');
    
    // Clicar para adicionar material
    await page.click('button:has-text("Adicionar Material")');
    await helper.aguardarCarregamento();
    
    // Preencher formulário
    await page.click('button[role="combobox"]'); // Abrir select de material
    await page.click(`text=/Material Teste/`);
    
    // Selecionar serial
    await page.click('button[role="combobox"]:visible'); // Select de serial
    await page.click(`text=/SN/`);
    
    // Confirmar
    await page.click('button:has-text("Adicionar")');
    await helper.aguardarCarregamento();
    
    // Verificar que material foi adicionado
    await expect(page.locator('text=/Material Teste/')).toBeVisible();
  });

  test('deve registrar retirada de material', async ({ page }) => {
    // Primeiro adicionar material
    await page.evaluate(async ({ eventoId, materialId }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.from('eventos_materiais_alocados').insert({
        evento_id: eventoId,
        item_id: materialId,
        nome: 'Material Teste',
        serial: 'SN123',
        quantidade_alocada: 1,
        status: 'reservado',
        tipo_envio: 'retirada',
      });
    }, { eventoId, materialId });

    await helper.navegarParaDetalhes(eventoId);
    await helper.abrirAba('materiais');
    await helper.aguardarCarregamento();
    
    // Abrir opções do material
    await page.click('button[aria-label*="menu" i]').first();
    
    // Clicar em registrar retirada
    await page.click('text=/Registrar Retirada/i');
    await helper.aguardarCarregamento();
    
    // Preencher dados da retirada
    await page.fill('input[name*="nome" i]', 'João Silva');
    await page.fill('input[name*="documento" i]', '12345678900');
    await page.fill('input[name*="telefone" i]', '11999999999');
    
    // Confirmar
    await page.click('button:has-text("Confirmar")');
    await helper.aguardarCarregamento();
    
    // Verificar mudança de status
    await expect(page.locator('text=/Retirado/i')).toBeVisible();
  });

  test('deve devolver material', async ({ page }) => {
    // Adicionar material retirado
    await page.evaluate(async ({ eventoId, materialId }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.from('eventos_materiais_alocados').insert({
        evento_id: eventoId,
        item_id: materialId,
        nome: 'Material Teste',
        serial: 'SN123',
        quantidade_alocada: 1,
        quantidade_devolvida: 0,
        status: 'retirado',
        tipo_envio: 'retirada',
        data_retirada: new Date().toISOString(),
        retirado_por_nome: 'João Silva',
        retirado_por_documento: '12345678900',
        retirado_por_telefone: '11999999999',
      });
    }, { eventoId, materialId });

    await helper.navegarParaDetalhes(eventoId);
    await helper.abrirAba('materiais');
    await helper.aguardarCarregamento();
    
    // Abrir opções do material
    await page.click('button[aria-label*="menu" i]').first();
    
    // Clicar em devolver
    await page.click('text=/Devolver/i');
    await helper.aguardarCarregamento();
    
    // Confirmar devolução
    await page.click('button:has-text("Confirmar Devolução")');
    await helper.aguardarCarregamento();
    
    // Verificar que material foi devolvido
    await expect(page.locator('text=/Devolvido/i')).toBeVisible();
  });

  test('deve gerar declaração de transporte', async ({ page }) => {
    // Adicionar material
    await page.evaluate(async ({ eventoId, materialId }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.from('eventos_materiais_alocados').insert({
        evento_id: eventoId,
        item_id: materialId,
        nome: 'Material Teste',
        serial: 'SN123',
        quantidade_alocada: 1,
        status: 'reservado',
        tipo_envio: 'antecipado',
        valor_declarado: 5000,
      });
    }, { eventoId, materialId });

    await helper.navegarParaDetalhes(eventoId);
    await helper.abrirAba('materiais');
    await helper.aguardarCarregamento();
    
    // Selecionar material
    await page.click('input[type="checkbox"]').first();
    
    // Abrir dialog de declaração
    await page.click('button:has-text("Gerar Declaração")');
    await helper.aguardarCarregamento();
    
    // Verificar que dialog abriu
    await expect(page.locator('text=/Declaração de Transporte/i')).toBeVisible();
  });

  test('deve vincular frete a material', async ({ page }) => {
    // Adicionar material
    await page.evaluate(async ({ eventoId, materialId }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.from('eventos_materiais_alocados').insert({
        evento_id: eventoId,
        item_id: materialId,
        nome: 'Material Teste',
        serial: 'SN123',
        quantidade_alocada: 1,
        status: 'reservado',
        tipo_envio: 'antecipado',
      });
    }, { eventoId, materialId });

    await helper.navegarParaDetalhes(eventoId);
    await helper.abrirAba('materiais');
    await helper.aguardarCarregamento();
    
    // Abrir opções do material
    await page.click('button[aria-label*="menu" i]').first();
    
    // Clicar em vincular frete
    await page.click('text=/Vincular Frete/i');
    await helper.aguardarCarregamento();
    
    // Verificar que dialog abriu
    await expect(page.locator('text=/Vincular Frete/i')).toBeVisible();
  });

  test('deve validar quantidade disponível ao adicionar material', async ({ page }) => {
    // Criar material sem estoque disponível
    const materialSemEstoque = `TEST_SEM_ESTOQUE_${Date.now()}`;
    await page.evaluate(async ({ materialId }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.from('materiais_estoque').insert({
        id: materialId,
        nome: 'Material Sem Estoque',
        categoria: 'Equipamentos',
        tipo_controle: 'quantidade',
        quantidade_total: 10,
        quantidade_disponivel: 0, // Sem estoque disponível
      });
    }, { materialId: materialSemEstoque });

    await helper.navegarParaDetalhes(eventoId);
    await helper.abrirAba('materiais');
    
    // Tentar adicionar material sem estoque
    await page.click('button:has-text("Adicionar Material")');
    await helper.aguardarCarregamento();
    
    await page.click('button[role="combobox"]');
    await page.click('text=/Material Sem Estoque/');
    
    // Tentar adicionar quantidade maior que disponível
    await page.fill('input[type="number"]', '5');
    
    // Deve mostrar erro ou não permitir
    const addButton = page.locator('button:has-text("Adicionar")');
    const isDisabled = await addButton.isDisabled();
    expect(isDisabled).toBe(true);

    // Limpar material de teste
    await page.evaluate(async ({ materialId }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.from('materiais_estoque').delete().eq('id', materialId);
    }, { materialId: materialSemEstoque });
  });
});
