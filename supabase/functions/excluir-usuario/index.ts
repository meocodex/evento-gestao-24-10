import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ✅ VALIDAR AUTENTICAÇÃO
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ Authorization header ausente');
      return new Response(
        JSON.stringify({ error: 'Não autorizado - Token de autenticação ausente' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // ✅ VALIDAR JWT E OBTER USUÁRIO
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error('❌ Token inválido:', authError);
      return new Response(
        JSON.stringify({ error: 'Token de autenticação inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Usuário autenticado:', user.id);

    // ✅ VALIDAR PERMISSÃO DE ADMIN
    const { data: hasAdmin, error: permError } = await supabaseAdmin
      .rpc('has_permission', { 
        _user_id: user.id, 
        _permission_id: 'admin.full_access' 
      });

    if (permError || !hasAdmin) {
      console.error('❌ Permissão negada para:', user.id);
      return new Response(
        JSON.stringify({ error: 'Permissão negada - Apenas administradores podem excluir usuários' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Permissão de admin validada');

    // ✅ OBTER user_id DO BODY
    const { user_id } = await req.json();

    if (!user_id) {
      throw new Error('user_id é obrigatório');
    }

    console.log('🗑️ Admin', user.email, 'excluindo usuário:', user_id);

    // Excluir usuário do Auth (cascade deleta profiles, roles, permissions via RLS)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);

    if (error) {
      console.error('❌ Erro ao excluir usuário:', error);
      throw error;
    }

    console.log('✅ Usuário excluído com sucesso');

    return new Response(
      JSON.stringify({ success: true, message: 'Usuário excluído com sucesso' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('❌ Erro na função excluir-usuario:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
