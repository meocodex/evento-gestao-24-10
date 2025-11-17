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

  // Log para confirmar uso do SERVICE_ROLE_KEY
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  console.log('🔑 Using SERVICE_ROLE_KEY:', serviceRoleKey?.substring(0, 20) + '...');

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
    const { data: hasAdmin, error: adminCheckError } = await supabaseAdmin
      .rpc('has_permission', { 
        _user_id: user.id, 
        _permission_id: 'admin.full_access' 
      });

    if (adminCheckError || !hasAdmin) {
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
      console.log(`⚠️ Usuário ${user_id} já foi excluído do auth, limpando registros relacionados...`);
      
      let cleanupCount = 0;
      
      // 1. Limpar user_permissions
      const { data: permData, error: permCleanError } = await supabaseAdmin
        .from('user_permissions')
        .delete()
        .eq('user_id', user_id)
        .select();
      
      if (permCleanError) {
        console.error('⚠️ Erro ao limpar permissions:', permCleanError);
      } else {
        const permCount = permData?.length || 0;
        if (permCount > 0) console.log(`✅ Removidas ${permCount} permissions`);
        cleanupCount += permCount;
      }
      
      // 2. Limpar user_roles
      const { data: roleData, error: roleCleanError } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', user_id)
        .select();
      
      if (roleCleanError) {
        console.error('⚠️ Erro ao limpar roles:', roleCleanError);
      } else {
        const roleCount = roleData?.length || 0;
        if (roleCount > 0) console.log(`✅ Removidas ${roleCount} roles`);
        cleanupCount += roleCount;
      }
      
      // 3. Limpar configuracoes_categorias
      const { data: configCatData, error: configCatError } = await supabaseAdmin
        .from('configuracoes_categorias')
        .delete()
        .eq('user_id', user_id)
        .select();
      
      if (configCatError) {
        console.error('⚠️ Erro ao limpar configuracoes_categorias:', configCatError);
      } else {
        const configCatCount = configCatData?.length || 0;
        if (configCatCount > 0) console.log(`✅ Removidas ${configCatCount} configurações de categorias`);
        cleanupCount += configCatCount;
      }
      
      // 4. Limpar configuracoes_usuario
      console.log(`🔍 Limpando configuracoes_usuario para ${user_id}...`);
      const { data: configUserData, error: configUserError } = await supabaseAdmin
        .from('configuracoes_usuario')
        .delete()
        .eq('user_id', user_id)
        .select();
      
      if (configUserError) {
        console.error('❌ Erro ao limpar configuracoes_usuario:', configUserError);
      } else {
        const configUserCount = configUserData?.length || 0;
        console.log(`✅ Removidas ${configUserCount} configurações de usuário`);
        cleanupCount += configUserCount;
      }
      
      // 5. Limpar notificacoes
      console.log(`🔍 Limpando notificacoes para ${user_id}...`);
      const { data: notifData, error: notifError } = await supabaseAdmin
        .from('notificacoes')
        .delete()
        .eq('user_id', user_id)
        .select();
      
      if (notifError) {
        console.error('❌ Erro ao limpar notificacoes:', notifError);
      } else {
        const notifCount = notifData?.length || 0;
        if (notifCount > 0) {
          console.log(`✅ Removidas ${notifCount} notificações`);
          cleanupCount += notifCount;
        }
      }
      
      // 6. Limpar profiles
      console.log(`🔍 Tentando deletar profile ${user_id}...`);
      try {
        const { data: profileData, error: profileCleanError} = await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('id', user_id)
          .select();
        
        console.log(`📊 Profile delete result:`, {
          data: profileData,
          error: profileCleanError,
          count: profileData?.length || 0
        });
        
        if (profileCleanError) {
          console.error('❌ ERRO DETALHADO ao limpar profile:', {
            message: profileCleanError.message,
            details: profileCleanError.details,
            hint: profileCleanError.hint,
            code: profileCleanError.code
          });
        } else {
          const profileCount = profileData?.length || 0;
          if (profileCount > 0) {
            console.log(`✅ Removido ${profileCount} profile`);
          } else {
            console.warn(`⚠️ Delete executado mas 0 profiles removidos!`);
          }
          cleanupCount += profileCount;
        }
      } catch (err) {
        console.error('💥 EXCEÇÃO ao deletar profile:', err);
      }
      
      console.log(`✅ Limpeza concluída para ${user_id}: ${cleanupCount} registros removidos`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Registros relacionados removidos com sucesso',
          cleaned_records: cleanupCount,
          user_id
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

    // Excluir usuário do Auth
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);

    if (error) {
      console.error('❌ Erro ao excluir usuário:', error);
      throw error;
    }

    console.log(`✅ Usuário ${user_id} excluído do auth`);

    // Limpeza defensiva: remover registros relacionados mesmo após exclusão
    console.log(`🧹 Executando limpeza defensiva para ${user_id}...`);
    
    // Limpar user_permissions
    console.log(`🔍 Limpeza defensiva: user_permissions...`);
    const { data: permDefData } = await supabaseAdmin
      .from('user_permissions')
      .delete()
      .eq('user_id', user_id)
      .select();
    console.log(`📊 Defensivo: ${permDefData?.length || 0} user_permissions removidas`);
    
    // Limpar user_roles
    console.log(`🔍 Limpeza defensiva: user_roles...`);
    const { data: roleDefData } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', user_id)
      .select();
    console.log(`📊 Defensivo: ${roleDefData?.length || 0} user_roles removidas`);
    
    // Limpar configuracoes_categorias
    console.log(`🔍 Limpeza defensiva: configuracoes_categorias...`);
    const { data: configCatDefData } = await supabaseAdmin
      .from('configuracoes_categorias')
      .delete()
      .eq('user_id', user_id)
      .select();
    console.log(`📊 Defensivo: ${configCatDefData?.length || 0} configuracoes_categorias removidas`);
    
    // Limpar configuracoes_usuario
    console.log(`🔍 Limpeza defensiva: configuracoes_usuario...`);
    const { data: configUserDefData } = await supabaseAdmin
      .from('configuracoes_usuario')
      .delete()
      .eq('user_id', user_id)
      .select();
    console.log(`📊 Defensivo: ${configUserDefData?.length || 0} configuracoes_usuario removidas`);
    
    // Limpar notificacoes
    console.log(`🔍 Limpeza defensiva: notificacoes...`);
    const { data: notifDefData } = await supabaseAdmin
      .from('notificacoes')
      .delete()
      .eq('user_id', user_id)
      .select();
    console.log(`📊 Defensivo: ${notifDefData?.length || 0} notificacoes removidas`);
    
    // Limpar profiles
    console.log(`🔍 Limpeza defensiva: profiles...`);
    try {
      const { data: profileDefData, error: profileDefError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', user_id)
        .select();

      if (profileDefError) {
        console.error('❌ ERRO DETALHADO na limpeza defensiva do profile:', {
          message: profileDefError.message,
          details: profileDefError.details,
          hint: profileDefError.hint,
          code: profileDefError.code
        });
      } else {
        console.log(`📊 Defensivo: ${profileDefData?.length || 0} profiles removidos`);
      }
    } catch (err) {
      console.error('💥 EXCEÇÃO na limpeza defensiva do profile:', err);
    }

    console.log(`✅ Exclusão concluída para ${user_id} com limpeza defensiva`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usuário excluído com sucesso',
        user_id
      }),
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
