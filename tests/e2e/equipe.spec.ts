import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'teste@eventflow.com',
  password: process.env.TEST_USER_PASSWORD || 'teste123'
};

test.describe('Equipe - Gestão Completa', () => {
  let operacionalId: string;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    await page.goto('/equipe');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    if (operacionalId) {
      await page.evaluate(async (id) => {
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase.from('equipe_operacional').delete().eq('id', id);
      }, operacionalId);
    }
  });

  test('deve listar membros da equipe', async ({ page }) => {
    await expect(page.locator('h1:has-text("Equipe")')).toBeVisible();
  });

  test('deve criar membro operacional', async ({ page }) => {
    await page.click('button:has-text("Novo Operacional")');
    await page.waitForSelector('form');

    const timestamp = Date.now();
    await page.fill('input[name="nome"]', `Operacional ${timestamp}`);
    await page.fill('input[name="cpf"]', '12345678900');
    await page.fill('input[name="telefone"]', '11888888888');
    await page.fill('input[name="email"]', `op${timestamp}@test.com`);
    
    await page.click('[data-testid="funcao-select"]');
    await page.click('text=Garçom');

    await page.click('button[type="submit"]:has-text("Salvar")');
    await expect(page.locator('text=Membro criado com sucesso')).toBeVisible();

    operacionalId = await page.evaluate(async (nome) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('equipe_operacional')
        .select('id')
        .eq('nome', nome)
        .single();
      return data?.id;
    }, `Operacional ${timestamp}`);
  });

  test('deve editar membro operacional', async ({ page }) => {
    const nomeOriginal = `Op Editar ${Date.now()}`;
    operacionalId = await page.evaluate(async (nome) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('equipe_operacional')
        .insert({
          nome,
          cpf: '11111111111',
          telefone: '11777777777',
          email: `edit${Date.now()}@test.com`,
          funcao: 'garcom'
        })
        .select()
        .single();
      return data?.id;
    }, nomeOriginal);

    await page.reload();
    await page.click(`[data-operacional-id="${operacionalId}"]`);
    await page.click('button:has-text("Editar")');

    const novoNome = `Op Editado ${Date.now()}`;
    await page.fill('input[name="nome"]', novoNome);
    await page.fill('input[name="telefone"]', '11666666666');
    await page.click('button[type="submit"]:has-text("Salvar")');

    await expect(page.locator('text=atualizado com sucesso')).toBeVisible();
  });

  test('deve filtrar por função', async ({ page }) => {
    await page.click('[data-testid="filtro-funcao"]');
    await page.click('text=Garçom');
    await page.waitForTimeout(500);

    const funcoes = await page.locator('[data-funcao-badge]').allTextContents();
    funcoes.forEach(funcao => {
      expect(funcao.toLowerCase()).toContain('garçom');
    });
  });

  test('deve visualizar detalhes do membro', async ({ page }) => {
    const nome = `Op Detalhes ${Date.now()}`;
    operacionalId = await page.evaluate(async (nome) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('equipe_operacional')
        .insert({
          nome,
          cpf: '22222222222',
          telefone: '11555555555',
          email: `det${Date.now()}@test.com`,
          funcao: 'cozinheiro',
          salario_base: 3000
        })
        .select()
        .single();
      return data?.id;
    }, nome);

    await page.reload();
    await page.click(`[data-operacional-id="${operacionalId}"]`);

    await expect(page.locator(`text=${nome}`)).toBeVisible();
    await expect(page.locator('text=Cozinheiro')).toBeVisible();
  });

  test('deve validar CPF ao criar membro', async ({ page }) => {
    await page.click('button:has-text("Novo Operacional")');
    
    await page.fill('input[name="nome"]', 'Teste CPF');
    await page.fill('input[name="cpf"]', '00000000000'); // CPF inválido
    await page.fill('input[name="telefone"]', '11999999999');
    
    await page.click('button[type="submit"]:has-text("Salvar")');
    
    await expect(page.locator('text=CPF inválido')).toBeVisible();
  });

  test('deve conceder acesso ao sistema', async ({ page }) => {
    const nome = `Op Sistema ${Date.now()}`;
    operacionalId = await page.evaluate(async (nome) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('equipe_operacional')
        .insert({
          nome,
          cpf: '33333333333',
          telefone: '11444444444',
          email: `sistema${Date.now()}@test.com`,
          funcao: 'garcom'
        })
        .select()
        .single();
      return data?.id;
    }, nome);

    await page.reload();
    await page.click(`[data-operacional-id="${operacionalId}"]`);
    await page.click('button:has-text("Conceder Acesso")');
    await page.waitForSelector('form');

    await page.fill('input[name="senha"]', 'SenhaSegura123!');
    await page.fill('input[name="confirmar_senha"]', 'SenhaSegura123!');
    await page.click('[data-testid="role-select"]');
    await page.click('text=Operacional');

    await page.click('button[type="submit"]:has-text("Conceder")');
    
    await expect(page.locator('text=Acesso concedido com sucesso')).toBeVisible();
  });

  test('deve verificar permissões do usuário', async ({ page }) => {
    // Verificar se usuário tem permissão para gerenciar equipe
    const temPermissao = await page.evaluate(async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      return profile?.role === 'admin' || profile?.role === 'gerente';
    });

    if (temPermissao) {
      await expect(page.locator('button:has-text("Novo Operacional")')).toBeVisible();
    } else {
      await expect(page.locator('button:has-text("Novo Operacional")')).not.toBeVisible();
    }
  });
});
