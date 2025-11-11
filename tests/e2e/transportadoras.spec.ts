import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'teste@eventflow.com',
  password: process.env.TEST_USER_PASSWORD || 'teste123'
};

test.describe('Transportadoras - Gestão Completa', () => {
  let transportadoraId: string;
  let envioId: string;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    await page.goto('/transportadoras');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    if (envioId) {
      await page.evaluate(async (id) => {
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase.from('envios').delete().eq('id', id);
      }, envioId);
    }
    if (transportadoraId) {
      await page.evaluate(async (id) => {
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase.from('transportadoras').delete().eq('id', id);
      }, transportadoraId);
    }
  });

  test('deve listar transportadoras existentes', async ({ page }) => {
    await expect(page.locator('h1:has-text("Transportadoras")')).toBeVisible();
  });

  test('deve criar transportadora', async ({ page }) => {
    await page.click('button:has-text("Nova Transportadora")');
    await page.waitForSelector('form');

    const timestamp = Date.now();
    await page.fill('input[name="nome"]', `Transportadora ${timestamp}`);
    await page.fill('input[name="cnpj"]', '12345678000195');
    await page.fill('input[name="telefone"]', '1133334444');
    await page.fill('input[name="email"]', `transp${timestamp}@test.com`);
    await page.fill('input[name="responsavel"]', 'João Silva');

    await page.click('button[type="submit"]:has-text("Salvar")');
    await expect(page.locator('text=Transportadora criada com sucesso')).toBeVisible();

    transportadoraId = await page.evaluate(async (nome) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('transportadoras')
        .select('id')
        .eq('nome', nome)
        .single();
      return data?.id;
    }, `Transportadora ${timestamp}`);
  });

  test('deve editar transportadora', async ({ page }) => {
    const nomeOriginal = `Transp Editar ${Date.now()}`;
    transportadoraId = await page.evaluate(async (nome) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('transportadoras')
        .insert({
          nome,
          cnpj: '11111111000111',
          telefone: '1144445555',
          email: `edit${Date.now()}@transp.com`,
          responsavel: 'Maria'
        })
        .select()
        .single();
      return data?.id;
    }, nomeOriginal);

    await page.reload();
    await page.click(`[data-transportadora-id="${transportadoraId}"]`);
    await page.click('button:has-text("Editar")');

    const novoNome = `Transp Editada ${Date.now()}`;
    await page.fill('input[name="nome"]', novoNome);
    await page.fill('input[name="telefone"]', '1155556666');
    await page.click('button[type="submit"]:has-text("Salvar")');

    await expect(page.locator('text=atualizada com sucesso')).toBeVisible();
  });

  test('deve gerenciar rotas da transportadora', async ({ page }) => {
    const nome = `Transp Rotas ${Date.now()}`;
    transportadoraId = await page.evaluate(async (nome) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('transportadoras')
        .insert({
          nome,
          cnpj: '22222222000122',
          telefone: '1166667777',
          email: `rotas${Date.now()}@transp.com`,
          responsavel: 'Pedro'
        })
        .select()
        .single();
      return data?.id;
    }, nome);

    await page.reload();
    await page.click(`[data-transportadora-id="${transportadoraId}"]`);
    await page.click('button:has-text("Gerenciar Rotas")');
    await page.waitForSelector('[role="dialog"]');

    // Adicionar rota
    await page.click('button:has-text("Adicionar Rota")');
    await page.fill('input[name="origem"]', 'São Paulo - SP');
    await page.fill('input[name="destino"]', 'Rio de Janeiro - RJ');
    await page.fill('input[name="preco"]', '500');
    await page.fill('input[name="prazo_dias"]', '2');

    await page.click('button:has-text("Salvar Rota")');
    await expect(page.locator('text=Rota adicionada com sucesso')).toBeVisible();
  });

  test('deve criar envio vinculado a evento', async ({ page }) => {
    // Criar transportadora e evento primeiro
    const nomeTransp = `Transp Envio ${Date.now()}`;
    transportadoraId = await page.evaluate(async (nome) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('transportadoras')
        .insert({
          nome,
          cnpj: '33333333000133',
          telefone: '1177778888',
          email: `envio${Date.now()}@transp.com`,
          responsavel: 'Ana'
        })
        .select()
        .single();
      return data?.id;
    }, nomeTransp);

    const eventoId = await page.evaluate(async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data: cliente } = await supabase
        .from('clientes')
        .insert({
          nome: `Cliente Envio ${Date.now()}`,
          tipo: 'pf',
          documento: '12345678900',
          email: `envio${Date.now()}@test.com`,
          telefone: '11999999999'
        })
        .select()
        .single();

      const { data: evento } = await supabase
        .from('eventos')
        .insert({
          nome: `Evento Envio ${Date.now()}`,
          cliente_id: cliente.id,
          data_evento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'confirmado'
        })
        .select()
        .single();

      return evento.id;
    });

    await page.click('button:has-text("Novo Envio")');
    await page.waitForSelector('form');

    await page.click('[data-testid="transportadora-select"]');
    await page.click(`[data-value="${transportadoraId}"]`);

    await page.click('[data-testid="evento-select"]');
    await page.click(`[data-value="${eventoId}"]`);

    await page.fill('input[name="codigo_rastreio"]', `TRACK${Date.now()}`);
    await page.fill('input[name="data_envio"]', '2024-12-01');
    await page.fill('input[name="data_prevista"]', '2024-12-03');

    await page.click('button[type="submit"]:has-text("Criar")');
    await expect(page.locator('text=Envio criado com sucesso')).toBeVisible();

    // Limpar evento
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
  });

  test('deve atualizar status do envio', async ({ page }) => {
    // Criar envio
    const codigoRastreio = `TRACK${Date.now()}`;
    
    transportadoraId = await page.evaluate(async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('transportadoras')
        .insert({
          nome: `Transp Status ${Date.now()}`,
          cnpj: '44444444000144',
          telefone: '1188889999',
          email: `status${Date.now()}@transp.com`,
          responsavel: 'Carlos'
        })
        .select()
        .single();
      return data?.id;
    });

    envioId = await page.evaluate(async ({ transportadoraId, codigo }) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('envios')
        .insert({
          transportadora_id: transportadoraId,
          codigo_rastreio: codigo,
          status: 'pendente',
          data_envio: new Date().toISOString()
        })
        .select()
        .single();
      return data?.id;
    }, { transportadoraId, codigo: codigoRastreio });

    await page.reload();
    await page.click(`[data-envio-id="${envioId}"]`);
    await page.click('[data-testid="status-select"]');
    await page.click('text=Em Trânsito');

    await expect(page.locator('text=Status atualizado')).toBeVisible();
    await expect(page.locator('[data-status-badge]:has-text("Em Trânsito")')).toBeVisible();
  });

  test('deve buscar transportadora por nome', async ({ page }) => {
    const nome = `Transp Busca ${Date.now()}`;
    transportadoraId = await page.evaluate(async (nome) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('transportadoras')
        .insert({
          nome,
          cnpj: '55555555000155',
          telefone: '1199990000',
          email: `busca${Date.now()}@transp.com`,
          responsavel: 'Fernanda'
        })
        .select()
        .single();
      return data?.id;
    }, nome);

    await page.reload();
    await page.fill('input[placeholder*="Buscar"]', nome);
    await page.waitForTimeout(1000);

    await expect(page.locator(`text=${nome}`)).toBeVisible();
  });

  test('deve validar CNPJ ao criar transportadora', async ({ page }) => {
    await page.click('button:has-text("Nova Transportadora")');
    
    await page.fill('input[name="nome"]', 'Teste CNPJ');
    await page.fill('input[name="cnpj"]', '00000000000000'); // CNPJ inválido
    await page.fill('input[name="telefone"]', '1133334444');
    
    await page.click('button[type="submit"]:has-text("Salvar")');
    
    await expect(page.locator('text=CNPJ inválido')).toBeVisible();
  });

  test('deve visualizar detalhes da transportadora', async ({ page }) => {
    const nome = `Transp Detalhes ${Date.now()}`;
    transportadoraId = await page.evaluate(async (nome) => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('transportadoras')
        .insert({
          nome,
          cnpj: '66666666000166',
          telefone: '1100001111',
          email: `det${Date.now()}@transp.com`,
          responsavel: 'Roberto',
          endereco: 'Rua Teste, 123',
          cidade: 'São Paulo',
          estado: 'SP'
        })
        .select()
        .single();
      return data?.id;
    }, nome);

    await page.reload();
    await page.click(`[data-transportadora-id="${transportadoraId}"]`);

    await expect(page.locator(`text=${nome}`)).toBeVisible();
    await expect(page.locator('text=Roberto')).toBeVisible();
    await expect(page.locator('text=São Paulo')).toBeVisible();
  });
});
