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
      const { data: configUserData, error: configUserError } = await supabaseAdmin
        .from('configuracoes_usuario')
        .delete()
        .eq('user_id', user_id)
        .select();
      
      if (configUserError) {
        console.error('⚠️ Erro ao limpar configuracoes_usuario:', configUserError);
      } else {
        const configUserCount = configUserData?.length || 0;
        if (configUserCount > 0) console.log(`✅ Removidas ${configUserCount} configurações de usuário`);
        cleanupCount += configUserCount;
      }
      
      // 5. Limpar profile
      const { data: profileData, error: profileCleanError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', user_id)
        .select();
      
      if (profileCleanError) {
        console.error('⚠️ Erro ao limpar profile:', profileCleanError);
      } else {
        const profileCount = profileData?.length || 0;
        if (profileCount > 0) console.log(`✅ Removido ${profileCount} profile`);
        cleanupCount += profileCount;
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
    let cleanupCount = 0;
    
    // Limpar user_permissions
    const { data: permDefData, error: permDefError } = await supabaseAdmin
      .from('user_permissions')
      .delete()
      .eq('user_id', user_id)
      .select();
    
    if (!permDefError && permDefData) {
      const permCount = permDefData.length;
      if (permCount > 0) console.log(`🧹 Limpeza defensiva: ${permCount} permissions removidas`);
      cleanupCount += permCount;
    }
    
    // Limpar user_roles
    const { data: roleDefData, error: roleDefError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', user_id)
      .select();
    
    if (!roleDefError && roleDefData) {
      const roleCount = roleDefData.length;
      if (roleCount > 0) console.log(`🧹 Limpeza defensiva: ${roleCount} roles removidas`);
      cleanupCount += roleCount;
    }
    
    // Limpar configuracoes_categorias
    const { data: configCatDefData, error: configCatDefError } = await supabaseAdmin
      .from('configuracoes_categorias')
      .delete()
      .eq('user_id', user_id)
      .select();
    
    if (!configCatDefError && configCatDefData) {
      const configCatCount = configCatDefData.length;
      if (configCatCount > 0) console.log(`🧹 Limpeza defensiva: ${configCatCount} configurações de categorias removidas`);
      cleanupCount += configCatCount;
    }
    
    // Limpar configuracoes_usuario
    const { data: configUserDefData, error: configUserDefError } = await supabaseAdmin
      .from('configuracoes_usuario')
      .delete()
      .eq('user_id', user_id)
      .select();
    
    if (!configUserDefError && configUserDefData) {
      const configUserCount = configUserDefData.length;
      if (configUserCount > 0) console.log(`🧹 Limpeza defensiva: ${configUserCount} configurações de usuário removidas`);
      cleanupCount += configUserCount;
    }
    
    // Limpar profile
    const { data: profileDefData, error: profileDefError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user_id)
      .select();
    
    if (!profileDefError && profileDefData) {
      const profileCount = profileDefData.length;
      if (profileCount > 0) console.log(`🧹 Limpeza defensiva: ${profileCount} profile removido`);
      cleanupCount += profileCount;
    }

    console.log(`✅ Exclusão concluída para ${user_id}: ${cleanupCount} registros limpos`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usuário excluído com sucesso',
        cleaned_records: cleanupCount,
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
