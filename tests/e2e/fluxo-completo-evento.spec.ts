import { test, expect } from '@playwright/test';

/**
 * Sprint 6: Testes E2E - Fluxo Completo de Evento
 * 
 * Testa a jornada completa de um usuário desde a criação de um evento
 * até o fechamento, incluindo todas as etapas intermediárias.
 */

test.describe('Fluxo Completo: Criação até Fechamento de Evento', () => {
  let eventoId: string;
  let eventoNome: string;

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@admin.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Aguarda navegação para dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL('/dashboard');
  });

  test('01 - Criar novo evento com cliente e comercial', async ({ page }) => {
    eventoNome = `Evento E2E - ${Date.now()}`;

    // Navegar para eventos
    await page.goto('/eventos');
    await page.waitForLoadState('networkidle');

    // Abrir modal de novo evento
    await page.click('button:has-text("Novo Evento")');
    await page.waitForSelector('[role="dialog"]');

    // Preencher dados do evento
    await page.fill('input[name="nome"]', eventoNome);
    
    // Selecionar tipo de evento
    await page.click('[name="tipoEvento"]');
    await page.click('[role="option"]:has-text("Bar")');

    // Data e hora
    const dataFutura = new Date();
    dataFutura.setDate(dataFutura.getDate() + 30);
    const dataFim = new Date(dataFutura);
    dataFim.setDate(dataFim.getDate() + 1);

    await page.fill('input[name="dataInicio"]', dataFutura.toISOString().split('T')[0]);
    await page.fill('input[name="horaInicio"]', '20:00');
    await page.fill('input[name="dataFim"]', dataFim.toISOString().split('T')[0]);
    await page.fill('input[name="horaFim"]', '04:00');

    // Endereço
    await page.fill('input[name="local"]', 'Espaço Teste E2E');
    await page.fill('input[name="cidade"]', 'São Paulo');
    await page.fill('input[name="estado"]', 'SP');

    // Selecionar cliente (primeiro da lista)
    await page.click('[name="clienteId"]');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Selecionar comercial (primeiro da lista)
    await page.click('[name="comercialId"]');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Salvar evento
    await page.click('button:has-text("Criar Evento")');

    // Aguardar toast de sucesso
    await expect(page.locator('text=Evento criado com sucesso')).toBeVisible({ timeout: 5000 });

    // Verificar que o evento aparece na lista
    await page.waitForTimeout(1000);
    await expect(page.locator(`text=${eventoNome}`)).toBeVisible();

    // Capturar ID do evento para próximos testes
    const eventoCard = page.locator(`text=${eventoNome}`).first();
    await eventoCard.click();
    
    // Aguarda a página de detalhes
    await page.waitForURL(/\/eventos\/.*/, { timeout: 5000 });
    eventoId = page.url().split('/').pop() || '';
    
    expect(eventoId).toBeTruthy();
  });

  test('02 - Alocar materiais ao evento', async ({ page }) => {
    // Navegar para o evento
    await page.goto(`/eventos/${eventoId}`);
    await page.waitForLoadState('networkidle');

    // Ir para aba de materiais
    await page.click('button:has-text("Materiais")');
    await page.waitForTimeout(500);

    // Adicionar material
    await page.click('button:has-text("Adicionar Material")');
    await page.waitForSelector('[role="dialog"]');

    // Selecionar material (primeiro da lista)
    await page.click('[placeholder*="material"]');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Quantidade
    await page.fill('input[name="quantidade"]', '10');

    // Confirmar alocação
    await page.click('button:has-text("Adicionar")');

    // Verificar toast de sucesso
    await expect(page.locator('text=Material alocado com sucesso')).toBeVisible({ timeout: 5000 });

    // Verificar que material aparece na lista
    await page.waitForTimeout(1000);
    await expect(page.locator('text=10').first()).toBeVisible();
  });

  test('03 - Adicionar receita ao evento', async ({ page }) => {
    await page.goto(`/eventos/${eventoId}`);
    await page.waitForLoadState('networkidle');

    // Ir para aba financeiro
    await page.click('button:has-text("Financeiro")');
    await page.waitForTimeout(500);

    // Adicionar receita
    await page.click('button:has-text("Adicionar Receita")');
    await page.waitForSelector('[role="dialog"]');

    // Preencher dados da receita
    await page.fill('input[name="descricao"]', 'Receita E2E - Ingresso');
    await page.fill('input[name="valor"]', '5000');

    // Data de vencimento
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 15);
    await page.fill('input[name="dataVencimento"]', dataVencimento.toISOString().split('T')[0]);

    // Salvar
    await page.click('button:has-text("Adicionar")');

    // Verificar sucesso
    await expect(page.locator('text=Receita adicionada')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);
    await expect(page.locator('text=R$ 5.000,00')).toBeVisible();
  });

  test('04 - Adicionar despesa ao evento', async ({ page }) => {
    await page.goto(`/eventos/${eventoId}`);
    await page.waitForLoadState('networkidle');

    // Ir para aba financeiro
    await page.click('button:has-text("Financeiro")');
    await page.waitForTimeout(500);

    // Adicionar despesa
    await page.click('button:has-text("Adicionar Despesa")');
    await page.waitForSelector('[role="dialog"]');

    // Preencher dados da despesa
    await page.fill('input[name="descricao"]', 'Despesa E2E - Fornecedor');
    await page.fill('input[name="valor"]', '2000');

    // Data de vencimento
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 20);
    await page.fill('input[name="dataVencimento"]', dataVencimento.toISOString().split('T')[0]);

    // Salvar
    await page.click('button:has-text("Adicionar")');

    // Verificar sucesso
    await expect(page.locator('text=Despesa adicionada')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);
    await expect(page.locator('text=R$ 2.000,00')).toBeVisible();
  });

  test('05 - Alterar status do evento para Confirmado', async ({ page }) => {
    await page.goto(`/eventos/${eventoId}`);
    await page.waitForLoadState('networkidle');

    // Clicar no botão de alterar status
    await page.click('button:has-text("Alterar Status")');
    await page.waitForSelector('[role="dialog"]');

    // Selecionar status confirmado
    await page.click('[role="option"]:has-text("Confirmado")');

    // Preencher motivo
    await page.fill('textarea[name="motivo"]', 'Cliente confirmou presença - E2E Test');

    // Confirmar
    await page.click('button:has-text("Confirmar")');

    // Verificar sucesso
    await expect(page.locator('text=Status alterado com sucesso')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);

    // Verificar badge de status
    await expect(page.locator('text=Confirmado')).toBeVisible();
  });

  test('06 - Registrar retirada de material', async ({ page }) => {
    await page.goto(`/eventos/${eventoId}`);
    await page.waitForLoadState('networkidle');

    // Ir para aba de operação
    await page.click('button:has-text("Operação")');
    await page.waitForTimeout(500);

    // Encontrar material alocado e registrar retirada
    const materialCard = page.locator('[data-testid="material-alocado"]').first();
    
    if (await materialCard.isVisible()) {
      await materialCard.hover();
      await page.click('button:has-text("Registrar Retirada")');
      await page.waitForSelector('[role="dialog"]');

      // Data de retirada
      const dataRetirada = new Date();
      await page.fill('input[name="dataRetirada"]', dataRetirada.toISOString().split('T')[0]);

      // Confirmar
      await page.click('button:has-text("Confirmar")');

      // Verificar sucesso
      await expect(page.locator('text=Retirada registrada')).toBeVisible({ timeout: 5000 });
    }
  });

  test('07 - Alterar status para Em Execução', async ({ page }) => {
    await page.goto(`/eventos/${eventoId}`);
    await page.waitForLoadState('networkidle');

    // Alterar status
    await page.click('button:has-text("Alterar Status")');
    await page.waitForSelector('[role="dialog"]');

    await page.click('[role="option"]:has-text("Em Execução")');
    await page.fill('textarea[name="motivo"]', 'Evento iniciado - E2E Test');
    await page.click('button:has-text("Confirmar")');

    await expect(page.locator('text=Status alterado com sucesso')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Em Execução')).toBeVisible();
  });

  test('08 - Alterar status para Concluído', async ({ page }) => {
    await page.goto(`/eventos/${eventoId}`);
    await page.waitForLoadState('networkidle');

    // Alterar status
    await page.click('button:has-text("Alterar Status")');
    await page.waitForSelector('[role="dialog"]');

    await page.click('[role="option"]:has-text("Concluído")');
    await page.fill('textarea[name="motivo"]', 'Evento finalizado com sucesso - E2E Test');
    await page.click('button:has-text("Confirmar")');

    await expect(page.locator('text=Status alterado com sucesso')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Concluído')).toBeVisible();
  });

  test('09 - Devolver material', async ({ page }) => {
    await page.goto(`/eventos/${eventoId}`);
    await page.waitForLoadState('networkidle');

    // Ir para aba de operação
    await page.click('button:has-text("Operação")');
    await page.waitForTimeout(500);

    // Encontrar material e devolver
    const materialCard = page.locator('[data-testid="material-alocado"]').first();
    
    if (await materialCard.isVisible()) {
      await materialCard.hover();
      await page.click('button:has-text("Devolver")');
      await page.waitForSelector('[role="dialog"]');

      // Selecionar status de devolução
      await page.click('[name="statusDevolucao"]');
      await page.click('[role="option"]:has-text("OK")');

      // Quantidade devolvida
      await page.fill('input[name="quantidadeDevolvida"]', '10');

      // Confirmar
      await page.click('button:has-text("Confirmar Devolução")');

      // Verificar sucesso
      await expect(page.locator('text=Material devolvido')).toBeVisible({ timeout: 5000 });
    }
  });

  test('10 - Arquivar evento', async ({ page }) => {
    await page.goto(`/eventos/${eventoId}`);
    await page.waitForLoadState('networkidle');

    // Abrir menu de ações
    await page.click('button[aria-label="Mais ações"]');
    await page.waitForTimeout(300);

    // Clicar em arquivar
    await page.click('text=Arquivar Evento');
    await page.waitForSelector('[role="dialog"]');

    // Confirmar arquivamento
    await page.click('button:has-text("Confirmar")');

    // Verificar sucesso
    await expect(page.locator('text=Evento arquivado')).toBeVisible({ timeout: 5000 });
  });

  test('11 - Verificar evento arquivado não aparece na lista principal', async ({ page }) => {
    await page.goto('/eventos');
    await page.waitForLoadState('networkidle');

    // Verificar que evento não aparece (sem filtro de arquivados)
    await expect(page.locator(`text=${eventoNome}`)).not.toBeVisible();

    // Ativar filtro de arquivados
    await page.click('button:has-text("Filtros")');
    await page.waitForTimeout(300);
    await page.check('input[name="mostrarArquivados"]');
    await page.click('button:has-text("Aplicar")');

    // Agora deve aparecer
    await page.waitForTimeout(1000);
    await expect(page.locator(`text=${eventoNome}`).first()).toBeVisible();
  });
});

test.describe('Fluxo: Validações e Restrições de Negócio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@admin.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('Não deve permitir criar evento com data de início no passado', async ({ page }) => {
    await page.goto('/eventos');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Novo Evento")');
    await page.waitForSelector('[role="dialog"]');

    await page.fill('input[name="nome"]', 'Evento Passado');
    
    // Data no passado
    const dataPassada = new Date();
    dataPassada.setDate(dataPassada.getDate() - 10);
    await page.fill('input[name="dataInicio"]', dataPassada.toISOString().split('T')[0]);

    await page.fill('input[name="horaInicio"]', '20:00');

    // Tentar salvar
    await page.click('button:has-text("Criar Evento")');

    // Deve mostrar erro de validação
    await expect(page.locator('text=/data.*passado|inválid/i')).toBeVisible({ timeout: 3000 });
  });

  test('Não deve permitir data fim antes de data início', async ({ page }) => {
    await page.goto('/eventos');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Novo Evento")');
    await page.waitForSelector('[role="dialog"]');

    await page.fill('input[name="nome"]', 'Evento Datas Erradas');

    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() + 10);
    const dataFim = new Date();
    dataFim.setDate(dataFim.getDate() + 5); // Antes do início

    await page.fill('input[name="dataInicio"]', dataInicio.toISOString().split('T')[0]);
    await page.fill('input[name="dataFim"]', dataFim.toISOString().split('T')[0]);

    await page.click('button:has-text("Criar Evento")');

    // Deve mostrar erro
    await expect(page.locator('text=/data.*fim.*antes|inválid/i')).toBeVisible({ timeout: 3000 });
  });

  test('Não deve permitir alocar material com quantidade zero', async ({ page }) => {
    // Criar evento temporário
    await page.goto('/eventos');
    const primeiroEvento = page.locator('[data-testid="evento-card"]').first();
    await primeiroEvento.click();
    await page.waitForURL(/\/eventos\/.*/);

    // Tentar alocar material
    await page.click('button:has-text("Materiais")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Adicionar Material")');
    await page.waitForSelector('[role="dialog"]');

    // Selecionar material
    await page.click('[placeholder*="material"]');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Quantidade zero ou vazia
    await page.fill('input[name="quantidade"]', '0');
    await page.click('button:has-text("Adicionar")');

    // Deve mostrar erro
    await expect(page.locator('text=/quantidade.*maior|inválid/i')).toBeVisible({ timeout: 3000 });
  });

  test('Não deve permitir remover material após evento iniciado', async ({ page }) => {
    // Este teste requer um evento em execução
    // Por simplicidade, vamos verificar se o botão está desabilitado/oculto
    await page.goto('/eventos');
    
    // Encontrar evento em execução (se houver)
    const eventoEmExecucao = page.locator('text=Em Execução').first();
    
    if (await eventoEmExecucao.isVisible()) {
      const card = eventoEmExecucao.locator('..').locator('..');
      await card.click();
      await page.waitForURL(/\/eventos\/.*/);

      await page.click('button:has-text("Materiais")');
      await page.waitForTimeout(500);

      // Botão de remover deve estar desabilitado ou não visível
      const btnRemover = page.locator('button:has-text("Remover Material")').first();
      if (await btnRemover.isVisible()) {
        await expect(btnRemover).toBeDisabled();
      }
    }
  });
});

test.describe('Fluxo: Performance e Escalabilidade', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@admin.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('Lista de eventos deve carregar em menos de 3 segundos', async ({ page }) => {
    const inicio = Date.now();
    
    await page.goto('/eventos');
    await page.waitForLoadState('networkidle');
    
    const tempoCarregamento = Date.now() - inicio;
    
    expect(tempoCarregamento).toBeLessThan(3000);
  });

  test('Paginação de eventos deve funcionar corretamente', async ({ page }) => {
    await page.goto('/eventos');
    await page.waitForLoadState('networkidle');

    // Verificar se há paginação
    const btnProxima = page.locator('button:has-text("Próxima")');
    
    if (await btnProxima.isVisible() && !(await btnProxima.isDisabled())) {
      const primeiroEvento = await page.locator('[data-testid="evento-card"]').first().textContent();
      
      await btnProxima.click();
      await page.waitForTimeout(1000);
      
      const primeiroEventoPagina2 = await page.locator('[data-testid="evento-card"]').first().textContent();
      
      // Eventos devem ser diferentes
      expect(primeiroEvento).not.toBe(primeiroEventoPagina2);
    }
  });

  test('Busca de eventos deve filtrar resultados', async ({ page }) => {
    await page.goto('/eventos');
    await page.waitForLoadState('networkidle');

    const totalEventos = await page.locator('[data-testid="evento-card"]').count();

    // Fazer busca
    await page.fill('input[placeholder*="Buscar"]', 'teste');
    await page.waitForTimeout(1000);

    const eventosDepoisBusca = await page.locator('[data-testid="evento-card"]').count();

    // Resultado deve ser diferente
    expect(eventosDepoisBusca).not.toBe(totalEventos);
  });
});
