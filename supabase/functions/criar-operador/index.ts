import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 🔐 FASE 2.1: Schema de validação Zod
const OperadorSchema = z.object({
  nome: z.string().trim().min(3, 'Nome deve ter no mínimo 3 caracteres').max(200, 'Nome muito longo'),
  email: z.string().email('Email inválido').max(255, 'Email muito longo'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos').optional(),
  telefone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido').optional(),
  senha: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres').max(100, 'Senha muito longa'),
  roles: z.array(z.enum(['admin', 'comercial', 'suporte', 'operacional', 'financeiro']))
    .min(1, 'Selecione pelo menos 1 função')
    .max(5, 'Máximo de 5 funções'),
  permissions: z.array(z.string()).min(1, 'Selecione pelo menos 1 permissão')
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validação do schema
    const body = await req.json();
    const validation = OperadorSchema.safeParse(body);
    
    if (!validation.success) {
      console.error('❌ Validação falhou:', validation.error.flatten());
      return new Response(
        JSON.stringify({ 
          error: 'Dados inválidos', 
          details: validation.error.flatten().fieldErrors 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { nome, email, cpf, telefone, senha, roles, permissions } = validation.data;

    console.log('📥 Recebida requisição criar-operador:', { email, nome, roles, permissionsCount: permissions.length });

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

    // 1. Verificar se usuário já existe por email
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Erro ao listar usuários:', listError);
    }

    const existingUser = existingUsers?.users?.find(u => u.email === email);

    if (existingUser) {
      console.log('⚠️ Usuário já existe, atualizando permissões:', existingUser.id);

      // Deletar roles antigas
      const { error: deleteRolesError } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', existingUser.id);

      if (deleteRolesError) {
        console.error('⚠️ Erro ao deletar roles antigas:', deleteRolesError);
        throw deleteRolesError;
      }

      console.log('✅ Roles antigas removidas');

      // Inserir novas roles
      console.log(`🔄 Inserindo ${roles.length} roles...`);
      
      const userRoles = roles.map((role: string) => ({
        user_id: existingUser.id,
        role: role,
      }));

      const { error: rolesError } = await supabaseAdmin
        .from('user_roles')
        .insert(userRoles);

      if (rolesError) {
        console.error('❌ Erro ao inserir roles:', rolesError);
        throw rolesError;
      }

      // Validação pós-inserção roles
      const { count: rolesCount } = await supabaseAdmin
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', existingUser.id);

      if (rolesCount !== roles.length) {
        console.error(`⚠️ Esperado ${roles.length} roles, inserido ${rolesCount}`);
        throw new Error(`Falha ao inserir todas as roles (${rolesCount}/${roles.length})`);
      }

      console.log(`✅ ${rolesCount} roles inseridas e validadas com sucesso`);

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
    console.log('Criando novo usuário:', { email, nome });

    // 🧹 Verificar e limpar perfil órfão específico deste email
    console.log('🔍 Verificando se existe perfil órfão para este email...');
    
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();
    
    if (existingProfile) {
      console.log('⚠️ Perfil encontrado:', existingProfile.id);
      
      // Verificar se o usuário existe em auth.users
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(existingProfile.id);
      
      if (!authUser.user) {
        console.log('🗑️ Perfil órfão detectado, removendo...');
        
        // Deletar perfil órfão diretamente
        const { error: deleteError } = await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('id', existingProfile.id);
        
        if (deleteError) {
          console.error('❌ Erro ao deletar perfil órfão:', deleteError);
          return new Response(
            JSON.stringify({ 
              error: 'cleanup_failed',
              message: 'Não foi possível limpar o perfil existente. Contate o suporte.',
              details: deleteError.message
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log('✅ Perfil órfão removido com sucesso');
      } else {
        console.log('⚠️ Perfil válido encontrado (usuário existe)');
        return new Response(
          JSON.stringify({ 
            error: 'email_already_exists',
            message: 'Este email já está cadastrado no sistema. Use "Gerenciar Permissões" para editar as permissões do usuário existente.'
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Criar o usuário
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: {
        nome,
        cpf,
        telefone,
      },
    });

    if (authError) {
      console.error('❌ Erro ao criar usuário:', authError);
      return new Response(
        JSON.stringify({ 
          error: 'user_creation_failed',
          message: 'Erro ao criar usuário: ' + authError.message
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!authData?.user) {
      return new Response(
        JSON.stringify({ error: 'Falha ao criar usuário: dados não retornados' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Usuário criado com sucesso:', authData.user?.id);

    // Inserir roles selecionadas
    // O trigger handle_new_user() NÃO insere mais roles automaticamente
    // (exceto para o primeiro usuário do sistema que recebe 'admin')
    if (authData.user) {
      console.log(`🔄 Inserindo ${roles.length} roles selecionadas...`);
      
      const userRoles = roles.map((role: string) => ({
        user_id: authData.user!.id,
        role: role,
      }));

      const { error: rolesError } = await supabaseAdmin
        .from('user_roles')
        .insert(userRoles);

      if (rolesError) {
        console.error('❌ Erro ao inserir roles:', rolesError);
        throw rolesError;
      }

      // Validação pós-inserção roles
      const { count: rolesCount } = await supabaseAdmin
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', authData.user!.id);

      if (rolesCount !== roles.length) {
        console.error(`⚠️ Esperado ${roles.length} roles, inserido ${rolesCount}`);
        throw new Error(`Falha ao inserir todas as roles (${rolesCount}/${roles.length})`);
      }

      console.log(`✅ ${rolesCount} roles inseridas e validadas com sucesso`);

      // Inserir permissões
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
