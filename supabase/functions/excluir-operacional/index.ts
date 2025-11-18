import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ Sem Authorization header');
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Client com service role para bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Client normal para verificar permissões
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
        auth: {
          persistSession: false,
        },
      }
    );

    // Verificar usuário autenticado
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('❌ Erro ao obter usuário:', userError);
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Usuário autenticado:', user.id, user.email);

    // Verificar permissões
    const { data: hasEditPermission } = await supabaseAdmin.rpc('has_permission', {
      _user_id: user.id,
      _permission_id: 'equipe.editar'
    });

    const { data: hasAdminPermission } = await supabaseAdmin.rpc('has_permission', {
      _user_id: user.id,
      _permission_id: 'admin.full_access'
    });

    if (!hasEditPermission && !hasAdminPermission) {
      console.error('❌ Usuário sem permissão:', user.email);
      return new Response(
        JSON.stringify({ 
          error: 'Você não tem permissão para excluir membros da equipe. Solicite "equipe.editar" ou "admin.full_access".' 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Permissões verificadas:', { hasEditPermission, hasAdminPermission });

    // Obter ID do operacional
    const { operacional_id } = await req.json();
    if (!operacional_id) {
      console.error('❌ ID não fornecido');
      return new Response(
        JSON.stringify({ error: 'ID do operacional é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🗑️ Tentando excluir operacional:', operacional_id);

    // Buscar dados antes de excluir (para log)
    const { data: operacional } = await supabaseAdmin
      .from('equipe_operacional')
      .select('id, nome, email')
      .eq('id', operacional_id)
      .single();

    if (!operacional) {
      console.error('❌ Operacional não encontrado:', operacional_id);
      return new Response(
        JSON.stringify({ error: 'Membro não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📋 Operacional encontrado:', operacional);

    // Excluir com service role (bypass RLS)
    const { error: deleteError } = await supabaseAdmin
      .from('equipe_operacional')
      .delete()
      .eq('id', operacional_id);

    if (deleteError) {
      console.error('❌ Erro ao excluir:', deleteError);
      return new Response(
        JSON.stringify({ error: `Erro ao excluir: ${deleteError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Operacional excluído com sucesso:', operacional.nome, operacional.email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Membro excluído com sucesso',
        deleted: {
          id: operacional.id,
          nome: operacional.nome,
          email: operacional.email
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro geral:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
