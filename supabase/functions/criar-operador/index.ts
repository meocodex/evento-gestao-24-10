import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Schema de validação Zod para entrada
const OperadorSchema = z.object({
  nome: z.string().trim().min(3, 'Nome deve ter no mínimo 3 caracteres').max(200, 'Nome muito longo'),
  email: z.string().trim().email('Email inválido').max(255, 'Email muito longo'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos').optional(),
  telefone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido (10-11 dígitos)').optional(),
  senha: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres').max(100, 'Senha muito longa'),
  tipo: z.enum(['operacional', 'suporte', 'sistema'], { errorMap: () => ({ message: 'Tipo inválido' }) }).optional(),
  permissions: z.array(z.string()).min(1, 'Selecione pelo menos 1 permissão')
});

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

    // Validar entrada com Zod
    const body = await req.json();
    const validation = OperadorSchema.safeParse(body);
    
    if (!validation.success) {
      console.error('❌ Validação Zod falhou:', validation.error.errors);
      return new Response(
        JSON.stringify({ 
          error: 'Dados inválidos', 
          details: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { nome, email, cpf, telefone, senha, tipo, permissions } = validation.data;

    console.log('✅ Validação OK:', { email, nome, tipo, permissionsCount: permissions.length });

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
        throw updateProfileError;
      }

      console.log('✅ Tipo de perfil atualizado:', tipo);

      // Deletar permissões antigas
      const { error: deleteError } = await supabaseAdmin
        .from('user_permissions')
        .delete()
        .eq('user_id', existingUser.id);

      if (deleteError) {
        console.error('⚠️ Erro ao deletar permissões antigas:', deleteError);
        throw deleteError;
      }

      console.log('✅ Permissões antigas removidas');

      // Inserir novas permissões
      console.log(`🔄 Inserindo ${permissions.length} novas permissões...`);
      
      const userPermissions = permissions.map((permissionId: string) => ({
        user_id: existingUser.id,
        permission_id: permissionId,
      }));

      const { error: permError } = await supabaseAdmin
        .from('user_permissions')
        .insert(userPermissions);

      if (permError) {
        console.error('❌ Erro ao inserir permissões:', permError);
        throw permError;
      }

      // Validação pós-inserção
      const { count } = await supabaseAdmin
        .from('user_permissions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', existingUser.id);

      if (count !== permissions.length) {
        console.error(`⚠️ Esperado ${permissions.length} permissões, inserido ${count}`);
        throw new Error(`Falha ao inserir todas as permissões (${count}/${permissions.length})`);
      }

      console.log(`✅ ${count} permissões inseridas e validadas com sucesso`);

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
        throw profileError;
      }

      console.log('✅ Tipo de perfil atualizado:', tipo);

      // Inserir permissões (SEM role - sistema granular)
      console.log(`🔄 Inserindo ${permissions.length} permissões para novo usuário...`);
      
      const userPermissions = permissions.map((permissionId: string) => ({
        user_id: authData.user!.id,
        permission_id: permissionId,
      }));

      const { error: permError } = await supabaseAdmin
        .from('user_permissions')
        .insert(userPermissions);

      if (permError) {
        console.error('❌ Erro ao inserir permissões:', permError);
        throw permError;
      }

      // Validação pós-inserção
      const { count } = await supabaseAdmin
        .from('user_permissions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', authData.user!.id);

      if (count !== permissions.length) {
        console.error(`⚠️ Esperado ${permissions.length} permissões, inserido ${count}`);
        throw new Error(`Falha ao inserir todas as permissões (${count}/${permissions.length})`);
      }

      console.log(`✅ ${count} permissões inseridas e validadas com sucesso`);
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