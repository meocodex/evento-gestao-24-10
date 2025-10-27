import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { nome, email, cpf, telefone, senha, tipo, permissions } = await req.json();

    // Validações básicas
    if (!nome || !email || !senha || !permissions || !Array.isArray(permissions)) {
      return new Response(
        JSON.stringify({ error: 'Dados obrigatórios faltando' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Verificando usuário:', { email, nome, tipo, permissions: permissions.length });

    // 1. Verificar se usuário já existe por email
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Erro ao listar usuários:', listError);
    }

    const existingUser = existingUsers?.users?.find(u => u.email === email);

    if (existingUser) {
      console.log('⚠️ Usuário já existe, atualizando tipo e permissões:', existingUser.id);

      // Atualizar tipo no profile
      const { error: updateProfileError } = await supabaseAdmin
        .from('profiles')
        .update({ tipo })
        .eq('id', existingUser.id);

      if (updateProfileError) {
        console.error('Erro ao atualizar profile:', updateProfileError);
      }

      // Deletar permissões antigas
      await supabaseAdmin
        .from('user_permissions')
        .delete()
        .eq('user_id', existingUser.id);

      // Inserir novas permissões
      if (permissions.length > 0) {
        const permissionsData = permissions.map((permission_id: string) => ({
          user_id: existingUser.id,
          permission_id,
        }));

        const { error: permissionsError } = await supabaseAdmin
          .from('user_permissions')
          .insert(permissionsData);

        if (permissionsError) {
          console.error('Erro ao inserir permissões:', permissionsError);
          return new Response(
            JSON.stringify({ error: 'Erro ao definir permissões do usuário' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          user: existingUser,
          message: 'Acesso atualizado com sucesso'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Se não existe, criar normalmente
    console.log('Criando novo usuário:', { email, nome, tipo });

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: {
        nome,
        cpf,
        telefone,
        tipo: tipo || 'sistema',
      },
    });

    if (authError) {
      console.error('Erro ao criar usuário:', authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Usuário criado com sucesso:', authData.user?.id);

    // Atualizar tipo no profile
    if (tipo && authData.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ tipo })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Erro ao atualizar tipo do perfil:', profileError);
      }
    }

    // Inserir permissões do usuário
    if (authData.user && permissions.length > 0) {
      console.log('Inserindo permissões:', permissions.length);

      const permissionsData = permissions.map((permission_id: string) => ({
        user_id: authData.user!.id,
        permission_id,
      }));

      const { error: permissionsError } = await supabaseAdmin
        .from('user_permissions')
        .insert(permissionsData);

      if (permissionsError) {
        console.error('Erro ao inserir permissões:', permissionsError);
        return new Response(
          JSON.stringify({ error: 'Erro ao definir permissões do usuário' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: authData.user 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na edge function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
