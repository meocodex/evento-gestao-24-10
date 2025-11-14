import { test, expect } from '@playwright/test';
import { EventosTestHelper } from '../helpers/eventos-helpers';

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'admin@test.com',
  password: process.env.TEST_USER_PASSWORD || 'admin123',
};

test.describe('Eventos - Workflow e Status', () => {
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

  test('deve alterar status de Orçamento para Proposta Enviada', async ({ page }) => {
    await helper.navegarParaDetalhes(eventoId);
    
    // Clicar em alterar status
    await page.click('button:has-text("Alterar Status")');
    await helper.aguardarCarregamento();
    
    // Selecionar novo status
    await page.click('button[role="combobox"]');
    await page.click('text=/Proposta Enviada/i');
    
    // Adicionar motivo
    await page.fill('textarea', 'Proposta enviada ao cliente');
    
    // Confirmar
    await page.click('button:has-text("Confirmar")');
    await helper.aguardarCarregamento();
    
    // Verificar mudança de status
    await expect(page.locator('text=/Proposta Enviada/i')).toBeVisible();
  });

  test('deve alterar status de Proposta Enviada para Confirmado', async ({ page }) => {
    // Alterar status do evento para proposta enviada
    await page.evaluate(async ({ eventoId }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase
        .from('eventos')
        .update({ status: 'proposta_enviada' })
        .eq('id', eventoId);
    }, { eventoId });

    await helper.navegarParaDetalhes(eventoId);
    
    // Alterar status
    await page.click('button:has-text("Alterar Status")');
    await helper.aguardarCarregamento();
    
    await page.click('button[role="combobox"]');
    await page.click('text=/Confirmado/i');
    
    await page.fill('textarea', 'Cliente confirmou o evento');
    
    await page.click('button:has-text("Confirmar")');
    await helper.aguardarCarregamento();
    
    // Verificar
    await expect(page.locator('text=/Confirmado/i')).toBeVisible();
  });

  test('deve alterar status de Confirmado para Em Andamento', async ({ page }) => {
    // Alterar status do evento para confirmado
    await page.evaluate(async ({ eventoId }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase
        .from('eventos')
        .update({ status: 'confirmado' })
        .eq('id', eventoId);
    }, { eventoId });

    await helper.navegarParaDetalhes(eventoId);
    
    await page.click('button:has-text("Alterar Status")');
    await helper.aguardarCarregamento();
    
    await page.click('button[role="combobox"]');
    await page.click('text=/Em Andamento/i');
    
    await page.fill('textarea', 'Evento iniciado');
    
    await page.click('button:has-text("Confirmar")');
    await helper.aguardarCarregamento();
    
    await expect(page.locator('text=/Em Andamento/i')).toBeVisible();
  });

  test('deve alterar status de Em Andamento para Concluído', async ({ page }) => {
    // Alterar status do evento para em andamento
    await page.evaluate(async ({ eventoId }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase
        .from('eventos')
        .update({ status: 'em_andamento' })
        .eq('id', eventoId);
    }, { eventoId });

    await helper.navegarParaDetalhes(eventoId);
    
    await page.click('button:has-text("Alterar Status")');
    await helper.aguardarCarregamento();
    
    await page.click('button[role="combobox"]');
    await page.click('text=/Concluído/i');
    
    await page.fill('textarea', 'Evento finalizado com sucesso');
    
    await page.click('button:has-text("Confirmar")');
    await helper.aguardarCarregamento();
    
    await expect(page.locator('text=/Concluído/i')).toBeVisible();
  });

  test('deve arquivar evento sem materiais pendentes', async ({ page }) => {
    // Garantir que não há materiais pendentes
    await page.evaluate(async ({ eventoId }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Limpar materiais pendentes se houver
      await supabase
        .from('eventos_materiais_alocados')
        .delete()
        .eq('evento_id', eventoId);
      
      // Alterar status para finalizado
      await supabase
        .from('eventos')
        .update({ status: 'finalizado' })
        .eq('id', eventoId);
    }, { eventoId });

    await helper.navegarParaDetalhes(eventoId);
    
    // Clicar em arquivar
    await page.click('button:has-text("Arquivar")');
    await helper.aguardarCarregamento();
    
    // Confirmar
    await page.click('button:has-text("Confirmar")');
    await helper.aguardarCarregamento();
    
    // Deve redirecionar ou mostrar mensagem
    await expect(page.locator('text=/Evento arquivado/i')).toBeVisible();
  });

  test('não deve permitir arquivar com materiais pendentes', async ({ page }) => {
    // Adicionar material pendente
    await page.evaluate(async ({ eventoId }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      await supabase.from('eventos_materiais_alocados').insert({
        evento_id: eventoId,
        item_id: 'TEST_MATERIAL',
        nome: 'Material Pendente',
        serial: 'SN999',
        quantidade_alocada: 1,
        quantidade_devolvida: 0,
        status: 'retirado',
        tipo_envio: 'retirada',
        status_devolucao: 'pendente',
      });
    }, { eventoId });

    await helper.navegarParaDetalhes(eventoId);
    
    // Tentar arquivar
    const arquivarButton = page.locator('button:has-text("Arquivar")');
    
    if (await arquivarButton.isVisible()) {
      await arquivarButton.click();
      await helper.aguardarCarregamento();
      
      // Deve mostrar erro ou aviso
      await expect(page.locator('text=/materiais pendentes/i, text=/não é possível arquivar/i')).toBeVisible();
    }
  });

  test('deve validar transições de status válidas', async ({ page }) => {
    await helper.navegarParaDetalhes(eventoId);
    
    // Abrir dialog de alterar status
    await page.click('button:has-text("Alterar Status")');
    await helper.aguardarCarregamento();
    
    // Abrir select de status
    await page.click('button[role="combobox"]');
    
    // Verificar que apenas status válidos estão disponíveis
    // A partir de "orcamento", deve permitir ir para "proposta_enviada"
    await expect(page.locator('[role="option"]:has-text("Proposta Enviada")')).toBeVisible();
    
    // Não deve permitir ir direto para "concluído"
    const concluidoOption = page.locator('[role="option"]:has-text("Concluído")');
    if (await concluidoOption.isVisible()) {
      const isDisabled = await concluidoOption.getAttribute('aria-disabled');
      expect(isDisabled).toBe('true');
    }
  });

  test('deve registrar mudanças de status na timeline', async ({ page }) => {
    await helper.navegarParaDetalhes(eventoId);
    
    // Alterar status
    await page.click('button:has-text("Alterar Status")');
    await helper.aguardarCarregamento();
    
    await page.click('button[role="combobox"]');
    await page.click('text=/Proposta Enviada/i');
    
    await page.fill('textarea', 'Mudança de status para teste');
    await page.click('button:has-text("Confirmar")');
    await helper.aguardarCarregamento();
    
    // Verificar na timeline (se visível)
    const timelineSection = page.locator('text=/Timeline/i, text=/Histórico/i');
    if (await timelineSection.isVisible()) {
      await timelineSection.click();
      await expect(page.locator('text=/Mudança de status para teste/i')).toBeVisible();
    }
  });
});
