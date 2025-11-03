import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const agora = new Date();
    const dataAtual = agora.toISOString().split('T')[0];
    const horaAtual = agora.toTimeString().split(' ')[0].substring(0, 5);

    console.log('[Verificação de Status] Iniciando verificação automática', { dataAtual, horaAtual });

    // 1. INICIAR eventos (status confirmado/em_preparacao e passou da hora)
    const { data: eventosParaIniciar } = await supabase
      .from('eventos')
      .select('id, nome, data_inicio, hora_inicio')
      .in('status', ['confirmado', 'em_preparacao'])
      .eq('arquivado', false)
      .lte('data_inicio', dataAtual)
      .lte('hora_inicio', horaAtual);

    for (const evento of eventosParaIniciar || []) {
      console.log('[Iniciando Evento]', evento.nome);
      
      await supabase
        .from('eventos')
        .update({ status: 'em_execucao' })
        .eq('id', evento.id);

      await supabase.from('eventos_timeline').insert({
        evento_id: evento.id,
        tipo: 'execucao',
        descricao: 'Evento iniciado automaticamente',
        usuario: 'Sistema Automático'
      });
    }

    // 2. CONCLUIR eventos (status em_execucao e passou do horário de fim)
    const { data: eventosParaConcluir } = await supabase
      .from('eventos')
      .select('id, nome, data_fim, hora_fim')
      .eq('status', 'em_execucao')
      .eq('arquivado', false)
      .lte('data_fim', dataAtual)
      .lte('hora_fim', horaAtual);

    for (const evento of eventosParaConcluir || []) {
      console.log('[Concluindo Evento]', evento.nome);
      
      await supabase
        .from('eventos')
        .update({ status: 'concluido' })
        .eq('id', evento.id);

      await supabase.from('eventos_timeline').insert({
        evento_id: evento.id,
        tipo: 'fechamento',
        descricao: 'Evento concluído automaticamente - Aguardando devolução de materiais',
        usuario: 'Sistema Automático'
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        eventosIniciados: eventosParaIniciar?.length || 0,
        eventosConcluidos: eventosParaConcluir?.length || 0,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Erro na Verificação]', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
