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
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos').optional()
    .or(z.literal('').transform(() => undefined)),
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

    // 🔍 VALIDAR PERMISSÕES ANTES DE PROSSEGUIR
    console.log('🔍 Validando permissões...');
    const { data: validPermissions, error: permCatalogError } = await supabaseAdmin
      .from('permissions')
      .select('id');
    
    if (permCatalogError) {
      console.error('❌ Erro ao buscar catálogo de permissões:', permCatalogError);
      return new Response(
        JSON.stringify({ 
          error: 'catalog_error',
          message: 'Erro ao validar permissões: ' + permCatalogError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validIds = new Set(validPermissions?.map((p: { id: string }) => p.id) ?? []);
    const invalidPermissions = permissions.filter((p: string) => !validIds.has(p));
    
    if (invalidPermissions.length > 0) {
      console.error('❌ Permissões inválidas detectadas:', invalidPermissions);
      return new Response(
        JSON.stringify({ 
          error: 'invalid_permissions',
          message: 'Existem permissões inválidas na requisição',
          invalid: invalidPermissions
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Todas as permissões são válidas');

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
        .upsert(userPermissions, { onConflict: 'user_id,permission_id', ignoreDuplicates: true });

      if (permError) {
        console.error('❌ Erro ao inserir permissões:', permError);
        throw permError;
      }

      // Validação pós-inserção
      const { count } = await supabaseAdmin
        .from('user_permissions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', existingUser.id);

      if ((count ?? 0) < permissions.length) {
        console.error(`⚠️ Esperado ao menos ${permissions.length} permissões, encontrado ${count}`);
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
    
    // 🔄 Criar o usuário no Supabase Auth
    // Nota: Agora permitimos múltiplos profiles com o mesmo email
    // O trigger handle_new_user() criará automaticamente um novo profile
    // mesmo que já exista um profile "operacional" com este email
    console.log('🔄 Criando usuário no Supabase Auth...');
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
        .upsert(userPermissions, { onConflict: 'user_id,permission_id', ignoreDuplicates: true });

      if (permError) {
        console.error('❌ Erro ao inserir permissões:', permError);
        throw permError;
      }

      // Validação pós-inserção
      const { count } = await supabaseAdmin
        .from('user_permissions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', authData.user!.id);

      if ((count ?? 0) < permissions.length) {
        console.error(`⚠️ Esperado ao menos ${permissions.length} permissões, encontrado ${count}`);
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

  } catch (error: unknown) {
    console.error('Erro na edge function:', error);

    interface ErrorPayload {
      error: string;
      message?: string;
      code?: string;
      details?: string;
    }

    const payload: ErrorPayload = {
      error: 'Erro interno ao criar operador',
    };

    // Extrair detalhes do erro Supabase
    if (error && typeof error === 'object') {
      if ('message' in error) payload.message = String((error as Record<string, unknown>).message);
      if ('code' in error) payload.code = String((error as Record<string, unknown>).code);
      if ('details' in error) payload.details = String((error as Record<string, unknown>).details);
    }

    return new Response(
      JSON.stringify(payload),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
