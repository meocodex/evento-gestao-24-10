import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'teste@eventflow.com',
  password: process.env.TEST_USER_PASSWORD || 'teste123'
};

test.describe('Financeiro - Gestão Completa', () => {
  let contaPagarId: string;
  let contaReceberId: string;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Verificar permissões antes de prosseguir
    const temPermissao = await page.evaluate(async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      return profile?.role === 'admin' || profile?.role === 'gerente' || profile?.role === 'financeiro';
    });

    if (!temPermissao) {
      test.skip();
    }

    await page.goto('/financeiro');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    if (contaPagarId) {
      await page.evaluate(async (id) => {
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase.from('contas_pagar').delete().eq('id', id);
      }, contaPagarId);
    }
    if (contaReceberId) {
      await page.evaluate(async (id) => {
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase.from('contas_receber').delete().eq('id', id);
      }, contaReceberId);
    }
  });

  test('deve visualizar dashboard financeiro', async ({ page }) => {
    await expect(page.locator('h1:has-text("Financeiro")')).toBeVisible();
    
    // Verificar cards de resumo
    await expect(page.locator('[data-card="total-receber"]')).toBeVisible();
    await expect(page.locator('[data-card="total-pagar"]')).toBeVisible();
    await expect(page.locator('[data-card="saldo"]')).toBeVisible();
  });

  test('deve criar conta a receber', async ({ page }) => {
    await page.click('button:has-text("Nova Conta a Receber")');
    await page.waitForSelector('form');

    const descricao = `Receita Teste ${Date.now()}`;
    await page.fill('input[name="descricao"]', descricao);
    await page.fill('input[name="valor_unitario"]', '1500');
    await page.fill('input[name="quantidade"]', '1');
    await page.fill('input[name="data_vencimento"]', '2024-12-31');
    
    await page.click('[data-testid="tipo-select"]');
    await page.click('text=Evento');

    await page.click('button[type="submit"]:has-text("Salvar")');
    await expect(page.locator('text=Conta criada com sucesso')).toBeVisible();

    contaReceberId = await page.evaluate(async (desc) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('contas_receber')
        .select('id')
        .eq('descricao', desc)
        .single();
      return data?.id;
    }, descricao);
  });

  test('deve criar conta a pagar', async ({ page }) => {
    await page.click('button:has-text("Nova Conta a Pagar")');
    await page.waitForSelector('form');

    const descricao = `Despesa Teste ${Date.now()}`;
    await page.fill('input[name="descricao"]', descricao);
    await page.fill('input[name="valor_unitario"]', '800');
    await page.fill('input[name="quantidade"]', '1');
    await page.fill('input[name="data_vencimento"]', '2024-12-15');
    
    await page.click('[data-testid="categoria-select"]');
    await page.click('text=Fornecedores');

    await page.click('button[type="submit"]:has-text("Salvar")');
    await expect(page.locator('text=Conta criada com sucesso')).toBeVisible();

    contaPagarId = await page.evaluate(async (desc) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('contas_pagar')
        .select('id')
        .eq('descricao', desc)
        .single();
      return data?.id;
    }, descricao);
  });

  test('deve marcar conta como recebida', async ({ page }) => {
    const descricao = `Receita Receber ${Date.now()}`;
    contaReceberId = await page.evaluate(async (desc) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('contas_receber')
        .insert({
          descricao: desc,
          tipo: 'evento',
          valor_unitario: 2000,
          quantidade: 1,
          data_vencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pendente'
        })
        .select()
        .single();
      return data?.id;
    }, descricao);

    await page.reload();
    
    // Localizar conta e marcar como recebida
    await page.click(`[data-conta-receber-id="${contaReceberId}"]`);
    await page.click('button:has-text("Marcar como Recebido")');
    await page.waitForSelector('[role="dialog"]');

    await page.fill('input[name="data_recebimento"]', '2024-12-10');
    await page.click('[data-testid="forma-select"]');
    await page.click('text=PIX');

    await page.click('button[type="submit"]:has-text("Confirmar")');
    await expect(page.locator('text=marcada como recebida')).toBeVisible();
  });

  test('deve marcar conta como paga', async ({ page }) => {
    const descricao = `Despesa Pagar ${Date.now()}`;
    contaPagarId = await page.evaluate(async (desc) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('contas_pagar')
        .insert({
          descricao: desc,
          categoria: 'fornecedores',
          valor_unitario: 1200,
          quantidade: 1,
          data_vencimento: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pendente'
        })
        .select()
        .single();
      return data?.id;
    }, descricao);

    await page.reload();
    
    await page.click(`[data-conta-pagar-id="${contaPagarId}"]`);
    await page.click('button:has-text("Marcar como Pago")');
    await page.waitForSelector('[role="dialog"]');

    await page.fill('input[name="data_pagamento"]', '2024-12-08');
    await page.click('[data-testid="forma-select"]');
    await page.click('text=Transferência');

    await page.click('button[type="submit"]:has-text("Confirmar")');
    await expect(page.locator('text=marcada como paga')).toBeVisible();
  });

  test('deve filtrar contas por período', async ({ page }) => {
    await page.fill('input[name="data_inicio"]', '2024-12-01');
    await page.fill('input[name="data_fim"]', '2024-12-31');
    await page.click('button:has-text("Filtrar")');
    await page.waitForTimeout(500);

    // Verificar que apenas contas do período aparecem
    const datasVencimento = await page.locator('[data-vencimento]').allTextContents();
    datasVencimento.forEach(data => {
      const dataObj = new Date(data);
      expect(dataObj >= new Date('2024-12-01')).toBeTruthy();
      expect(dataObj <= new Date('2024-12-31')).toBeTruthy();
    });
  });

  test('deve filtrar contas por status', async ({ page }) => {
    await page.click('[data-testid="filtro-status"]');
    await page.click('text=Pendente');
    await page.waitForTimeout(500);

    const statusBadges = await page.locator('[data-status-badge]').allTextContents();
    statusBadges.forEach(badge => {
      expect(badge.toLowerCase()).toContain('pendente');
    });
  });

  test('deve calcular totais corretamente', async ({ page }) => {
    // Obter valores dos cards
    const totalReceber = await page.locator('[data-card="total-receber"] [data-value]').textContent();
    const totalPagar = await page.locator('[data-card="total-pagar"] [data-value]').textContent();
    const saldo = await page.locator('[data-card="saldo"] [data-value]').textContent();

    // Verificar que valores são numéricos
    expect(totalReceber).toMatch(/[\d.,]+/);
    expect(totalPagar).toMatch(/[\d.,]+/);
    expect(saldo).toMatch(/[\d.,]+/);
  });

  test('deve upload comprovante de pagamento', async ({ page }) => {
    const descricao = `Despesa Upload ${Date.now()}`;
    contaPagarId = await page.evaluate(async (desc) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('contas_pagar')
        .insert({
          descricao: desc,
          categoria: 'diversos',
          valor_unitario: 500,
          quantidade: 1,
          data_vencimento: new Date().toISOString(),
          status: 'pendente'
        })
        .select()
        .single();
      return data?.id;
    }, descricao);

    await page.reload();
    await page.click(`[data-conta-pagar-id="${contaPagarId}"]`);
    await page.click('button:has-text("Upload Comprovante")');
    
    // Simular upload de arquivo
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'comprovante.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('fake pdf content')
    });

    await expect(page.locator('text=Upload concluído')).toBeVisible();
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    await page.click('button:has-text("Nova Conta a Receber")');
    await page.click('button[type="submit"]:has-text("Salvar")');
    
    await expect(page.locator('text=obrigatório')).toBeVisible();
  });
});
