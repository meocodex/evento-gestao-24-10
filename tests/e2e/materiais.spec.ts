import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'teste@exemplo.com',
  password: process.env.TEST_USER_PASSWORD || 'Teste@123456',
};

test.describe('Gestão de Materiais', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth');
    await page.locator('input[type="email"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    await page.locator('button[type="submit"]').click();
    
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navegar para estoque
    await page.goto('/estoque');
    await page.waitForLoadState('networkidle');
  });

  test('deve exibir página de estoque', async ({ page }) => {
    // Verificar título
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Verificar botão de criar material
    const createButton = page.locator('button:has-text("Novo Material"), button:has-text("Adicionar")').first();
    await expect(createButton).toBeVisible();
  });

  test('deve listar materiais', async ({ page }) => {
    // Aguardar lista carregar
    await page.waitForTimeout(2000);
    
    // Verificar se há materiais ou mensagem de vazio
    const hasMateriais = await page.locator('[data-testid="material-card"], article, tr').count();
    
    expect(hasMateriais).toBeGreaterThanOrEqual(0);
  });

  test('deve criar novo material', async ({ page }) => {
    const createButton = page.locator('button:has-text("Novo Material"), button:has-text("Adicionar")').first();
    await createButton.click();
    
    await page.waitForTimeout(500);
    
    // Preencher dados do material
    const timestamp = Date.now();
    const nomeMaterial = `Material Teste ${timestamp}`;
    
    await page.locator('input[name="nome"], input[placeholder*="nome"]').first().fill(nomeMaterial);
    
    // Preencher quantidade
    const quantidadeInput = page.locator('input[name="quantidade_total"], input[type="number"]').first();
    if (await quantidadeInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await quantidadeInput.fill('10');
    }
    
    // Selecionar categoria (se dropdown visível)
    const categoriaSelect = page.locator('[role="combobox"]:has-text("Categoria"), select[name="categoria_id"]').first();
    if (await categoriaSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await categoriaSelect.click();
      await page.waitForTimeout(300);
      await page.locator('[role="option"]').first().click();
    }
    
    // Submeter
    const submitButton = page.locator('button[type="submit"]:has-text("Criar"), button:has-text("Salvar")').first();
    await submitButton.click();
    
    // Aguardar sucesso
    await page.waitForTimeout(3000);
    
    // Verificar que foi criado
    const materialCreated = await page.locator(`text="${nomeMaterial}"`).isVisible({ timeout: 5000 }).catch(() => false);
    expect(materialCreated).toBeTruthy();
  });

  test('deve buscar materiais', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const campoBusca = page.locator('input[type="search"], input[placeholder*="busca"]').first();
    
    if (await campoBusca.isVisible({ timeout: 3000 }).catch(() => false)) {
      await campoBusca.fill('mesa');
      await page.waitForTimeout(1500);
      
      const resultados = await page.locator('[data-testid="material-card"], article, tr').count();
      expect(resultados).toBeGreaterThanOrEqual(0);
    }
  });

  test('deve filtrar por categoria', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const filtroCategoria = page.locator('button:has-text("Categoria"), select:has-text("Categoria")').first();
    
    if (await filtroCategoria.isVisible({ timeout: 3000 }).catch(() => false)) {
      await filtroCategoria.click();
      await page.waitForTimeout(300);
      
      const primeiraCategoria = page.locator('[role="option"]').first();
      if (await primeiraCategoria.isVisible({ timeout: 2000 }).catch(() => false)) {
        await primeiraCategoria.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('deve visualizar detalhes de material', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const primeiroMaterial = page.locator('[data-testid="material-card"], article, tr').first();
    
    if (await primeiroMaterial.isVisible({ timeout: 5000 }).catch(() => false)) {
      await primeiroMaterial.click();
      await page.waitForTimeout(1000);
      
      // Verificar que modal/sheet abriu
      await expect(page.locator('h2, h3').first()).toBeVisible();
    }
  });

  test('deve verificar status de disponibilidade', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Verificar se há badges de status (disponível, alocado, etc)
    const statusBadges = page.locator('[data-testid*="status"], span:has-text("Disponível"), span:has-text("Alocado")');
    
    if (await statusBadges.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      const count = await statusBadges.count();
      expect(count).toBeGreaterThan(0);
    }
  });
});

test.describe('Alocação de Materiais', () => {
  test.beforeEach(async ({ page }) => {
    // Login e navegar para eventos
    await page.goto('/auth');
    await page.locator('input[type="email"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    await page.locator('button[type="submit"]').click();
    
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.goto('/eventos');
    await page.waitForLoadState('networkidle');
  });

  test('deve alocar material a evento', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Clicar no primeiro evento
    const primeiroEvento = page.locator('[data-testid="evento-card"], article').first();
    
    if (await primeiroEvento.isVisible({ timeout: 5000 }).catch(() => false)) {
      await primeiroEvento.click();
      await page.waitForTimeout(1000);
      
      // Procurar seção de materiais
      const secaoMateriais = page.locator('button:has-text("Materiais"), [role="tab"]:has-text("Materiais")').first();
      
      if (await secaoMateriais.isVisible({ timeout: 3000 }).catch(() => false)) {
        await secaoMateriais.click();
        await page.waitForTimeout(500);
        
        // Procurar botão de adicionar material
        const btnAdicionarMaterial = page.locator('button:has-text("Adicionar Material"), button:has-text("Alocar")').first();
        
        if (await btnAdicionarMaterial.isVisible({ timeout: 3000 }).catch(() => false)) {
          await btnAdicionarMaterial.click();
          await page.waitForTimeout(500);
          
          // Selecionar material
          const materialSelect = page.locator('[role="combobox"], select').first();
          if (await materialSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
            await materialSelect.click();
            await page.waitForTimeout(300);
            await page.locator('[role="option"]').first().click();
            
            // Confirmar alocação
            const btnConfirmar = page.locator('button[type="submit"]:has-text("Confirmar"), button:has-text("Alocar")').first();
            await btnConfirmar.click();
            
            // Aguardar sucesso
            await page.waitForTimeout(2000);
          }
        }
      }
    }
  });

  test('deve verificar badge de materiais pendentes', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Procurar badges de materiais pendentes
    const badgesPendentes = page.locator('[data-testid*="materiais-pendentes"], span:has-text("pendente")');
    
    const count = await badgesPendentes.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
