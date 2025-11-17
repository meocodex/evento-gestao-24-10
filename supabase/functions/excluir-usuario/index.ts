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
    // 🔐 FASE 2.2: AUTORIZAÇÃO - Verificar JWT e permissão
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ Token ausente');
      return new Response(
        JSON.stringify({ error: 'Não autorizado: Token ausente' }),
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

    // Verificar usuário autenticado
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error('❌ Token inválido:', authError);
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se tem permissão admin
    const { data: hasAdmin, error: permError } = await supabaseAdmin
      .rpc('has_permission', { 
        _user_id: user.id, 
        _permission_id: 'admin.full_access' 
      });

    if (permError || !hasAdmin) {
      console.error('❌ Usuário sem permissão admin:', user.email);
      return new Response(
        JSON.stringify({ error: 'Permissão negada: Apenas administradores podem excluir usuários' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Autorização concedida para:', user.email);

    const { user_id } = await req.json();

    if (!user_id) {
      throw new Error('user_id é obrigatório');
    }

    // Verificar se usuário existe no auth
    const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(user_id);

    if (!userData || getUserError?.message?.includes('User not found')) {
      console.log('⚠️ Usuário já foi excluído do auth, limpando registros relacionados...');
      
      // Limpar registros órfãos (profiles, roles, permissions)
      const { error: cleanupError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', user_id);
      
      if (cleanupError) {
        console.error('⚠️ Erro ao limpar profile órfão:', cleanupError);
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Registros relacionados removidos com sucesso' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 🔒 PROTEÇÃO: Bloquear exclusão do admin principal
    if (userData?.user?.email === 'admin@admin.com') {
      console.error('❌ Tentativa de excluir admin principal bloqueada');
      return new Response(
        JSON.stringify({ error: 'O administrador principal não pode ser excluído' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prevenir auto-exclusão
    if (user_id === user.id) {
      throw new Error('Você não pode excluir seu próprio usuário');
    }

    console.log('🗑️ Excluindo usuário:', user_id);

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
