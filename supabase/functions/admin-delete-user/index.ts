import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🗑️ Admin Delete User - Iniciando...');

    // Criar cliente com service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Criar cliente autenticado para verificar quem está fazendo a requisição
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Não autenticado');
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    // Verificar usuário autenticado
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ Erro ao verificar usuário:', userError);
      throw new Error('Não autorizado');
    }

    console.log('✅ Usuário autenticado:', user.id);

    // Verificar se o usuário autenticado é admin
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || !userRole || userRole.role !== 'admin') {
      console.error('❌ Usuário não é admin:', roleError);
      throw new Error('Acesso negado: apenas administradores podem deletar usuários');
    }

    console.log('✅ Usuário é admin, prosseguindo...');

    // Obter email do usuário a ser deletado
    const { email } = await req.json();

    if (!email) {
      throw new Error('Email é obrigatório');
    }

    console.log('🔍 Buscando usuário:', email);

    // Buscar o ID do usuário pelo email
    const { data: targetProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (profileError || !targetProfile) {
      console.error('❌ Usuário não encontrado:', profileError);
      throw new Error('Usuário não encontrado');
    }

    const targetUserId = targetProfile.id;
    console.log('✅ Usuário encontrado:', targetUserId);

    // Deletar usuário (ON DELETE CASCADE vai limpar profiles, user_roles, user_permissions)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

    if (deleteError) {
      console.error('❌ Erro ao deletar usuário:', deleteError);
      throw new Error('Erro ao deletar usuário: ' + deleteError.message);
    }

    console.log('✅ Usuário deletado com sucesso:', email);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Usuário deletado com sucesso',
        email,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Erro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar usuário';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
