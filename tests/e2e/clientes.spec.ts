import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'teste@eventflow.com',
  password: process.env.TEST_USER_PASSWORD || 'teste123'
};

test.describe('Clientes - CRUD Completo', () => {
  let clienteId: string;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    await page.goto('/clientes');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    if (clienteId) {
      await page.evaluate(async (id) => {
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase.from('clientes').delete().eq('id', id);
      }, clienteId);
    }
  });

  test('deve listar clientes existentes', async ({ page }) => {
    await expect(page.locator('h1:has-text("Clientes")')).toBeVisible();
    // Deve mostrar lista ou empty state
    const hasClientes = await page.locator('[data-cliente-card]').count() > 0;
    const hasEmptyState = await page.locator('text=Nenhum cliente encontrado').isVisible();
    expect(hasClientes || hasEmptyState).toBeTruthy();
  });

  test('deve buscar cliente por nome', async ({ page }) => {
    // Criar cliente para busca
    const nome = `Cliente Busca ${Date.now()}`;
    clienteId = await page.evaluate(async (nome) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('clientes')
        .insert({
          nome,
          tipo: 'pf',
          documento: '12345678900',
          email: `teste${Date.now()}@test.com`,
          telefone: '11999999999'
        })
        .select()
        .single();
      return data?.id;
    }, nome);

    await page.reload();
    await page.fill('input[placeholder*="Buscar"]', nome);
    await page.waitForTimeout(1000); // Debounce

    await expect(page.locator(`text=${nome}`)).toBeVisible();
  });

  test('deve criar cliente pessoa física', async ({ page }) => {
    await page.click('button:has-text("Novo Cliente")');
    await page.waitForSelector('form');

    const timestamp = Date.now();
    await page.fill('input[name="nome"]', `Cliente PF ${timestamp}`);
    await page.click('[data-testid="tipo-select"]');
    await page.click('text=Pessoa Física');
    await page.fill('input[name="documento"]', '12345678900');
    await page.fill('input[name="email"]', `pf${timestamp}@test.com`);
    await page.fill('input[name="telefone"]', '11999999999');
    await page.fill('input[name="cep"]', '01310100');
    
    // Aguardar busca CEP
    await page.waitForTimeout(1500);
    
    await page.fill('input[name="numero"]', '100');
    await page.click('button[type="submit"]:has-text("Salvar")');

    await expect(page.locator('text=Cliente criado com sucesso')).toBeVisible();

    // Capturar ID para limpeza
    clienteId = await page.evaluate(async (nome) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('clientes')
        .select('id')
        .eq('nome', nome)
        .single();
      return data?.id;
    }, `Cliente PF ${timestamp}`);
  });

  test('deve criar cliente pessoa jurídica', async ({ page }) => {
    await page.click('button:has-text("Novo Cliente")');
    await page.waitForSelector('form');

    const timestamp = Date.now();
    await page.fill('input[name="nome"]', `Empresa ${timestamp}`);
    await page.click('[data-testid="tipo-select"]');
    await page.click('text=Pessoa Jurídica');
    await page.fill('input[name="documento"]', '12345678000195');
    await page.fill('input[name="email"]', `pj${timestamp}@test.com`);
    await page.fill('input[name="telefone"]', '1133334444');
    await page.fill('input[name="cep"]', '01310100');
    await page.waitForTimeout(1500);
    await page.fill('input[name="numero"]', '200');
    await page.click('button[type="submit"]:has-text("Salvar")');

    await expect(page.locator('text=Cliente criado com sucesso')).toBeVisible();

    clienteId = await page.evaluate(async (nome) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('clientes')
        .select('id')
        .eq('nome', nome)
        .single();
      return data?.id;
    }, `Empresa ${timestamp}`);
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    await page.click('button:has-text("Novo Cliente")');
    await page.click('button[type="submit"]:has-text("Salvar")');
    
    // Deve mostrar erros de validação
    await expect(page.locator('text=obrigatório')).toBeVisible();
  });

  test('deve editar cliente existente', async ({ page }) => {
    // Criar cliente
    const nomeOriginal = `Cliente Editar ${Date.now()}`;
    clienteId = await page.evaluate(async (nome) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('clientes')
        .insert({
          nome,
          tipo: 'pf',
          documento: '12345678900',
          email: `edit${Date.now()}@test.com`,
          telefone: '11888888888'
        })
        .select()
        .single();
      return data?.id;
    }, nomeOriginal);

    await page.reload();
    await page.click(`[data-cliente-id="${clienteId}"]`);
    await page.click('button:has-text("Editar")');

    const novoNome = `Cliente Editado ${Date.now()}`;
    await page.fill('input[name="nome"]', novoNome);
    await page.fill('input[name="telefone"]', '11777777777');
    await page.click('button[type="submit"]:has-text("Salvar")');

    await expect(page.locator('text=Cliente atualizado com sucesso')).toBeVisible();
    await expect(page.locator(`text=${novoNome}`)).toBeVisible();
  });

  test('deve visualizar detalhes do cliente', async ({ page }) => {
    const nome = `Cliente Detalhes ${Date.now()}`;
    clienteId = await page.evaluate(async (nome) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('clientes')
        .insert({
          nome,
          tipo: 'pf',
          documento: '12345678900',
          email: `det${Date.now()}@test.com`,
          telefone: '11666666666',
          whatsapp: '11666666666',
          cep: '01310100',
          endereco: 'Av. Paulista',
          numero: '1000',
          cidade: 'São Paulo',
          estado: 'SP'
        })
        .select()
        .single();
      return data?.id;
    }, nome);

    await page.reload();
    await page.click(`[data-cliente-id="${clienteId}"]`);

    // Verificar que detalhes estão visíveis
    await expect(page.locator(`text=${nome}`)).toBeVisible();
    await expect(page.locator('text=Av. Paulista')).toBeVisible();
    await expect(page.locator('text=São Paulo')).toBeVisible();
  });

  test('deve excluir cliente sem vínculos', async ({ page }) => {
    const nome = `Cliente Excluir ${Date.now()}`;
    clienteId = await page.evaluate(async (nome) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('clientes')
        .insert({
          nome,
          tipo: 'pf',
          documento: '12345678900',
          email: `del${Date.now()}@test.com`,
          telefone: '11555555555'
        })
        .select()
        .single();
      return data?.id;
    }, nome);

    await page.reload();
    await page.click(`[data-cliente-id="${clienteId}"]`);
    await page.click('button[aria-label="Mais opções"]');
    await page.click('text=Excluir');
    await page.click('button:has-text("Confirmar")');

    await expect(page.locator('text=Cliente excluído com sucesso')).toBeVisible();
    clienteId = ''; // Já foi excluído
  });

  test('deve filtrar por tipo de cliente', async ({ page }) => {
    await page.click('[data-testid="filtro-tipo"]');
    await page.click('text=Pessoa Física');
    await page.waitForTimeout(500);

    // Todos os cards visíveis devem ser PF
    const cards = await page.locator('[data-cliente-card]').all();
    for (const card of cards) {
      const tipoBadge = await card.locator('[data-tipo-badge]').textContent();
      expect(tipoBadge).toContain('PF');
    }
  });
});
