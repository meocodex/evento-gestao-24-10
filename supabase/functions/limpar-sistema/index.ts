import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    console.log('🧹 Iniciando limpeza completa do sistema...');

    // Fase 1 - Tabelas filhas
    const fase1 = [
      'eventos_materiais_alocados', 'eventos_equipe', 'eventos_receitas',
      'eventos_despesas', 'eventos_cobrancas', 'eventos_checklist',
      'eventos_timeline', 'eventos_configuracao_historico', 'eventos_contratos',
      'demandas_anexos', 'demandas_comentarios',
      'materiais_historico_movimentacao', 'materiais_seriais', 'envios',
    ];

    for (const table of fase1) {
      const { error } = await supabaseAdmin.from(table).delete().gte('created_at', '1970-01-01');
      if (error && !error.message.includes('does not exist')) {
        console.error(`⚠️ Erro em ${table}:`, error.message);
      } else {
        console.log(`✅ ${table} limpa`);
      }
    }

    // Fase 2 - Tabelas principais
    const fase2 = [
      'demandas', 'eventos', 'materiais_estoque', 'clientes',
      'equipe_operacional', 'contratos', 'contratos_templates',
      'contas_pagar', 'contas_receber', 'cadastros_publicos', 'transportadoras',
    ];

    for (const table of fase2) {
      const { error } = await supabaseAdmin.from(table).delete().gte('created_at', '1970-01-01');
      if (error && !error.message.includes('does not exist')) {
        console.error(`⚠️ Erro em ${table}:`, error.message);
      } else {
        console.log(`✅ ${table} limpa`);
      }
    }

    // Fase 3 - Configurações e sistema
    const fase3 = [
      'notificacoes', 'configuracoes_categorias', 'configuracoes_usuario',
      'configuracoes_empresa', 'configuracoes_fechamento',
      'configuracoes_taxas_pagamento', 'audit_logs',
    ];

    for (const table of fase3) {
      const { error } = await supabaseAdmin.from(table).delete().gte('created_at', '1970-01-01');
      if (error && !error.message.includes('does not exist')) {
        console.error(`⚠️ Erro em ${table}:`, error.message);
      } else {
        console.log(`✅ ${table} limpa`);
      }
    }

    // Rate limit tables (different PKs)
    await supabaseAdmin.from('auth_rate_limit').delete().gte('created_at', '1970-01-01');
    console.log('✅ auth_rate_limit limpa');
    await supabaseAdmin.from('cadastro_rate_limit').delete().gte('window_start', '1970-01-01');
    console.log('✅ cadastro_rate_limit limpa');

    // Fase 4 - Usuários e permissões
    await supabaseAdmin.from('user_permissions').delete().neq('permission_id', '___none___');
    console.log('✅ user_permissions limpa');
    await supabaseAdmin.from('user_roles').delete().neq('role', '___none___');
    console.log('✅ user_roles limpa');
    await supabaseAdmin.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ profiles limpa');

    // Deletar todos os usuários do auth
    const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError);
    } else {
      console.log(`🗑️ Deletando ${authUsers.users.length} usuários do auth...`);
      for (const user of authUsers.users) {
        const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
        if (delError) {
          console.error(`⚠️ Erro ao deletar ${user.email}:`, delError.message);
        } else {
          console.log(`✅ Usuário ${user.email} deletado`);
        }
      }
    }

    // Limpar storage buckets
    const buckets = ['avatars', 'eventos', 'contratos', 'comprovantes', 'demandas', 'estoque', 'financeiro-anexos', 'documentos-transporte', 'cadastros-publicos'];
    for (const bucket of buckets) {
      try {
        const { data: files } = await supabaseAdmin.storage.from(bucket).list('', { limit: 1000 });
        if (files && files.length > 0) {
          const paths = files.map(f => f.name);
          await supabaseAdmin.storage.from(bucket).remove(paths);
          console.log(`✅ Storage ${bucket}: ${paths.length} arquivos removidos`);
        }
      } catch (e) {
        console.log(`⚠️ Storage ${bucket}: ${e.message}`);
      }
    }

    console.log('🎉 Limpeza completa finalizada!');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sistema completamente limpo. Execute setup-first-admin para criar o primeiro administrador.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
