import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'teste@eventflow.com',
  password: process.env.TEST_USER_PASSWORD || 'teste123'
};

test.describe('Demandas - CRUD Completo', () => {
  let demandaId: string;
  let eventoId: string;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Criar evento de teste
    eventoId = await page.evaluate(async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data: cliente } = await supabase
        .from('clientes')
        .insert({
          nome: `Cliente Teste ${Date.now()}`,
          tipo: 'pf',
          documento: '12345678900',
          email: `teste${Date.now()}@test.com`,
          telefone: '11999999999'
        })
        .select()
        .single();

      const { data: comercial } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'comercial')
        .limit(1)
        .single();

      const { data: evento } = await supabase
        .from('eventos')
        .insert({
          nome: `Evento Teste ${Date.now()}`,
          cliente_id: cliente.id,
          comercial_id: comercial?.id,
          data_evento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'em_negociacao',
        })
        .select()
        .single();

      return evento.id;
    });

    await page.goto('/demandas');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    if (demandaId) {
      await page.evaluate(async (id) => {
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase.from('demandas').delete().eq('id', id);
      }, demandaId);
    }
    if (eventoId) {
      await page.evaluate(async (id) => {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: evento } = await supabase
          .from('eventos')
          .select('cliente_id')
          .eq('id', id)
          .single();
        
        await supabase.from('eventos').delete().eq('id', id);
        if (evento?.cliente_id) {
          await supabase.from('clientes').delete().eq('id', evento.cliente_id);
        }
      }, eventoId);
    }
  });

  test('deve listar demandas existentes', async ({ page }) => {
    await expect(page.locator('h1:has-text("Demandas")')).toBeVisible();
  });

  test('deve criar demanda vinculada a evento', async ({ page }) => {
    await page.click('button:has-text("Nova Demanda")');
    await page.waitForSelector('form');

    const titulo = `Demanda Teste ${Date.now()}`;
    await page.fill('input[name="titulo"]', titulo);
    await page.fill('textarea[name="descricao"]', 'Descrição da demanda de teste');
    
    await page.click('[data-testid="categoria-select"]');
    await page.click('text=Logística');
    
    await page.click('[data-testid="prioridade-select"]');
    await page.click('text=Alta');
    
    await page.click('[data-testid="evento-select"]');
    await page.click(`[data-value="${eventoId}"]`);

    await page.click('button[type="submit"]:has-text("Criar")');
    await expect(page.locator('text=Demanda criada com sucesso')).toBeVisible();

    // Capturar ID
    demandaId = await page.evaluate(async (titulo) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('demandas')
        .select('id')
        .eq('titulo', titulo)
        .single();
      return data?.id;
    }, titulo);
  });

  test('deve criar demanda de reembolso', async ({ page }) => {
    await page.click('button:has-text("Nova Demanda de Reembolso")');
    await page.waitForSelector('form');

    const titulo = `Reembolso ${Date.now()}`;
    await page.fill('input[name="titulo"]', titulo);
    await page.fill('textarea[name="descricao"]', 'Solicitação de reembolso');
    await page.fill('input[name="valor"]', '150.50');
    
    await page.click('[data-testid="tipo-select"]');
    await page.click('text=Alimentação');

    await page.click('button[type="submit"]:has-text("Criar")');
    await expect(page.locator('text=Demanda criada com sucesso')).toBeVisible();

    demandaId = await page.evaluate(async (titulo) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('demandas')
        .select('id')
        .eq('titulo', titulo)
        .single();
      return data?.id;
    }, titulo);
  });

  test('deve filtrar demandas por status', async ({ page }) => {
    await page.click('[data-testid="filtro-status"]');
    await page.click('text=Pendente');
    await page.waitForTimeout(500);

    // Verificar que apenas demandas pendentes aparecem
    const statusBadges = await page.locator('[data-status-badge]').allTextContents();
    statusBadges.forEach(badge => {
      expect(badge.toLowerCase()).toContain('pendente');
    });
  });

  test('deve filtrar demandas por prioridade', async ({ page }) => {
    await page.click('[data-testid="filtro-prioridade"]');
    await page.click('text=Alta');
    await page.waitForTimeout(500);

    const prioridadeBadges = await page.locator('[data-prioridade-badge]').allTextContents();
    prioridadeBadges.forEach(badge => {
      expect(badge.toLowerCase()).toContain('alta');
    });
  });

  test('deve buscar demanda por título', async ({ page }) => {
    const titulo = `Demanda Busca ${Date.now()}`;
    demandaId = await page.evaluate(async ({ titulo, eventoId }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('demandas')
        .insert({
          titulo,
          descricao: 'Teste busca',
          categoria: 'logistica',
          prioridade: 'media',
          evento_id: eventoId,
          status: 'pendente'
        })
        .select()
        .single();
      return data?.id;
    }, { titulo, eventoId });

    await page.reload();
    await page.fill('input[placeholder*="Buscar"]', titulo);
    await page.waitForTimeout(1000);

    await expect(page.locator(`text=${titulo}`)).toBeVisible();
  });

  test('deve editar demanda', async ({ page }) => {
    const tituloOriginal = `Demanda Editar ${Date.now()}`;
    demandaId = await page.evaluate(async ({ titulo, eventoId }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('demandas')
        .insert({
          titulo,
          descricao: 'Descrição original',
          categoria: 'logistica',
          prioridade: 'media',
          evento_id: eventoId,
          status: 'pendente'
        })
        .select()
        .single();
      return data?.id;
    }, { titulo: tituloOriginal, eventoId });

    await page.reload();
    await page.click(`[data-demanda-id="${demandaId}"]`);
    await page.click('button:has-text("Editar")');

    const novoTitulo = `Demanda Editada ${Date.now()}`;
    await page.fill('input[name="titulo"]', novoTitulo);
    await page.click('[data-testid="prioridade-select"]');
    await page.click('text=Alta');
    await page.click('button[type="submit"]:has-text("Salvar")');

    await expect(page.locator('text=Demanda atualizada com sucesso')).toBeVisible();
  });

  test('deve adicionar comentário à demanda', async ({ page }) => {
    const titulo = `Demanda Comentário ${Date.now()}`;
    demandaId = await page.evaluate(async ({ titulo, eventoId }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('demandas')
        .insert({
          titulo,
          descricao: 'Teste comentários',
          categoria: 'operacional',
          prioridade: 'media',
          evento_id: eventoId,
          status: 'pendente'
        })
        .select()
        .single();
      return data?.id;
    }, { titulo, eventoId });

    await page.reload();
    await page.click(`[data-demanda-id="${demandaId}"]`);
    
    // Ir para aba de comentários
    await page.click('button:has-text("Conversa")');
    
    const comentario = `Comentário teste ${Date.now()}`;
    await page.fill('textarea[placeholder*="comentário"]', comentario);
    await page.click('button:has-text("Enviar")');

    await expect(page.locator(`text=${comentario}`)).toBeVisible();
  });

  test('deve alterar status da demanda', async ({ page }) => {
    const titulo = `Demanda Status ${Date.now()}`;
    demandaId = await page.evaluate(async ({ titulo, eventoId }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('demandas')
        .insert({
          titulo,
          descricao: 'Teste status',
          categoria: 'operacional',
          prioridade: 'baixa',
          evento_id: eventoId,
          status: 'pendente'
        })
        .select()
        .single();
      return data?.id;
    }, { titulo, eventoId });

    await page.reload();
    await page.click(`[data-demanda-id="${demandaId}"]`);
    await page.click('[data-testid="status-select"]');
    await page.click('text=Em Andamento');

    await expect(page.locator('text=Status atualizado')).toBeVisible();
    await expect(page.locator('[data-status-badge]:has-text("Em Andamento")')).toBeVisible();
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    await page.click('button:has-text("Nova Demanda")');
    await page.click('button[type="submit"]:has-text("Criar")');
    
    await expect(page.locator('text=obrigatório')).toBeVisible();
  });
});
