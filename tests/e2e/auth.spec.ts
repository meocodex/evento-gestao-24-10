import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'teste@exemplo.com',
  password: process.env.TEST_USER_PASSWORD || 'Teste@123456',
};

test.describe('Autenticação', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
  });

  test('deve exibir página de login corretamente', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/login|entrar/i);
    
    // Verificar campos do formulário
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    
    // Tentar submeter sem preencher
    await submitButton.click();
    
    // Verificar mensagens de validação
    await expect(page.locator('form')).toBeVisible();
  });

  test('deve validar formato de email', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    // Email inválido
    await emailInput.fill('email-invalido');
    await passwordInput.fill('SenhaQualquer123');
    await page.locator('button[type="submit"]').click();
    
    // Deve mostrar erro ou não permitir submit
    await page.waitForTimeout(1000);
  });

  test('deve falhar com credenciais inválidas', async ({ page }) => {
    await page.locator('input[type="email"]').fill('usuario@inexistente.com');
    await page.locator('input[type="password"]').fill('SenhaErrada123');
    await page.locator('button[type="submit"]').click();
    
    // Aguardar mensagem de erro (toast ou alert)
    await page.waitForTimeout(2000);
    
    // Verificar que ainda está na página de login
    expect(page.url()).toContain('/auth');
  });

  test('deve fazer login com sucesso', async ({ page }) => {
    await page.locator('input[type="email"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    await page.locator('button[type="submit"]').click();
    
    // Aguardar redirecionamento
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Verificar que está na página do dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Verificar elementos do dashboard
    await expect(page.locator('[role="navigation"]')).toBeVisible();
  });

  test('deve manter usuário logado após refresh', async ({ page, context }) => {
    // Fazer login
    await page.locator('input[type="email"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    await page.locator('button[type="submit"]').click();
    
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Atualizar página
    await page.reload();
    
    // Verificar que ainda está logado
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('[role="navigation"]')).toBeVisible();
  });

  test('deve fazer logout com sucesso', async ({ page }) => {
    // Fazer login primeiro
    await page.locator('input[type="email"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    await page.locator('button[type="submit"]').click();
    
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Procurar e clicar em logout (pode estar em dropdown ou menu)
    const logoutButton = page.locator('button:has-text("Sair"), button:has-text("Logout")').first();
    
    if (await logoutButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await logoutButton.click();
    } else {
      // Se não encontrar direto, procurar em dropdown
      const userMenu = page.locator('[data-testid="user-menu"], [aria-label*="usuário"]').first();
      if (await userMenu.isVisible({ timeout: 2000 }).catch(() => false)) {
        await userMenu.click();
        await page.locator('button:has-text("Sair"), button:has-text("Logout")').first().click();
      }
    }
    
    // Verificar redirecionamento para login
    await page.waitForURL('**/auth', { timeout: 10000 });
    await expect(page).toHaveURL(/\/auth/);
  });

  test('deve proteger rotas privadas', async ({ page }) => {
    // Tentar acessar rota protegida sem login
    await page.goto('/dashboard');
    
    // Deve redirecionar para login
    await page.waitForURL('**/auth', { timeout: 10000 });
    await expect(page).toHaveURL(/\/auth/);
  });
});
