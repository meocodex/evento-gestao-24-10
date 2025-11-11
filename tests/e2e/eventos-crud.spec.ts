import { test, expect } from '@playwright/test';
import { EventosTestHelper } from '../helpers/eventos-helpers';

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'teste@eventflow.com',
  password: process.env.TEST_USER_PASSWORD || 'teste123'
};

test.describe('Eventos - CRUD Completo', () => {
  let helper: EventosTestHelper;
  let eventoId: string;
  let clienteId: string;

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Criar dados de teste
    helper = new EventosTestHelper(page);
    const { cliente, evento } = helper.gerarDadosAleatorios();
    
    const comercialQuery = await page.evaluate(async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'comercial')
        .limit(1)
        .single();
      return data?.id;
    });

    clienteId = await helper.criarClienteTeste(cliente);
    eventoId = await helper.criarEventoTeste(evento, clienteId, comercialQuery || '');
  });

  test.afterEach(async () => {
    await helper.limparDadosTeste(eventoId, clienteId);
  });

  test('deve editar informações básicas do evento', async ({ page }) => {
    await page.goto('/eventos');
    await page.waitForLoadState('networkidle');

    // Localizar e clicar no evento
    await page.click(`[data-evento-id="${eventoId}"]`);
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Abrir modal de edição
    await page.click('button:has-text("Editar")');
    await page.waitForSelector('form');

    // Alterar dados
    const novoNome = `Evento Editado - ${Date.now()}`;
    await page.fill('input[name="nome"]', novoNome);
    await page.fill('input[name="local"]', 'Novo Local Teste');

    // Salvar
    await page.click('button[type="submit"]:has-text("Salvar")');
    await expect(page.locator('text=Evento atualizado com sucesso')).toBeVisible();

    // Verificar alteração
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`text=${novoNome}`)).toBeVisible();
  });

  test('deve editar cliente do evento', async ({ page }) => {
    // Criar segundo cliente
    const { cliente: novoCliente } = helper.gerarDadosAleatorios();
    const novoClienteId = await helper.criarClienteTeste(novoCliente);

    await page.goto('/eventos');
    await page.click(`[data-evento-id="${eventoId}"]`);
    await page.click('button:has-text("Editar")');

    // Alterar cliente
    await page.click('[data-testid="cliente-select"]');
    await page.click(`[data-value="${novoClienteId}"]`);
    await page.click('button[type="submit"]:has-text("Salvar")');

    await expect(page.locator('text=Evento atualizado com sucesso')).toBeVisible();

    // Limpar novo cliente
    await page.evaluate(async (id) => {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.from('clientes').delete().eq('id', id);
    }, novoClienteId);
  });

  test('deve validar campos obrigatórios ao editar', async ({ page }) => {
    await page.goto('/eventos');
    await page.click(`[data-evento-id="${eventoId}"]`);
    await page.click('button:has-text("Editar")');

    // Limpar campo obrigatório
    await page.fill('input[name="nome"]', '');
    await page.click('button[type="submit"]:has-text("Salvar")');

    // Verificar mensagem de erro
    await expect(page.locator('text=obrigatório')).toBeVisible();
  });

  test('deve excluir evento sem vínculos', async ({ page }) => {
    await page.goto('/eventos');
    await page.click(`[data-evento-id="${eventoId}"]`);

    // Abrir menu de ações
    await page.click('button[aria-label="Mais opções"]');
    await page.click('text=Excluir');

    // Confirmar exclusão
    await page.click('button:has-text("Confirmar")');
    await expect(page.locator('text=Evento excluído com sucesso')).toBeVisible();

    // Verificar que não aparece mais na lista
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`[data-evento-id="${eventoId}"]`)).not.toBeVisible();
  });

  test('deve impedir exclusão de evento com materiais alocados', async ({ page }) => {
    // Adicionar material ao evento via API
    const { material } = helper.gerarDadosAleatorios();
    const materialId = await helper.criarMaterialTeste(material);

    await page.evaluate(async ({ eventoId, materialId }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.from('materiais_alocados').insert({
        evento_id: eventoId,
        material_id: materialId,
        quantidade: 5,
        status: 'planejado'
      });
    }, { eventoId, materialId });

    await page.goto('/eventos');
    await page.click(`[data-evento-id="${eventoId}"]`);
    await page.click('button[aria-label="Mais opções"]');
    await page.click('text=Excluir');
    await page.click('button:has-text("Confirmar")');

    // Verificar mensagem de erro
    await expect(page.locator('text=materiais alocados')).toBeVisible();

    // Limpar material
    await helper.limparDadosTeste(undefined, undefined, materialId);
  });

  test('deve impedir exclusão de evento em andamento', async ({ page }) => {
    // Alterar status para em_andamento
    await page.evaluate(async (id) => {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase
        .from('eventos')
        .update({ status: 'em_andamento' })
        .eq('id', id);
    }, eventoId);

    await page.goto('/eventos');
    await page.click(`[data-evento-id="${eventoId}"]`);
    await page.click('button[aria-label="Mais opções"]');
    
    // Botão de excluir deve estar desabilitado ou não aparecer
    const deleteButton = page.locator('text=Excluir');
    if (await deleteButton.isVisible()) {
      await expect(deleteButton).toBeDisabled();
    }
  });
});
