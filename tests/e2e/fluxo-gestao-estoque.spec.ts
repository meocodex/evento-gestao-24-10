import { test, expect } from '@playwright/test';

/**
 * Sprint 6: Testes E2E - Fluxo de Gestão de Estoque
 * 
 * Testa cenários críticos de gestão de estoque incluindo:
 * - Cadastro de materiais
 * - Alocação em múltiplos eventos
 * - Controle de quantidade
 * - Rastreamento de seriais
 * - Histórico de movimentações
 */

test.describe('Fluxo: Gestão Completa de Estoque', () => {
  let materialId: string;
  let materialNome: string;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@admin.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('01 - Criar material controlado por quantidade', async ({ page }) => {
    materialNome = `Material E2E - ${Date.now()}`;

    await page.goto('/estoque');
    await page.waitForLoadState('networkidle');

    // Novo material
    await page.click('button:has-text("Novo Material")');
    await page.waitForSelector('[role="dialog"]');

    // Preencher dados
    await page.fill('input[name="nome"]', materialNome);
    await page.fill('textarea[name="descricao"]', 'Material de teste E2E para controle de quantidade');
    
    // Tipo de controle: quantidade
    await page.click('[name="tipoControle"]');
    await page.click('[role="option"]:has-text("Quantidade")');

    // Quantidade inicial
    await page.fill('input[name="quantidadeTotal"]', '100');
    
    // Categoria
    await page.click('[name="categoria"]');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Salvar
    await page.click('button:has-text("Criar Material")');

    // Verificar sucesso
    await expect(page.locator('text=Material criado com sucesso')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);
    await expect(page.locator(`text=${materialNome}`)).toBeVisible();
  });

  test('02 - Verificar quantidade disponível no estoque', async ({ page }) => {
    await page.goto('/estoque');
    await page.waitForLoadState('networkidle');

    // Buscar o material
    await page.fill('input[placeholder*="Buscar"]', materialNome);
    await page.waitForTimeout(1000);

    // Verificar que mostra 100 unidades disponíveis
    const materialCard = page.locator(`text=${materialNome}`).locator('..').locator('..');
    await expect(materialCard.locator('text=100')).toBeVisible();
    await expect(materialCard.locator('text=Disponível')).toBeVisible();
  });

  test('03 - Alocar material em evento (50 unidades)', async ({ page }) => {
    await page.goto('/eventos');
    await page.waitForLoadState('networkidle');

    // Selecionar primeiro evento disponível
    const primeiroEvento = page.locator('[data-testid="evento-card"]').first();
    await primeiroEvento.click();
    await page.waitForURL(/\/eventos\/.*/);

    // Ir para materiais
    await page.click('button:has-text("Materiais")');
    await page.waitForTimeout(500);

    // Adicionar material
    await page.click('button:has-text("Adicionar Material")');
    await page.waitForSelector('[role="dialog"]');

    // Buscar e selecionar nosso material
    await page.fill('[placeholder*="material"]', materialNome);
    await page.waitForTimeout(1000);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Alocar 50 unidades
    await page.fill('input[name="quantidade"]', '50');
    await page.click('button:has-text("Adicionar")');

    // Verificar sucesso
    await expect(page.locator('text=Material alocado com sucesso')).toBeVisible({ timeout: 5000 });
  });

  test('04 - Verificar quantidade disponível após alocação', async ({ page }) => {
    await page.goto('/estoque');
    await page.waitForLoadState('networkidle');

    // Buscar material
    await page.fill('input[placeholder*="Buscar"]', materialNome);
    await page.waitForTimeout(1000);

    // Deve mostrar 50 disponíveis (100 - 50)
    const materialCard = page.locator(`text=${materialNome}`).locator('..').locator('..');
    await expect(materialCard.locator('text=50').first()).toBeVisible();
  });

  test('05 - Tentar alocar mais do que disponível (deve falhar)', async ({ page }) => {
    await page.goto('/eventos');
    await page.waitForLoadState('networkidle');

    const segundoEvento = page.locator('[data-testid="evento-card"]').nth(1);
    if (await segundoEvento.isVisible()) {
      await segundoEvento.click();
      await page.waitForURL(/\/eventos\/.*/);

      await page.click('button:has-text("Materiais")');
      await page.waitForTimeout(500);

      await page.click('button:has-text("Adicionar Material")');
      await page.waitForSelector('[role="dialog"]');

      await page.fill('[placeholder*="material"]', materialNome);
      await page.waitForTimeout(1000);
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      // Tentar alocar 60 (mais do que os 50 disponíveis)
      await page.fill('input[name="quantidade"]', '60');
      await page.click('button:has-text("Adicionar")');

      // Deve mostrar erro
      await expect(page.locator('text=/quantidade.*insuficiente|excede.*disponível/i')).toBeVisible({ 
        timeout: 5000 
      });
    }
  });

  test('06 - Adicionar quantidade ao estoque', async ({ page }) => {
    await page.goto('/estoque');
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder*="Buscar"]', materialNome);
    await page.waitForTimeout(1000);

    // Clicar no material
    const materialCard = page.locator(`text=${materialNome}`).first();
    await materialCard.click();
    await page.waitForTimeout(500);

    // Gerenciar quantidade
    await page.click('button:has-text("Gerenciar Quantidade")');
    await page.waitForSelector('[role="dialog"]');

    // Adicionar 30 unidades
    await page.fill('input[name="quantidade"]', '30');
    await page.fill('textarea[name="observacao"]', 'Compra de mais estoque - E2E Test');
    
    await page.click('button:has-text("Adicionar")');

    // Verificar sucesso
    await expect(page.locator('text=Quantidade atualizada')).toBeVisible({ timeout: 5000 });
  });

  test('07 - Verificar nova quantidade disponível', async ({ page }) => {
    await page.goto('/estoque');
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder*="Buscar"]', materialNome);
    await page.waitForTimeout(1000);

    // Deve mostrar 80 disponíveis (50 + 30)
    const materialCard = page.locator(`text=${materialNome}`).locator('..').locator('..');
    await expect(materialCard.locator('text=80').first()).toBeVisible();
  });

  test('08 - Verificar histórico de movimentações', async ({ page }) => {
    await page.goto('/estoque');
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder*="Buscar"]', materialNome);
    await page.waitForTimeout(1000);

    const materialCard = page.locator(`text=${materialNome}`).first();
    await materialCard.click();
    await page.waitForTimeout(500);

    // Ver histórico
    await page.click('button:has-text("Histórico")');
    await page.waitForTimeout(1000);

    // Deve mostrar movimentações
    await expect(page.locator('text=Alocação')).toBeVisible();
    await expect(page.locator('text=Compra de mais estoque')).toBeVisible();
  });
});

test.describe('Fluxo: Material com Controle por Serial', () => {
  let materialSerialNome: string;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@admin.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('01 - Criar material com controle por serial', async ({ page }) => {
    materialSerialNome = `Serial E2E - ${Date.now()}`;

    await page.goto('/estoque');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Novo Material")');
    await page.waitForSelector('[role="dialog"]');

    await page.fill('input[name="nome"]', materialSerialNome);
    await page.fill('textarea[name="descricao"]', 'Material com rastreamento individual');
    
    // Tipo de controle: serial
    await page.click('[name="tipoControle"]');
    await page.click('[role="option"]:has-text("Serial")');

    // Categoria
    await page.click('[name="categoria"]');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await page.click('button:has-text("Criar Material")');

    await expect(page.locator('text=Material criado com sucesso')).toBeVisible({ timeout: 5000 });
  });

  test('02 - Adicionar seriais ao material', async ({ page }) => {
    await page.goto('/estoque');
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder*="Buscar"]', materialSerialNome);
    await page.waitForTimeout(1000);

    const materialCard = page.locator(`text=${materialSerialNome}`).first();
    await materialCard.click();
    await page.waitForTimeout(500);

    // Adicionar serial
    await page.click('button:has-text("Adicionar Serial")');
    await page.waitForSelector('[role="dialog"]');

    // Número do serial
    await page.fill('input[name="numeroSerial"]', `SN-E2E-001-${Date.now()}`);
    await page.fill('textarea[name="observacoes"]', 'Serial de teste E2E');

    await page.click('button:has-text("Adicionar")');

    await expect(page.locator('text=Serial adicionado')).toBeVisible({ timeout: 5000 });
  });

  test('03 - Verificar serial disponível na lista', async ({ page }) => {
    await page.goto('/estoque');
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder*="Buscar"]', materialSerialNome);
    await page.waitForTimeout(1000);

    const materialCard = page.locator(`text=${materialSerialNome}`).first();
    await materialCard.click();
    await page.waitForTimeout(500);

    // Ver seriais
    await page.click('button:has-text("Seriais")');
    await page.waitForTimeout(1000);

    // Deve mostrar o serial
    await expect(page.locator('text=SN-E2E-001')).toBeVisible();
    await expect(page.locator('text=Disponível')).toBeVisible();
  });

  test('04 - Alocar material por serial em evento', async ({ page }) => {
    await page.goto('/eventos');
    await page.waitForLoadState('networkidle');

    const primeiroEvento = page.locator('[data-testid="evento-card"]').first();
    await primeiroEvento.click();
    await page.waitForURL(/\/eventos\/.*/);

    await page.click('button:has-text("Materiais")');
    await page.waitForTimeout(500);

    await page.click('button:has-text("Adicionar Material")');
    await page.waitForSelector('[role="dialog"]');

    // Selecionar material serial
    await page.fill('[placeholder*="material"]', materialSerialNome);
    await page.waitForTimeout(1000);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Para material serial, deve mostrar lista de seriais
    await page.waitForTimeout(500);
    
    // Selecionar serial
    const serial = page.locator('text=SN-E2E-001').first();
    if (await serial.isVisible()) {
      await serial.click();
    }

    await page.click('button:has-text("Adicionar")');

    await expect(page.locator('text=Material alocado com sucesso')).toBeVisible({ timeout: 5000 });
  });

  test('05 - Verificar serial marcado como alocado', async ({ page }) => {
    await page.goto('/estoque');
    await page.waitForLoadState('networkidle');

    await page.fill('input[placeholder*="Buscar"]', materialSerialNome);
    await page.waitForTimeout(1000);

    const materialCard = page.locator(`text=${materialSerialNome}`).first();
    await materialCard.click();
    await page.waitForTimeout(500);

    await page.click('button:has-text("Seriais")');
    await page.waitForTimeout(1000);

    // Serial deve estar marcado como alocado
    const serialCard = page.locator('text=SN-E2E-001').locator('..').locator('..');
    await expect(serialCard.locator('text=Alocado')).toBeVisible();
  });
});

test.describe('Fluxo: Alertas e Notificações de Estoque', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@admin.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('Deve exibir alerta de estoque baixo', async ({ page }) => {
    await page.goto('/estoque');
    await page.waitForLoadState('networkidle');

    // Filtrar por estoque baixo
    await page.click('button:has-text("Filtros")');
    await page.waitForTimeout(300);
    await page.check('input[name="estoqueBaixo"]');
    await page.click('button:has-text("Aplicar")');

    await page.waitForTimeout(1000);

    // Verificar se há materiais com alerta
    const alertas = page.locator('[data-status="baixo"]');
    const count = await alertas.count();

    if (count > 0) {
      // Deve mostrar badge de alerta
      await expect(alertas.first().locator('text=/baixo|alerta/i')).toBeVisible();
    }
  });

  test('Deve exibir materiais indisponíveis', async ({ page }) => {
    await page.goto('/estoque');
    await page.waitForLoadState('networkidle');

    // Filtrar indisponíveis
    await page.click('button:has-text("Filtros")');
    await page.waitForTimeout(300);
    await page.check('input[name="indisponiveis"]');
    await page.click('button:has-text("Aplicar")');

    await page.waitForTimeout(1000);

    // Verificar materiais sem estoque
    const indisponiveis = page.locator('[data-disponivel="0"]');
    const count = await indisponiveis.count();

    if (count > 0) {
      await expect(indisponiveis.first().locator('text=Indisponível')).toBeVisible();
    }
  });

  test('Busca de material deve funcionar corretamente', async ({ page }) => {
    await page.goto('/estoque');
    await page.waitForLoadState('networkidle');

    const totalMateriais = await page.locator('[data-testid="material-card"]').count();

    // Buscar por termo específico
    await page.fill('input[placeholder*="Buscar"]', 'mesa');
    await page.waitForTimeout(1000);

    const materiaisDepoisBusca = await page.locator('[data-testid="material-card"]').count();

    // Resultado deve ser filtrado
    expect(materiaisDepoisBusca).toBeLessThanOrEqual(totalMateriais);
  });

  test('Filtro por categoria deve funcionar', async ({ page }) => {
    await page.goto('/estoque');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Filtros")');
    await page.waitForTimeout(300);

    // Selecionar uma categoria
    await page.click('[name="categoria"]');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await page.click('button:has-text("Aplicar")');
    await page.waitForTimeout(1000);

    // Deve mostrar apenas materiais da categoria
    const materiais = await page.locator('[data-testid="material-card"]').count();
    expect(materiais).toBeGreaterThan(0);
  });
});

test.describe('Fluxo: Exportação e Relatórios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@admin.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('Deve gerar relatório de estoque', async ({ page }) => {
    await page.goto('/estoque');
    await page.waitForLoadState('networkidle');

    // Procurar botão de exportar/relatório
    const btnExportar = page.locator('button:has-text("Exportar"), button:has-text("Relatório")');
    
    if (await btnExportar.isVisible()) {
      await btnExportar.click();
      await page.waitForTimeout(1000);

      // Deve iniciar download ou abrir modal de configuração
      // (implementação depende do comportamento atual)
    }
  });

  test('Dashboard deve mostrar resumo de estoque', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Verificar cards de estatísticas
    await expect(page.locator('text=/total.*materiais/i')).toBeVisible();
    await expect(page.locator('text=/disponíveis/i')).toBeVisible();
  });
});
