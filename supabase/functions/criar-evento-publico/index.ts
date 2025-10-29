import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validação de CPF
function validarCPF(cpf: string): boolean {
  const cpfLimpo = cpf.replace(/\D/g, '');
  
  if (cpfLimpo.length !== 11 || /^(\d)\1+$/.test(cpfLimpo)) {
    return false;
  }

  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;

  return true;
}

// Validação de CNPJ
function validarCNPJ(cnpj: string): boolean {
  const cnpjLimpo = cnpj.replace(/\D/g, '');
  
  if (cnpjLimpo.length !== 14 || /^(\d)\1+$/.test(cnpjLimpo)) {
    return false;
  }

  let tamanho = cnpjLimpo.length - 2;
  let numeros = cnpjLimpo.substring(0, tamanho);
  const digitos = cnpjLimpo.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = cnpjLimpo.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;

  return true;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    const {
      produtor,
      evento,
      configuracaoIngresso,
      configuracaoBar,
    } = body;

    console.log('Iniciando criação de evento público para:', produtor.nome);

    // 1. Limpar e validar documento
    const documentoLimpo = produtor.documento.replace(/\D/g, '');

    // Validação do documento
    if (produtor.tipo === 'CPF' && !validarCPF(documentoLimpo)) {
      console.error('CPF inválido:', documentoLimpo);
      return new Response(
        JSON.stringify({ success: false, error: 'CPF inválido' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    if (produtor.tipo === 'CNPJ' && !validarCNPJ(documentoLimpo)) {
      console.error('CNPJ inválido:', documentoLimpo);
      return new Response(
        JSON.stringify({ success: false, error: 'CNPJ inválido' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // 2. Buscar cliente existente por documento
    const { data: clienteExistente, error: searchError } = await supabase
      .from('clientes')
      .select('id, nome, email, telefone')
      .eq('documento', documentoLimpo)
      .maybeSingle();

    if (searchError) {
      console.error('Erro ao buscar cliente:', searchError);
      throw new Error('Erro ao verificar cadastro');
    }

    let clienteId: string;
    let clienteStatus: 'novo' | 'existente';

    if (clienteExistente) {
      // Cliente já existe
      clienteId = clienteExistente.id;
      clienteStatus = 'existente';
      
      console.log(`Cliente existente encontrado: ${clienteExistente.nome} (${documentoLimpo})`);
      
      // Atualizar dados do cliente se houver mudanças
      const { error: updateError } = await supabase
        .from('clientes')
        .update({
          telefone: produtor.telefone.replace(/\D/g, ''),
          whatsapp: produtor.whatsapp?.replace(/\D/g, ''),
          email: produtor.email,
          endereco: {
            cep: produtor.endereco.cep.replace(/\D/g, ''),
            logradouro: produtor.endereco.logradouro,
            numero: produtor.endereco.numero,
            complemento: produtor.endereco.complemento || '',
            bairro: produtor.endereco.bairro,
            cidade: produtor.endereco.cidade,
            estado: produtor.endereco.estado,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', clienteId);

      if (updateError) {
        console.error('Erro ao atualizar cliente:', updateError);
      }
      
    } else {
      // Cliente novo
      clienteStatus = 'novo';
      
      const { data: novoCliente, error: insertError } = await supabase
        .from('clientes')
        .insert({
          nome: produtor.nome,
          tipo: produtor.tipo,
          documento: documentoLimpo,
          email: produtor.email,
          telefone: produtor.telefone.replace(/\D/g, ''),
          whatsapp: produtor.whatsapp?.replace(/\D/g, ''),
          endereco: {
            cep: produtor.endereco.cep.replace(/\D/g, ''),
            logradouro: produtor.endereco.logradouro,
            numero: produtor.endereco.numero,
            complemento: produtor.endereco.complemento || '',
            bairro: produtor.endereco.bairro,
            cidade: produtor.endereco.cidade,
            estado: produtor.endereco.estado,
          },
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Erro ao criar cliente:', insertError);
        throw new Error('Erro ao cadastrar cliente');
      }
      
      clienteId = novoCliente.id;
      console.log(`Novo cliente criado: ${produtor.nome} (${documentoLimpo})`);
    }

    // 3. Criar evento associado ao cliente
    const { data: novoEvento, error: eventoError } = await supabase
      .from('eventos')
      .insert({
        nome: evento.nome,
        tipo_evento: evento.tipoEvento,
        data_inicio: evento.dataInicio,
        data_fim: evento.dataFim,
        hora_inicio: evento.horaInicio,
        hora_fim: evento.horaFim,
        local: evento.local,
        endereco: evento.endereco,
        cidade: evento.cidade,
        estado: evento.estado,
        cliente_id: clienteId,
        status: 'orcamento',
        configuracao_ingresso: configuracaoIngresso || null,
        configuracao_bar: configuracaoBar || null,
        observacoes: evento.observacoes,
        tags: ['cadastro-publico'],
      })
      .select('id')
      .single();

    if (eventoError) {
      console.error('Erro ao criar evento:', eventoError);
      throw new Error('Erro ao criar evento');
    }

    console.log(`Evento criado com sucesso: ${evento.nome} (ID: ${novoEvento.id})`);

    // 4. Criar registro de tracking em cadastros_publicos
    const protocolo = `EVT-${Date.now().toString(36).toUpperCase()}`;
    
    const { error: trackingError } = await supabase
      .from('cadastros_publicos')
      .insert({
        protocolo,
        evento_id: novoEvento.id,
        nome: evento.nome,
        tipo_evento: evento.tipoEvento,
        data_inicio: evento.dataInicio,
        data_fim: evento.dataFim,
        hora_inicio: evento.horaInicio,
        hora_fim: evento.horaFim,
        local: evento.local,
        endereco: evento.endereco,
        cidade: evento.cidade,
        estado: evento.estado,
        produtor: {
          nome: produtor.nome,
          documento: produtor.documento,
          email: produtor.email,
          telefone: produtor.telefone,
        },
        configuracao_ingresso: configuracaoIngresso || null,
        configuracao_bar: configuracaoBar || null,
        status: 'aprovado',
      });

    if (trackingError) {
      console.error('Erro ao criar registro de tracking:', trackingError);
    }

    // 5. Criar entrada na timeline do evento
    const { error: timelineError } = await supabase
      .from('eventos_timeline')
      .insert({
        evento_id: novoEvento.id,
        tipo: 'criacao',
        usuario: produtor.nome,
        descricao: 'Evento criado via cadastro público',
        data: new Date().toISOString(),
      });

    if (timelineError) {
      console.error('Erro ao criar timeline:', timelineError);
    }

    const mensagem = clienteStatus === 'existente'
      ? `Bem-vindo de volta, ${produtor.nome}! Seu novo evento foi registrado com sucesso.`
      : 'Cadastro realizado com sucesso! Em breve nossa equipe comercial entrará em contato.';

    console.log(`Processo concluído. Protocolo: ${protocolo}, Status cliente: ${clienteStatus}`);

    return new Response(
      JSON.stringify({
        success: true,
        protocolo,
        eventoId: novoEvento.id,
        clienteId,
        clienteStatus,
        mensagem,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    );

  } catch (error) {
    console.error('Erro ao criar evento público:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
