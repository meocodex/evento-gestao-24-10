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

    // O trigger handle_new_user() vai criar o profile e a role automaticamente
    // Mas como é o primeiro usuário, ele será admin (lógica do trigger)
    
    // Aguardar um pouco para garantir que o trigger executou
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verificar se o usuário foi criado corretamente
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      console.error('❌ Erro ao verificar profile:', profileError);
      throw new Error('Usuário criado mas houve erro na configuração do perfil');
    }

    const { data: role, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (roleError || !role || role.role !== 'admin') {
      console.error('❌ Erro ao verificar role:', roleError);
      throw new Error('Usuário criado mas não foi definido como admin');
    }

    console.log('✅ Primeiro admin configurado com sucesso!');
    console.log('📧 Email:', email);
    console.log('👤 Nome:', nome);
    console.log('🔑 Role:', role.role);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Primeiro administrador criado com sucesso!',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          nome: profile.nome,
          role: role.role,
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
