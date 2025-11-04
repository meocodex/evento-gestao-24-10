import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { alocacaoId } = await req.json();

    if (!alocacaoId) {
      return new Response(
        JSON.stringify({ 
          podeRemover: false, 
          motivo: 'ID da alocação não fornecido' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Buscar dados do material e evento
    const { data: material, error: fetchError } = await supabaseClient
      .from('eventos_materiais_alocados')
      .select(`
        *,
        eventos!inner (
          data_inicio,
          hora_inicio,
          status
        )
      `)
      .eq('id', alocacaoId)
      .single();

    if (fetchError) {
      console.error('Erro ao buscar material:', fetchError);
      return new Response(
        JSON.stringify({ 
          podeRemover: false, 
          motivo: 'Material não encontrado' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Validações
    const evento = material.eventos;
    const dataHoraEvento = new Date(`${evento.data_inicio}T${evento.hora_inicio}`);
    const agora = new Date();

    // 1. Verificar se evento já iniciou
    if (dataHoraEvento <= agora) {
      return new Response(
        JSON.stringify({ 
          podeRemover: false, 
          motivo: 'Não é possível remover materiais de eventos já iniciados' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // 2. Verificar se está vinculado a frete
    if (material.envio_id) {
      return new Response(
        JSON.stringify({ 
          podeRemover: false, 
          motivo: 'Não é possível remover material vinculado a frete. Remova o frete primeiro.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // 3. Verificar se já foi devolvido
    if (material.status_devolucao !== 'pendente') {
      return new Response(
        JSON.stringify({ 
          podeRemover: false, 
          motivo: 'Não é possível remover material já devolvido' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // 4. Verificar status do evento
    if (!['orcamento', 'confirmado'].includes(evento.status)) {
      return new Response(
        JSON.stringify({ 
          podeRemover: false, 
          motivo: 'Não é possível remover materiais de eventos em andamento ou concluídos' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Todas as validações passaram
    return new Response(
      JSON.stringify({ 
        podeRemover: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Erro na validação:', error);
    return new Response(
      JSON.stringify({ 
        podeRemover: false, 
        motivo: error.message || 'Erro ao validar remoção' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
