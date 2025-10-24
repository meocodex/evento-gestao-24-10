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
    console.log('🔧 Setup First Admin - Iniciando...');

    const { nome, email, password, telefone, cpf } = await req.json();

    // Validações básicas
    if (!nome || !email || !password) {
      throw new Error('Nome, email e senha são obrigatórios');
    }

    if (password.length < 8) {
      throw new Error('Senha deve ter no mínimo 8 caracteres');
    }

    // Criar cliente Supabase com service role (admin)
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

    // Verificar se já existe algum usuário
    const { data: existingUsers, error: checkError } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .limit(1);

    if (checkError) {
      console.error('❌ Erro ao verificar usuários existentes:', checkError);
      throw new Error('Erro ao verificar usuários existentes');
    }

    if (existingUsers && existingUsers.length > 0) {
      console.warn('⚠️ Sistema já tem usuários cadastrados');
      throw new Error('O sistema já possui usuários cadastrados. Use o fluxo normal de criação de usuários.');
    }

    console.log('✅ Sistema vazio, criando primeiro admin...');

    // Criar usuário
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar email
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

    // Criar profile manualmente (não depender de trigger)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        nome,
        email,
        telefone,
        cpf,
      });

    if (profileError) {
      console.error('❌ Erro ao criar profile:', profileError);
      throw new Error('Erro ao criar perfil do usuário');
    }

    console.log('✅ Profile criado');

    // Criar role admin manualmente
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

    // Buscar TODAS as permissões disponíveis
    const { data: allPermissions, error: permError } = await supabaseAdmin
      .from('permissions')
      .select('id');

    if (permError || !allPermissions) {
      console.error('❌ Erro ao buscar permissões:', permError);
      throw new Error('Erro ao buscar permissões do sistema');
    }

    console.log(`✅ ${allPermissions.length} permissões encontradas`);

    // Inserir todas as permissões para o admin
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
    const errorMessage = error instanceof Error ? error.message : 'Erro ao criar primeiro administrador';
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
