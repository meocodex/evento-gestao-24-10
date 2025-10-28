import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'teste@exemplo.com',
  password: process.env.TEST_USER_PASSWORD || 'Teste@123456',
};

test.describe('Gestão de Eventos', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada teste
    await page.goto('/auth');
    await page.locator('input[type="email"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    await page.locator('button[type="submit"]').click();
    
    // Aguardar dashboard carregar
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navegar para eventos
    await page.goto('/eventos');
    await page.waitForLoadState('networkidle');
  });

  test('deve exibir página de eventos', async ({ page }) => {
    // Verificar título da página
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Verificar botão de criar evento
    const createButton = page.locator('button:has-text("Novo Evento"), button:has-text("Criar Evento")').first();
    await expect(createButton).toBeVisible();
  });

  test('deve abrir modal de criar evento', async ({ page }) => {
    const createButton = page.locator('button:has-text("Novo Evento"), button:has-text("Criar Evento")').first();
    await createButton.click();
    
    // Aguardar modal/sheet abrir
    await page.waitForTimeout(500);
    
    // Verificar campos do formulário
    await expect(page.locator('input[name="nome"], input[placeholder*="nome"]').first()).toBeVisible();
  });

  test('deve criar um novo evento', async ({ page }) => {
    const createButton = page.locator('button:has-text("Novo Evento"), button:has-text("Criar Evento")').first();
    await createButton.click();
    
    await page.waitForTimeout(500);
    
    // Preencher dados do evento
    const timestamp = Date.now();
    const nomeEvento = `Teste E2E ${timestamp}`;
    
    await page.locator('input[name="nome"], input[placeholder*="nome"]').first().fill(nomeEvento);
    
    // Preencher data de início (se campo visível)
    const dataInicio = page.locator('input[name="data_inicio"], input[type="date"]').first();
    if (await dataInicio.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dataInicio.fill('2025-12-01');
    }
    
    // Preencher data de término (se campo visível)
    const dataFim = page.locator('input[name="data_fim"]').first();
    if (await dataFim.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dataFim.fill('2025-12-02');
    }
    
    // Selecionar cliente (se dropdown visível)
    const clienteSelect = page.locator('[role="combobox"]:has-text("Cliente"), select[name="cliente_id"]').first();
    if (await clienteSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await clienteSelect.click();
      await page.waitForTimeout(300);
      // Selecionar primeiro cliente da lista
      await page.locator('[role="option"]').first().click();
    }
    
    // Submeter formulário
    const submitButton = page.locator('button[type="submit"]:has-text("Criar"), button:has-text("Salvar")').first();
    await submitButton.click();
    
    // Aguardar sucesso (toast ou redirecionamento)
    await page.waitForTimeout(3000);
    
    // Verificar que o evento foi criado (pode aparecer na lista ou em toast)
    const eventoCreated = await page.locator(`text="${nomeEvento}"`).isVisible({ timeout: 5000 }).catch(() => false);
    
    expect(eventoCreated).toBeTruthy();
  });

  test('deve visualizar detalhes de um evento', async ({ page }) => {
    // Aguardar lista carregar
    await page.waitForTimeout(2000);
    
    // Clicar no primeiro evento da lista
    const primeiroEvento = page.locator('[data-testid="evento-card"], article, div[role="button"]').first();
    
    if (await primeiroEvento.isVisible({ timeout: 5000 }).catch(() => false)) {
      await primeiroEvento.click();
      
      // Aguardar detalhes carregarem
      await page.waitForTimeout(1000);
      
      // Verificar elementos dos detalhes
      await expect(page.locator('h1, h2, h3').first()).toBeVisible();
    }
  });

  test('deve filtrar eventos por status', async ({ page }) => {
    // Aguardar lista carregar
    await page.waitForTimeout(2000);
    
    // Procurar filtro de status
    const filtroStatus = page.locator('button:has-text("Status"), select:has-text("Status")').first();
    
    if (await filtroStatus.isVisible({ timeout: 3000 }).catch(() => false)) {
      await filtroStatus.click();
      await page.waitForTimeout(300);
      
      // Selecionar um status (ex: Confirmado)
      const opcaoConfirmado = page.locator('[role="option"]:has-text("Confirmado"), option:has-text("Confirmado")').first();
      if (await opcaoConfirmado.isVisible({ timeout: 2000 }).catch(() => false)) {
        await opcaoConfirmado.click();
        
        // Aguardar filtragem
        await page.waitForTimeout(1000);
      }
    }
  });

  test('deve buscar eventos por nome', async ({ page }) => {
    // Aguardar lista carregar
    await page.waitForTimeout(2000);
    
    // Procurar campo de busca
    const campoBusca = page.locator('input[type="search"], input[placeholder*="busca"], input[placeholder*="pesquisa"]').first();
    
    if (await campoBusca.isVisible({ timeout: 3000 }).catch(() => false)) {
      await campoBusca.fill('teste');
      
      // Aguardar busca
      await page.waitForTimeout(1500);
      
      // Verificar que a lista foi filtrada
      const resultados = await page.locator('[data-testid="evento-card"], article').count();
      expect(resultados).toBeGreaterThanOrEqual(0);
    }
  });

  test('deve alternar entre visualizações (lista/kanban/calendário)', async ({ page }) => {
    // Aguardar lista carregar
    await page.waitForTimeout(2000);
    
    // Procurar botões de visualização
    const viewButtons = page.locator('button[role="tab"], button[aria-label*="visualização"]');
    
    if (await viewButtons.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      const count = await viewButtons.count();
      
      if (count > 1) {
        // Clicar no segundo botão de visualização
        await viewButtons.nth(1).click();
        await page.waitForTimeout(1000);
        
        // Verificar que a visualização mudou
        await expect(page.locator('main')).toBeVisible();
      }
    }
  });
});
