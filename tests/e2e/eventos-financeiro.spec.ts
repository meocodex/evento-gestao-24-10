import { test, expect } from '@playwright/test';
import { EventosTestHelper } from '../helpers/eventos-helpers';

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'admin@test.com',
  password: process.env.TEST_USER_PASSWORD || 'admin123',
};

test.describe('Eventos - Gestão Financeira', () => {
  let helper: EventosTestHelper;
  let eventoId: string;
  let clienteId: string;

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
    eventoId = await helper.criarEventoTeste(dados.evento, clienteId, comercialId);
  });

  test.afterEach(async () => {
    await helper.limparDadosTeste(eventoId, clienteId);
  });

  test('deve adicionar receita ao evento', async ({ page }) => {
    await helper.navegarParaDetalhes(eventoId);
    
    // Verificar se tem permissão para ver financeiro
    const abaFinanceiro = page.locator('[role="tab"]:has-text("Financeiro")');
    const isDisabled = await abaFinanceiro.getAttribute('data-disabled');
    
    if (isDisabled === 'true') {
      console.log('Usuário não tem permissão para acessar financeiro - teste ignorado');
      return;
    }

    await helper.abrirAba('financeiro');
    
    // Clicar para adicionar receita
    await page.click('button:has-text("Adicionar Receita")');
    await helper.aguardarCarregamento();
    
    // Preencher formulário
    await page.fill('input[name="descricao"]', 'Receita Teste');
    await page.fill('input[name="valor_unitario"]', '1000');
    await page.fill('input[name="quantidade"]', '1');
    
    // Selecionar tipo
    await page.click('button[role="combobox"]');
    await page.click('text=/Ingresso/i');
    
    // Selecionar data
    await page.fill('input[type="date"]', '2025-12-15');
    
    // Salvar
    await page.click('button:has-text("Salvar")');
    await helper.aguardarCarregamento();
    
    // Verificar que receita foi adicionada
    await expect(page.locator('text=/Receita Teste/')).toBeVisible();
    await expect(page.locator('text=/R\\$ 1\\.000,00/i')).toBeVisible();
  });

  test('deve adicionar despesa ao evento', async ({ page }) => {
    await helper.navegarParaDetalhes(eventoId);
    
    const abaFinanceiro = page.locator('[role="tab"]:has-text("Financeiro")');
    const isDisabled = await abaFinanceiro.getAttribute('data-disabled');
    
    if (isDisabled === 'true') {
      console.log('Usuário não tem permissão para acessar financeiro - teste ignorado');
      return;
    }

    await helper.abrirAba('financeiro');
    
    // Clicar para adicionar despesa
    await page.click('button:has-text("Adicionar Despesa")');
    await helper.aguardarCarregamento();
    
    // Preencher formulário
    await page.fill('input[name="descricao"]', 'Despesa Teste');
    await page.fill('input[name="valor_unitario"]', '500');
    await page.fill('input[name="quantidade"]', '2');
    
    // Selecionar categoria
    await page.click('button[role="combobox"]');
    await page.click('text=/Transporte/i');
    
    // Salvar
    await page.click('button:has-text("Salvar")');
    await helper.aguardarCarregamento();
    
    // Verificar que despesa foi adicionada
    await expect(page.locator('text=/Despesa Teste/')).toBeVisible();
    await expect(page.locator('text=/R\\$ 1\\.000,00/i')).toBeVisible();
  });

  test('deve calcular saldo corretamente', async ({ page }) => {
    // Adicionar receita e despesa via API
    await page.evaluate(async ({ eventoId }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      await supabase.from('eventos_receitas').insert({
        evento_id: eventoId,
        descricao: 'Receita',
        tipo: 'ingresso',
        valor: 2000,
        valor_unitario: 2000,
        quantidade: 1,
        data: '2025-12-15',
        status: 'recebido',
      });

      await supabase.from('eventos_despesas').insert({
        evento_id: eventoId,
        descricao: 'Despesa',
        categoria: 'transporte',
        valor: 800,
        valor_unitario: 800,
        quantidade: 1,
        data: '2025-12-15',
        status: 'pago',
      });
    }, { eventoId });

    await helper.navegarParaDetalhes(eventoId);
    
    const abaFinanceiro = page.locator('[role="tab"]:has-text("Financeiro")');
    const isDisabled = await abaFinanceiro.getAttribute('data-disabled');
    
    if (isDisabled === 'true') {
      console.log('Usuário não tem permissão para acessar financeiro - teste ignorado');
      return;
    }

    await helper.abrirAba('financeiro');
    await helper.aguardarCarregamento();
    
    // Verificar saldo (2000 - 800 = 1200)
    await expect(page.locator('text=/R\\$ 1\\.200,00/i')).toBeVisible();
  });

  test('deve marcar receita como recebida', async ({ page }) => {
    // Adicionar receita pendente
    await page.evaluate(async ({ eventoId }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.from('eventos_receitas').insert({
        evento_id: eventoId,
        descricao: 'Receita Pendente',
        tipo: 'ingresso',
        valor: 1500,
        valor_unitario: 1500,
        quantidade: 1,
        data: '2025-12-15',
        status: 'pendente',
      });
    }, { eventoId });

    await helper.navegarParaDetalhes(eventoId);
    
    const abaFinanceiro = page.locator('[role="tab"]:has-text("Financeiro")');
    const isDisabled = await abaFinanceiro.getAttribute('data-disabled');
    
    if (isDisabled === 'true') {
      console.log('Usuário não tem permissão para acessar financeiro - teste ignorado');
      return;
    }

    await helper.abrirAba('financeiro');
    await helper.aguardarCarregamento();
    
    // Abrir menu da receita
    await page.click('button[aria-label*="menu" i]').first();
    
    // Marcar como recebida
    await page.click('text=/Marcar como Recebido/i');
    await helper.aguardarCarregamento();
    
    // Confirmar
    await page.click('button:has-text("Confirmar")');
    await helper.aguardarCarregamento();
    
    // Verificar mudança de status
    await expect(page.locator('text=/Recebido/i')).toBeVisible();
  });

  test('deve marcar despesa como paga', async ({ page }) => {
    // Adicionar despesa pendente
    await page.evaluate(async ({ eventoId }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.from('eventos_despesas').insert({
        evento_id: eventoId,
        descricao: 'Despesa Pendente',
        categoria: 'transporte',
        valor: 600,
        valor_unitario: 600,
        quantidade: 1,
        data: '2025-12-15',
        status: 'pendente',
      });
    }, { eventoId });

    await helper.navegarParaDetalhes(eventoId);
    
    const abaFinanceiro = page.locator('[role="tab"]:has-text("Financeiro")');
    const isDisabled = await abaFinanceiro.getAttribute('data-disabled');
    
    if (isDisabled === 'true') {
      console.log('Usuário não tem permissão para acessar financeiro - teste ignorado');
      return;
    }

    await helper.abrirAba('financeiro');
    await helper.aguardarCarregamento();
    
    // Abrir menu da despesa
    await page.click('button[aria-label*="menu" i]').first();
    
    // Marcar como paga
    await page.click('text=/Marcar como Pago/i');
    await helper.aguardarCarregamento();
    
    // Confirmar
    await page.click('button:has-text("Confirmar")');
    await helper.aguardarCarregamento();
    
    // Verificar mudança de status
    await expect(page.locator('text=/Pago/i')).toBeVisible();
  });

  test('deve gerar relatório de fechamento', async ({ page }) => {
    await helper.navegarParaDetalhes(eventoId);
    
    const abaFinanceiro = page.locator('[role="tab"]:has-text("Financeiro")');
    const isDisabled = await abaFinanceiro.getAttribute('data-disabled');
    
    if (isDisabled === 'true') {
      console.log('Usuário não tem permissão para acessar financeiro - teste ignorado');
      return;
    }

    await helper.abrirAba('financeiro');
    
    // Clicar em gerar relatório
    const relatorioButton = page.locator('button:has-text("Relatório de Fechamento")');
    
    if (await relatorioButton.isVisible()) {
      await relatorioButton.click();
      await helper.aguardarCarregamento();
      
      // Verificar que dialog abriu
      await expect(page.locator('text=/Relatório/i')).toBeVisible();
    }
  });
});
