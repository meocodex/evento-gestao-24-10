import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    console.log('🔧 Setup First Admin - Iniciando...');

    // Criar cliente admin primeiro
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

    // 🔐 FASE 2.3 PROTEÇÃO 1: Verificar se sistema já tem usuários
    const { data: hasUsers } = await supabaseAdmin.rpc('system_has_users');

    if (hasUsers) {
      console.warn('⚠️ Sistema já possui usuários');
      return new Response(
        JSON.stringify({ 
          error: 'O sistema já possui usuários. Use o painel administrativo para criar novos usuários.' 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 🔐 PROTEÇÃO 2: Rate Limiting
    const clientIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    const { data: canProceed } = await supabaseAdmin.rpc('check_auth_rate_limit', {
      p_identifier: clientIp,
      p_attempt_type: 'setup_admin',
      p_max_attempts: 3,
      p_window_minutes: 60,
      p_block_minutes: 120
    });

    if (!canProceed) {
      console.warn('⚠️ Rate limit atingido para IP:', clientIp);
      return new Response(
        JSON.stringify({ error: 'Muitas tentativas. Aguarde 2 horas antes de tentar novamente.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { nome, email, password, telefone, cpf } = await req.json();

    // Validações
    if (!nome || !email || !password) {
      throw new Error('Nome, email e senha são obrigatórios');
    }

    if (password.length < 8) {
      throw new Error('Senha deve ter no mínimo 8 caracteres');
    }

    console.log('✅ Sistema vazio e rate limit OK, criando primeiro admin...');

    // Criar usuário
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nome,
        telefone,
        cpf,
      }
    });

    if (authError || !authData.user) {
      console.error('❌ Erro ao criar usuário:', authError);
      throw new Error(authError?.message || 'Erro ao criar usuário');
    }

    console.log('✅ Usuário criado:', authData.user.id);

    // Upsert profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: authData.user.id,
          nome,
          email,
          telefone,
          cpf,
        },
        { onConflict: 'id' }
      );

    if (profileError) {
      console.error('⚠️ Aviso ao criar/atualizar profile:', profileError);
      console.log('⏭️ Continuando apesar do erro no profile...');
    } else {
      console.log('✅ Profile criado/atualizado');
    }

    // Garantir role admin
    await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', authData.user.id);

    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'admin',
      });

    if (roleError) {
      console.error('❌ Erro ao criar role:', roleError);
      throw new Error('Erro ao definir role do usuário');
    }

    console.log('✅ Role admin criada');

    // Buscar e inserir todas as permissões
    const { data: allPermissions, error: permError } = await supabaseAdmin
      .from('permissions')
      .select('id');

    if (permError || !allPermissions) {
      console.error('❌ Erro ao buscar permissões:', permError);
      throw new Error('Erro ao buscar permissões do sistema');
    }

    console.log(`✅ ${allPermissions.length} permissões encontradas`);

    await supabaseAdmin
      .from('user_permissions')
      .delete()
      .eq('user_id', authData.user.id);

    const permissionsToInsert = allPermissions.map(p => ({
      user_id: authData.user.id,
      permission_id: p.id,
    }));

    const { error: userPermError } = await supabaseAdmin
      .from('user_permissions')
      .insert(permissionsToInsert);

    if (userPermError) {
      console.error('❌ Erro ao atribuir permissões:', userPermError);
      throw new Error('Erro ao atribuir permissões ao admin');
    }

    console.log('✅ Todas as permissões atribuídas ao admin');

    // Verificar resultado final
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    const { data: role } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    const { count: permCount } = await supabaseAdmin
      .from('user_permissions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authData.user.id);

    console.log('✅ Primeiro admin configurado com sucesso!');
    console.log('📧 Email:', email);
    console.log('👤 Nome:', nome);
    console.log('🔑 Role:', role?.role);
    console.log('🔐 Permissões:', permCount);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Primeiro administrador criado com sucesso!',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          nome: profile?.nome,
          role: role?.role,
          permissions: permCount,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Erro no setup:', error);
    let errorMessage = error instanceof Error ? error.message : 'Erro ao criar primeiro administrador';
    
    if (errorMessage.includes('duplicate key') || errorMessage.includes('already registered')) {
      errorMessage = 'Este email já está cadastrado. Por favor, faça login com suas credenciais.';
    }
    
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
