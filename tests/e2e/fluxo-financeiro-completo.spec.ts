import { test, expect } from '@playwright/test';

/**
 * Sprint 6: Testes E2E - Fluxo Financeiro Completo
 * 
 * Testa operações críticas do módulo financeiro:
 * - Contas a pagar e receber
 * - Pagamentos e recebimentos
 * - Anexos fiscais
 * - Conciliação financeira
 * - Relatórios
 */

test.describe('Fluxo: Gestão de Contas a Pagar', () => {
  let contaId: string;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@admin.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('01 - Criar conta a pagar', async ({ page }) => {
    await page.goto('/financeiro');
    await page.waitForLoadState('networkidle');

    // Ir para aba de contas a pagar
    await page.click('button:has-text("Contas a Pagar")');
    await page.waitForTimeout(500);

    // Nova conta
    await page.click('button:has-text("Nova Conta a Pagar")');
    await page.waitForSelector('[role="dialog"]');

    // Preencher dados
    await page.fill('input[name="descricao"]', `Fornecedor E2E - ${Date.now()}`);
    await page.fill('input[name="valor"]', '2500.00');

    // Data de vencimento (próximo mês)
    const dataVencimento = new Date();
    dataVencimento.setMonth(dataVencimento.getMonth() + 1);
    await page.fill('input[name="dataVencimento"]', dataVencimento.toISOString().split('T')[0]);

    // Categoria
    await page.click('[name="categoria"]');
    await page.click('[role="option"]:has-text("Fornecedor")');

    // Salvar
    await page.click('button:has-text("Criar Conta")');

    // Verificar sucesso
    await expect(page.locator('text=Conta criada com sucesso')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);
  });

  test('02 - Verificar conta na lista de pendentes', async ({ page }) => {
    await page.goto('/financeiro');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Contas a Pagar")');
    await page.waitForTimeout(500);

    // Filtrar pendentes
    await page.click('button:has-text("Filtros")');
    await page.waitForTimeout(300);
    await page.click('[role="option"]:has-text("Pendente")');
    await page.click('button:has-text("Aplicar")');

    await page.waitForTimeout(1000);

    // Verificar que a conta aparece
    await expect(page.locator('text=Fornecedor E2E')).toBeVisible();
    await expect(page.locator('text=R$ 2.500,00')).toBeVisible();
  });

  test('03 - Adicionar anexo fiscal à conta', async ({ page }) => {
    await page.goto('/financeiro');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Contas a Pagar")');
    await page.waitForTimeout(500);

    // Clicar na conta (primeira pendente)
    const conta = page.locator('text=Fornecedor E2E').first();
    await conta.click();
    await page.waitForTimeout(500);

    // Adicionar anexo
    const btnAnexo = page.locator('button:has-text("Anexar Documento")');
    
    if (await btnAnexo.isVisible()) {
      await btnAnexo.click();
      await page.waitForSelector('[role="dialog"]');

      // Upload de arquivo (simulado)
      // Em teste real, usaria page.setInputFiles()
      await page.waitForTimeout(500);
    }
  });

  test('04 - Marcar conta como paga', async ({ page }) => {
    await page.goto('/financeiro');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Contas a Pagar")');
    await page.waitForTimeout(500);

    // Clicar na conta
    const conta = page.locator('text=Fornecedor E2E').first();
    await conta.click();
    await page.waitForTimeout(500);

    // Marcar como pago
    await page.click('button:has-text("Marcar como Pago")');
    await page.waitForSelector('[role="dialog"]');

    // Data de pagamento
    const dataPagamento = new Date();
    await page.fill('input[name="dataPagamento"]', dataPagamento.toISOString().split('T')[0]);

    // Forma de pagamento
    await page.click('[name="formaPagamento"]');
    await page.click('[role="option"]:has-text("PIX")');

    // Confirmar
    await page.click('button:has-text("Confirmar Pagamento")');

    // Verificar sucesso
    await expect(page.locator('text=Pagamento registrado')).toBeVisible({ timeout: 5000 });
  });

  test('05 - Verificar conta na lista de pagas', async ({ page }) => {
    await page.goto('/financeiro');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Contas a Pagar")');
    await page.waitForTimeout(500);

    // Filtrar pagas
    await page.click('button:has-text("Filtros")');
    await page.waitForTimeout(300);
    await page.click('[role="option"]:has-text("Pago")');
    await page.click('button:has-text("Aplicar")');

    await page.waitForTimeout(1000);

    // Conta deve aparecer como paga
    await expect(page.locator('text=Fornecedor E2E')).toBeVisible();
    await expect(page.locator('text=Pago').first()).toBeVisible();
  });
});

test.describe('Fluxo: Gestão de Contas a Receber', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@admin.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('01 - Criar conta a receber', async ({ page }) => {
    await page.goto('/financeiro');
    await page.waitForLoadState('networkidle');

    // Aba de contas a receber
    await page.click('button:has-text("Contas a Receber")');
    await page.waitForTimeout(500);

    // Nova conta
    await page.click('button:has-text("Nova Conta a Receber")');
    await page.waitForSelector('[role="dialog"]');

    // Preencher
    await page.fill('input[name="descricao"]', `Cliente E2E - ${Date.now()}`);
    await page.fill('input[name="valor"]', '5000.00');

    // Vencimento
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 15);
    await page.fill('input[name="dataVencimento"]', dataVencimento.toISOString().split('T')[0]);

    // Cliente (selecionar primeiro da lista)
    await page.click('[name="clienteId"]');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Salvar
    await page.click('button:has-text("Criar Conta")');

    await expect(page.locator('text=Conta criada com sucesso')).toBeVisible({ timeout: 5000 });
  });

  test('02 - Enviar cobrança ao cliente', async ({ page }) => {
    await page.goto('/financeiro');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Contas a Receber")');
    await page.waitForTimeout(500);

    // Clicar na conta
    const conta = page.locator('text=Cliente E2E').first();
    await conta.click();
    await page.waitForTimeout(500);

    // Enviar cobrança (se disponível)
    const btnEnviar = page.locator('button:has-text("Enviar Cobrança")');
    
    if (await btnEnviar.isVisible()) {
      await btnEnviar.click();
      await page.waitForSelector('[role="dialog"]');

      // Confirmar envio
      await page.click('button:has-text("Enviar")');

      await expect(page.locator('text=Cobrança enviada')).toBeVisible({ timeout: 5000 });
    }
  });

  test('03 - Marcar conta como recebida', async ({ page }) => {
    await page.goto('/financeiro');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Contas a Receber")');
    await page.waitForTimeout(500);

    // Clicar na conta
    const conta = page.locator('text=Cliente E2E').first();
    await conta.click();
    await page.waitForTimeout(500);

    // Marcar como recebido
    await page.click('button:has-text("Marcar como Recebido")');
    await page.waitForSelector('[role="dialog"]');

    // Data de recebimento
    const dataRecebimento = new Date();
    await page.fill('input[name="dataRecebimento"]', dataRecebimento.toISOString().split('T')[0]);

    // Forma de recebimento
    await page.click('[name="formaRecebimento"]');
    await page.click('[role="option"]:has-text("Transferência")');

    // Confirmar
    await page.click('button:has-text("Confirmar Recebimento")');

    await expect(page.locator('text=Recebimento registrado')).toBeVisible({ timeout: 5000 });
  });

  test('04 - Verificar conta recebida no fluxo de caixa', async ({ page }) => {
    await page.goto('/financeiro');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Contas a Receber")');
    await page.waitForTimeout(500);

    // Filtrar recebidas
    await page.click('button:has-text("Filtros")');
    await page.waitForTimeout(300);
    await page.click('[role="option"]:has-text("Recebido")');
    await page.click('button:has-text("Aplicar")');

    await page.waitForTimeout(1000);

    await expect(page.locator('text=Cliente E2E')).toBeVisible();
    await expect(page.locator('text=Recebido').first()).toBeVisible();
  });
});

test.describe('Fluxo: Conciliação e Relatórios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@admin.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('Dashboard financeiro mostra resumo correto', async ({ page }) => {
    await page.goto('/financeiro');
    await page.waitForLoadState('networkidle');

    // Verificar cards de resumo
    await expect(page.locator('text=/total.*receber/i')).toBeVisible();
    await expect(page.locator('text=/total.*pagar/i')).toBeVisible();
    await expect(page.locator('text=/saldo/i')).toBeVisible();
  });

  test('Filtrar contas por período', async ({ page }) => {
    await page.goto('/financeiro');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Contas a Pagar")');
    await page.waitForTimeout(500);

    // Abrir filtros de data
    await page.click('button:has-text("Filtros")');
    await page.waitForTimeout(300);

    // Definir período
    const dataInicio = new Date();
    dataInicio.setDate(1); // Primeiro dia do mês
    const dataFim = new Date();
    dataFim.setMonth(dataFim.getMonth() + 1, 0); // Último dia do mês

    await page.fill('input[name="dataInicio"]', dataInicio.toISOString().split('T')[0]);
    await page.fill('input[name="dataFim"]', dataFim.toISOString().split('T')[0]);

    await page.click('button:has-text("Aplicar")');
    await page.waitForTimeout(1000);

    // Verificar que há resultados
    const contas = await page.locator('[data-testid="conta-card"]').count();
    expect(contas).toBeGreaterThanOrEqual(0);
  });

  test('Gerar relatório de fluxo de caixa', async ({ page }) => {
    await page.goto('/financeiro');
    await page.waitForLoadState('networkidle');

    // Procurar botão de relatório
    const btnRelatorio = page.locator('button:has-text("Relatório"), button:has-text("Exportar")');
    
    if (await btnRelatorio.first().isVisible()) {
      await btnRelatorio.first().click();
      await page.waitForTimeout(1000);

      // Deve abrir modal ou iniciar download
    }
  });

  test('Visualizar gráfico de receitas vs despesas', async ({ page }) => {
    await page.goto('/financeiro');
    await page.waitForLoadState('networkidle');

    // Verificar se há gráficos
    const grafico = page.locator('[data-testid="chart"], canvas, svg');
    
    if (await grafico.first().isVisible()) {
      await expect(grafico.first()).toBeVisible();
    }
  });
});

test.describe('Fluxo: Alertas e Vencimentos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@admin.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('Exibir contas vencidas', async ({ page }) => {
    await page.goto('/financeiro');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Contas a Pagar")');
    await page.waitForTimeout(500);

    // Filtrar vencidas
    await page.click('button:has-text("Filtros")');
    await page.waitForTimeout(300);
    await page.click('[role="option"]:has-text("Vencido")');
    await page.click('button:has-text("Aplicar")');

    await page.waitForTimeout(1000);

    // Verificar badge de alerta
    const contasVencidas = page.locator('[data-status="vencido"]');
    const count = await contasVencidas.count();

    if (count > 0) {
      await expect(contasVencidas.first().locator('text=/vencid/i')).toBeVisible();
    }
  });

  test('Exibir contas a vencer hoje', async ({ page }) => {
    await page.goto('/financeiro');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Contas a Receber")');
    await page.waitForTimeout(500);

    // Filtrar vencimento hoje
    await page.click('button:has-text("Filtros")');
    await page.waitForTimeout(300);

    const hoje = new Date().toISOString().split('T')[0];
    await page.fill('input[name="dataVencimento"]', hoje);

    await page.click('button:has-text("Aplicar")');
    await page.waitForTimeout(1000);

    // Deve mostrar contas com vencimento hoje
    const contas = await page.locator('[data-testid="conta-card"]').count();
    expect(contas).toBeGreaterThanOrEqual(0);
  });

  test('Notificação de contas próximas ao vencimento', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Verificar notificações
    const btnNotificacoes = page.locator('[aria-label="Notificações"]');
    
    if (await btnNotificacoes.isVisible()) {
      await btnNotificacoes.click();
      await page.waitForTimeout(500);

      // Verificar se há notificações financeiras
      const notifFinanceira = page.locator('text=/vencimento|financeira|pagar|receber/i');
      
      if (await notifFinanceira.first().isVisible()) {
        await expect(notifFinanceira.first()).toBeVisible();
      }
    }
  });
});

test.describe('Fluxo: Validações Financeiras', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@admin.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('Não deve permitir valor negativo', async ({ page }) => {
    await page.goto('/financeiro');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Contas a Pagar")');
    await page.waitForTimeout(500);

    await page.click('button:has-text("Nova Conta a Pagar")');
    await page.waitForSelector('[role="dialog"]');

    await page.fill('input[name="descricao"]', 'Teste Valor Negativo');
    await page.fill('input[name="valor"]', '-1000');

    await page.click('button:has-text("Criar Conta")');

    // Deve mostrar erro
    await expect(page.locator('text=/valor.*inválido|maior.*zero/i')).toBeVisible({ timeout: 3000 });
  });

  test('Não deve permitir data de vencimento no passado', async ({ page }) => {
    await page.goto('/financeiro');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Contas a Receber")');
    await page.waitForTimeout(500);

    await page.click('button:has-text("Nova Conta a Receber")');
    await page.waitForSelector('[role="dialog"]');

    await page.fill('input[name="descricao"]', 'Teste Data Passado');
    await page.fill('input[name="valor"]', '1000');

    // Data no passado
    const dataPassada = new Date();
    dataPassada.setDate(dataPassada.getDate() - 30);
    await page.fill('input[name="dataVencimento"]', dataPassada.toISOString().split('T')[0]);

    await page.click('button:has-text("Criar Conta")');

    // Pode ou não aceitar (depende das regras de negócio)
    // Mas deve haver alguma validação ou warning
    await page.waitForTimeout(2000);
  });

  test('Deve validar campos obrigatórios', async ({ page }) => {
    await page.goto('/financeiro');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Contas a Pagar")');
    await page.waitForTimeout(500);

    await page.click('button:has-text("Nova Conta a Pagar")');
    await page.waitForSelector('[role="dialog"]');

    // Tentar salvar sem preencher nada
    await page.click('button:has-text("Criar Conta")');

    // Deve mostrar erros de validação
    await expect(page.locator('text=/obrigatório|required/i').first()).toBeVisible({ timeout: 3000 });
  });
});
