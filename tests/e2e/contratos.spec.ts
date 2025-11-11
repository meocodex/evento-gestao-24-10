import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'teste@eventflow.com',
  password: process.env.TEST_USER_PASSWORD || 'teste123'
};

test.describe('Contratos - Gestão Completa', () => {
  let contratoId: string;
  let clienteId: string;
  let templateId: string;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Criar cliente de teste
    clienteId = await page.evaluate(async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('clientes')
        .insert({
          nome: `Cliente Contrato ${Date.now()}`,
          tipo: 'pf',
          documento: '12345678900',
          email: `contrato${Date.now()}@test.com`,
          telefone: '11999999999'
        })
        .select()
        .single();
      return data?.id;
    });

    await page.goto('/contratos');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    if (contratoId) {
      await page.evaluate(async (id) => {
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase.from('contratos').delete().eq('id', id);
      }, contratoId);
    }
    if (templateId) {
      await page.evaluate(async (id) => {
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase.from('contratos_templates').delete().eq('id', id);
      }, templateId);
    }
    if (clienteId) {
      await page.evaluate(async (id) => {
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase.from('clientes').delete().eq('id', id);
      }, clienteId);
    }
  });

  test('deve listar contratos existentes', async ({ page }) => {
    await expect(page.locator('h1:has-text("Contratos")')).toBeVisible();
  });

  test('deve criar proposta', async ({ page }) => {
    await page.click('button:has-text("Nova Proposta")');
    await page.waitForSelector('form');

    const numero = `PROP-${Date.now()}`;
    await page.fill('input[name="numero"]', numero);
    
    await page.click('[data-testid="cliente-select"]');
    await page.click(`[data-value="${clienteId}"]`);

    await page.fill('input[name="titulo"]', 'Proposta Teste');
    await page.fill('textarea[name="descricao"]', 'Descrição da proposta');
    await page.fill('input[name="valor_total"]', '5000');

    // Adicionar item
    await page.click('button:has-text("Adicionar Item")');
    await page.fill('input[name="item_descricao"]', 'Serviço 1');
    await page.fill('input[name="item_quantidade"]', '10');
    await page.fill('input[name="item_valor"]', '500');

    await page.click('button[type="submit"]:has-text("Criar")');
    await expect(page.locator('text=Proposta criada com sucesso')).toBeVisible();

    contratoId = await page.evaluate(async (numero) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('contratos')
        .select('id')
        .eq('numero', numero)
        .single();
      return data?.id;
    }, numero);
  });

  test('deve criar template de contrato', async ({ page }) => {
    await page.click('button:has-text("Templates")');
    await page.click('button:has-text("Novo Template")');
    await page.waitForSelector('form');

    const nome = `Template ${Date.now()}`;
    await page.fill('input[name="nome"]', nome);
    await page.fill('textarea[name="descricao"]', 'Template para eventos corporativos');
    await page.fill('textarea[name="clausulas"]', 'Cláusula 1: ...\nCláusula 2: ...');

    await page.click('button[type="submit"]:has-text("Salvar")');
    await expect(page.locator('text=Template criado com sucesso')).toBeVisible();

    templateId = await page.evaluate(async (nome) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('contratos_templates')
        .select('id')
        .eq('nome', nome)
        .single();
      return data?.id;
    }, nome);
  });

  test('deve usar template ao criar contrato', async ({ page }) => {
    // Criar template primeiro
    const nomeTemplate = `Template Uso ${Date.now()}`;
    templateId = await page.evaluate(async (nome) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('contratos_templates')
        .insert({
          nome,
          descricao: 'Template teste',
          clausulas: 'Cláusulas padrão',
          valor_sugerido: 3000
        })
        .select()
        .single();
      return data?.id;
    }, nomeTemplate);

    await page.reload();
    await page.click('button:has-text("Nova Proposta")');
    
    await page.click('[data-testid="template-select"]');
    await page.click(`[data-value="${templateId}"]`);
    await page.waitForTimeout(500);

    // Verificar que campos foram preenchidos do template
    await expect(page.locator('textarea[name="clausulas"]')).toHaveValue('Cláusulas padrão');
    await expect(page.locator('input[name="valor_total"]')).toHaveValue('3000');
  });

  test('deve converter proposta para contrato', async ({ page }) => {
    // Criar proposta
    const numero = `PROP-CONV-${Date.now()}`;
    contratoId = await page.evaluate(async ({ numero, clienteId }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('contratos')
        .insert({
          numero,
          cliente_id: clienteId,
          tipo: 'proposta',
          titulo: 'Proposta Conversão',
          valor_total: 5000,
          status: 'enviado'
        })
        .select()
        .single();
      return data?.id;
    }, { numero, clienteId });

    await page.reload();
    await page.click(`[data-contrato-id="${contratoId}"]`);
    await page.click('button:has-text("Converter para Contrato")');
    await page.waitForSelector('[role="dialog"]');

    await page.fill('input[name="data_assinatura"]', '2024-12-31');
    await page.click('button[type="submit"]:has-text("Converter")');

    await expect(page.locator('text=Convertido para contrato com sucesso')).toBeVisible();
  });

  test('deve filtrar contratos por status', async ({ page }) => {
    await page.click('[data-testid="filtro-status"]');
    await page.click('text=Ativo');
    await page.waitForTimeout(500);

    const statusBadges = await page.locator('[data-status-badge]').allTextContents();
    statusBadges.forEach(badge => {
      expect(badge.toLowerCase()).toContain('ativo');
    });
  });

  test('deve filtrar contratos por tipo', async ({ page }) => {
    await page.click('[data-testid="filtro-tipo"]');
    await page.click('text=Proposta');
    await page.waitForTimeout(500);

    const tipoBadges = await page.locator('[data-tipo-badge]').allTextContents();
    tipoBadges.forEach(badge => {
      expect(badge.toLowerCase()).toContain('proposta');
    });
  });

  test('deve visualizar detalhes do contrato', async ({ page }) => {
    const numero = `CONT-DET-${Date.now()}`;
    contratoId = await page.evaluate(async ({ numero, clienteId }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('contratos')
        .insert({
          numero,
          cliente_id: clienteId,
          tipo: 'contrato',
          titulo: 'Contrato Detalhes',
          valor_total: 8000,
          status: 'ativo',
          data_inicio: new Date().toISOString(),
          data_fim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();
      return data?.id;
    }, { numero, clienteId });

    await page.reload();
    await page.click(`[data-contrato-id="${contratoId}"]`);

    await expect(page.locator(`text=${numero}`)).toBeVisible();
    await expect(page.locator('text=Contrato Detalhes')).toBeVisible();
    await expect(page.locator('text=8.000')).toBeVisible();
  });

  test('deve simular parcelas de faturamento', async ({ page }) => {
    const numero = `CONT-SIMUL-${Date.now()}`;
    contratoId = await page.evaluate(async ({ numero, clienteId }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('contratos')
        .insert({
          numero,
          cliente_id: clienteId,
          tipo: 'contrato',
          titulo: 'Contrato Simulação',
          valor_total: 12000,
          status: 'ativo'
        })
        .select()
        .single();
      return data?.id;
    }, { numero, clienteId });

    await page.reload();
    await page.click(`[data-contrato-id="${contratoId}"]`);
    await page.click('button:has-text("Simular Faturamento")');
    await page.waitForSelector('[role="dialog"]');

    await page.fill('input[name="numero_parcelas"]', '3');
    await page.fill('input[name="data_primeira_parcela"]', '2024-01-15');
    await page.click('button:has-text("Simular")');

    // Verificar parcelas geradas
    await expect(page.locator('text=Parcela 1/3')).toBeVisible();
    await expect(page.locator('text=4.000')).toBeVisible(); // 12000 / 3
  });

  test('deve validar campos obrigatórios ao criar proposta', async ({ page }) => {
    await page.click('button:has-text("Nova Proposta")');
    await page.click('button[type="submit"]:has-text("Criar")');
    
    await expect(page.locator('text=obrigatório')).toBeVisible();
  });
});
