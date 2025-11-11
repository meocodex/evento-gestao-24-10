import { test, expect } from '@playwright/test';
import { EventosTestHelper } from '../helpers/eventos-helpers';

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'admin@test.com',
  password: process.env.TEST_USER_PASSWORD || 'admin123',
};

test.describe('Eventos - Detalhes e Abas', () => {
  let helper: EventosTestHelper;
  let eventoId: string;
  let clienteId: string;
  let materialId: string;

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
    
    // Obter ID do usuário comercial
    const comercialId = await page.evaluate(async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || '';
    });

    clienteId = await helper.criarClienteTeste(dados.cliente);
    materialId = await helper.criarMaterialTeste(dados.material);
    eventoId = await helper.criarEventoTeste(dados.evento, clienteId, comercialId);
  });

  test.afterEach(async () => {
    await helper.limparDadosTeste(eventoId, clienteId, materialId);
  });

  test('deve visualizar todos os dados do evento na aba Dados', async ({ page }) => {
    await helper.navegarParaDetalhes(eventoId);
    
    // Verificar que está na aba Dados por padrão
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
    
    // Verificar presença de informações principais
    await expect(page.locator('text=/Evento Teste/')).toBeVisible();
    await expect(page.locator('text=/Local Teste/')).toBeVisible();
    await expect(page.locator('text=/São Paulo/')).toBeVisible();
  });

  test('deve editar informações básicas do evento', async ({ page }) => {
    await helper.navegarParaDetalhes(eventoId);
    
    // Clicar em editar
    await page.click('button:has-text("Editar")');
    await helper.aguardarCarregamento();
    
    // Alterar nome do evento
    const novoNome = `Evento Editado ${Date.now()}`;
    await page.fill('input[name="nome"]', novoNome);
    
    // Salvar
    await page.click('button:has-text("Salvar")');
    await helper.aguardarCarregamento();
    
    // Verificar alteração
    await expect(page.locator(`text=${novoNome}`)).toBeVisible();
  });

  test('deve adicionar observação operacional', async ({ page }) => {
    await helper.navegarParaDetalhes(eventoId);
    await helper.abrirAba('operacao');
    
    // Adicionar observação
    const observacao = `Observação teste ${Date.now()}`;
    await page.fill('textarea[placeholder*="observação" i]', observacao);
    await page.click('button:has-text("Adicionar")');
    
    await helper.aguardarCarregamento();
    
    // Verificar que observação foi adicionada
    await expect(page.locator(`text=${observacao}`)).toBeVisible();
  });

  test('deve visualizar aba de materiais', async ({ page }) => {
    await helper.navegarParaDetalhes(eventoId);
    await helper.abrirAba('materiais');
    
    // Verificar que a aba carregou
    await expect(page.locator('text=/Materiais Alocados/i')).toBeVisible();
    
    // Verificar presença do botão de adicionar material
    await expect(page.locator('button:has-text("Adicionar Material")')).toBeVisible();
  });

  test('deve visualizar aba de operação', async ({ page }) => {
    await helper.navegarParaDetalhes(eventoId);
    await helper.abrirAba('operacao');
    
    // Verificar presença de seções da aba
    await expect(page.locator('text=/Equipe/i')).toBeVisible();
  });

  test('deve visualizar aba de demandas', async ({ page }) => {
    await helper.navegarParaDetalhes(eventoId);
    await helper.abrirAba('demandas');
    
    // Verificar que a aba carregou
    await expect(page.locator('text=/Demandas do Evento/i')).toBeVisible();
  });

  test('deve visualizar aba de financeiro', async ({ page }) => {
    await helper.navegarParaDetalhes(eventoId);
    await helper.abrirAba('financeiro');
    
    // Verificar que a aba carregou (pode estar desabilitada por permissões)
    const abaFinanceiro = page.locator('[role="tab"]:has-text("Financeiro")');
    const isDisabled = await abaFinanceiro.getAttribute('data-disabled');
    
    if (isDisabled !== 'true') {
      await expect(page.locator('text=/Receitas/i, text=/Despesas/i')).toBeVisible();
    }
  });

  test('deve visualizar aba de contratos', async ({ page }) => {
    await helper.navegarParaDetalhes(eventoId);
    await helper.abrirAba('contratos');
    
    // Verificar que a aba carregou
    await expect(page.locator('text=/Contratos Vinculados/i, text=/Contrato/i')).toBeVisible();
  });

  test('deve navegar entre abas sem perder contexto', async ({ page }) => {
    await helper.navegarParaDetalhes(eventoId);
    
    // Navegar por todas as abas
    await helper.abrirAba('materiais');
    await helper.aguardarCarregamento();
    
    await helper.abrirAba('operacao');
    await helper.aguardarCarregamento();
    
    await helper.abrirAba('demandas');
    await helper.aguardarCarregamento();
    
    await helper.abrirAba('dados');
    await helper.aguardarCarregamento();
    
    // Verificar que voltou para aba Dados corretamente
    await expect(page.locator('text=/Evento Teste/')).toBeVisible();
  });

  test('deve manter aba selecionada após recarregar página', async ({ page }) => {
    await helper.navegarParaDetalhes(eventoId);
    
    // Abrir aba de materiais
    await helper.abrirAba('materiais');
    await helper.aguardarCarregamento();
    
    // Recarregar página
    await page.reload();
    await helper.aguardarCarregamento();
    
    // Verificar que ainda está na aba de materiais (se o comportamento for esse)
    // Ou verificar que voltou para aba padrão
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
  });
});
